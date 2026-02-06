/**
 * OpenClaw Sandbox - Main Sandbox Implementation
 * Secure skill execution environment using VM2
 */

import { EventEmitter } from 'events';
import { VM } from 'vm2';
import { ResourceMonitor } from './resource-monitor.js';
import {
  SandboxConfig,
  SkillContext,
  SkillResult,
  AllowedAPIs,
  ResourceLimits,
  AuditLogEvent,
  SandboxViolationError
} from './types.js';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<SandboxConfig> = {
  timeout: 5000, // 5 seconds
  maxMemory: 50 * 1024 * 1024, // 50 MB
  maxCpuTime: 3000, // 3 seconds
  allowedDomains: [
    'api.openai.com',
    'api.anthropic.com',
    'api.github.com',
    'api.stripe.com'
  ],
  maxHttpRequests: 10,
  maxConsoleLogs: 100,
  auditLog: true,
  onAuditLog: () => {} // No-op by default
};

/**
 * SkillSandbox - Secure execution environment for OpenClaw skills
 *
 * Features:
 * - VM2-based code isolation
 * - Resource monitoring and limits
 * - API whitelisting
 * - Rate limiting
 * - Audit logging
 *
 * @example
 * ```typescript
 * const sandbox = new SkillSandbox({
 *   timeout: 5000,
 *   allowedDomains: ['api.example.com']
 * });
 *
 * const result = await sandbox.execute(skillCode, context);
 * console.log(result.success, result.result);
 * ```
 */
export class SkillSandbox extends EventEmitter {
  private config: Required<SandboxConfig>;
  private resourceLimits: ResourceLimits;
  private resourceMonitor: ResourceMonitor;
  private executionLogs: string[] = [];

  constructor(config: SandboxConfig = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.resourceLimits = {
      timeout: this.config.timeout,
      maxMemory: this.config.maxMemory,
      maxCpuTime: this.config.maxCpuTime,
      maxApiCalls: {
        http: this.config.maxHttpRequests,
        console: this.config.maxConsoleLogs
      }
    };

    this.resourceMonitor = new ResourceMonitor(this.resourceLimits);
  }

  /**
   * Execute skill code in sandboxed environment
   *
   * @param code - Skill JavaScript code to execute
   * @param context - Execution context with user data and config
   * @returns Promise resolving to execution result
   */
  async execute(code: string, context: SkillContext): Promise<SkillResult> {
    this.executionLogs = [];
    this.resourceMonitor.start();

    try {
      // Validate code before execution
      this.validateCode(code);

      // Create sandboxed APIs
      const sandbox = this.createSandboxAPIs(context);

      // Create VM2 instance with strict security settings
      const vm = new VM({
        timeout: this.config.timeout,
        sandbox,
        eval: false, // Block eval()
        wasm: false, // Block WebAssembly
        fixAsync: true
      });

      // Wrap code in async function
      const wrappedCode = `
        (async function(context) {
          'use strict';
          ${code}
        })(context)
      `;

      // Execute in VM
      this.auditLog({
        type: 'api_call',
        timestamp: new Date(),
        context,
        details: { api: 'execute', args: ['skill_code'] }
      });

      const result = await vm.run(wrappedCode, 'skill.js');
      const metrics = this.resourceMonitor.stop();

      return {
        success: true,
        result,
        metrics,
        logs: this.executionLogs
      };
    } catch (error) {
      const metrics = this.resourceMonitor.stop();

      this.auditLog({
        type: 'error',
        timestamp: new Date(),
        context,
        details: {
          error: error instanceof Error ? error.message : String(error)
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        errorDetails: error instanceof Error ? {
          type: error.name,
          message: error.message,
          stack: error.stack
        } : undefined,
        metrics,
        logs: this.executionLogs
      };
    }
  }

  /**
   * Validate code for obvious security issues
   */
  private validateCode(code: string): void {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /\beval\s*\(/i,
      /\bFunction\s*\(/i,
      /\brequire\s*\(/i,
      /\bimport\s+.*\s+from/i,
      /process\./i,
      /child_process/i,
      /__dirname/i,
      /__filename/i,
      /fs\./i,
      /readFileSync/i,
      /writeFileSync/i,
      /execSync/i,
      /\.constructor/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new SandboxViolationError(
          `Code contains dangerous pattern: ${pattern.source}`,
          'dangerous_code',
          { pattern: pattern.source }
        );
      }
    }

    // Check for excessively long code (potential DoS)
    if (code.length > 1024 * 1024) { // 1MB
      throw new SandboxViolationError(
        'Code size exceeds maximum allowed (1MB)',
        'code_too_large',
        { size: code.length }
      );
    }
  }

  /**
   * Create sandboxed API objects
   */
  private createSandboxAPIs(context: SkillContext): AllowedAPIs & { context: SkillContext } {
    return {
      context,
      console: this.createSafeConsole(),
      fetch: this.createSafeFetch(),
      setTimeout: this.createSafeSetTimeout(),
      setInterval: this.createSafeSetInterval(),
      clearTimeout: globalThis.clearTimeout,
      clearInterval: globalThis.clearInterval,
      Promise,
      JSON,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean
    };
  }

  /**
   * Create safe console with rate limiting
   */
  private createSafeConsole() {
    const logToArray = (level: string, ...args: unknown[]) => {
      try {
        this.resourceMonitor.recordApiCall('console', this.config.maxConsoleLogs);
        const message = `[${level.toUpperCase()}] ${args.map(a =>
          typeof a === 'object' ? JSON.stringify(a) : String(a)
        ).join(' ')}`;
        this.executionLogs.push(message);
      } catch (error) {
        // Rate limit exceeded - silently ignore additional logs
      }
    };

    return {
      log: (...args: unknown[]) => logToArray('info', ...args),
      warn: (...args: unknown[]) => logToArray('warn', ...args),
      error: (...args: unknown[]) => logToArray('error', ...args)
    };
  }

  /**
   * Create safe fetch with domain whitelisting and rate limiting
   */
  private createSafeFetch() {
    return async (url: string, options?: RequestInit): Promise<Response> => {
      // Check rate limit
      this.resourceMonitor.recordApiCall('http', this.config.maxHttpRequests);

      // Parse and validate URL
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        throw new SandboxViolationError(
          `Invalid URL: ${url}`,
          'invalid_url',
          { url }
        );
      }

      // Check domain whitelist
      if (!this.config.allowedDomains.includes(parsedUrl.hostname)) {
        throw new SandboxViolationError(
          `Domain not allowed: ${parsedUrl.hostname}`,
          'domain_not_allowed',
          {
            hostname: parsedUrl.hostname,
            allowedDomains: this.config.allowedDomains
          }
        );
      }

      // Enforce HTTPS
      if (parsedUrl.protocol !== 'https:') {
        throw new SandboxViolationError(
          'Only HTTPS requests are allowed',
          'https_required',
          { protocol: parsedUrl.protocol }
        );
      }

      this.auditLog({
        type: 'api_call',
        timestamp: new Date(),
        context: { sessionId: '', userId: '', args: {}, config: {}, metadata: { skillName: '', skillVersion: '', author: '' } },
        details: { api: 'fetch', args: [url, options] }
      });

      // Execute fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };
  }

  /**
   * Create safe setTimeout with rate limiting
   */
  private createSafeSetTimeout() {
    return (callback: () => void, ms: number): NodeJS.Timeout => {
      // Limit maximum timeout to execution timeout
      const limitedMs = Math.min(ms, this.config.timeout);
      return setTimeout(callback, limitedMs);
    };
  }

  /**
   * Create safe setInterval with rate limiting
   */
  private createSafeSetInterval() {
    return (callback: () => void, ms: number): NodeJS.Timeout => {
      // Limit minimum interval to prevent tight loops
      const limitedMs = Math.max(ms, 100);
      return setInterval(callback, limitedMs);
    };
  }

  /**
   * Log audit event
   */
  private auditLog(event: AuditLogEvent): void {
    if (!this.config.auditLog) return;

    this.emit('audit', event);

    if (this.config.onAuditLog) {
      this.config.onAuditLog(event);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<SandboxConfig>> {
    return { ...this.config };
  }

  /**
   * Update configuration (creates new resource monitor)
   */
  updateConfig(newConfig: Partial<SandboxConfig>): void {
    this.config = { ...this.config, ...newConfig };

    this.resourceLimits = {
      timeout: this.config.timeout,
      maxMemory: this.config.maxMemory,
      maxCpuTime: this.config.maxCpuTime,
      maxApiCalls: {
        http: this.config.maxHttpRequests,
        console: this.config.maxConsoleLogs
      }
    };

    this.resourceMonitor = new ResourceMonitor(this.resourceLimits);
  }
}
