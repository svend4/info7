/**
 * OpenClaw Sandbox - Type Definitions
 * Security sandbox for skill execution with resource limits and API whitelisting
 */

/**
 * Skill execution context provided to sandboxed skills
 */
export interface SkillContext {
  /** Session identifier */
  sessionId: string;
  /** User identifier */
  userId: string;
  /** Input arguments for the skill */
  args: Record<string, unknown>;
  /** Configuration values */
  config: Record<string, unknown>;
  /** Skill metadata */
  metadata: {
    skillName: string;
    skillVersion: string;
    author: string;
  };
}

/**
 * Result returned from skill execution
 */
export interface SkillResult {
  /** Whether execution succeeded */
  success: boolean;
  /** Result data (if successful) */
  result?: unknown;
  /** Error message (if failed) */
  error?: string;
  /** Error details for debugging */
  errorDetails?: {
    type: string;
    message: string;
    stack?: string;
  };
  /** Resource usage metrics */
  metrics?: ResourceMetrics;
  /** Execution logs */
  logs?: string[];
}

/**
 * Resource usage metrics
 */
export interface ResourceMetrics {
  /** Execution time in milliseconds */
  executionTime: number;
  /** Memory used in bytes */
  memoryUsed: number;
  /** CPU time in milliseconds */
  cpuTime: number;
  /** Number of API calls made */
  apiCalls: {
    http: number;
    console: number;
    total: number;
  };
  /** Timestamp when execution started */
  startedAt: Date;
  /** Timestamp when execution ended */
  endedAt: Date;
}

/**
 * Resource limits for sandboxed execution
 */
export interface ResourceLimits {
  /** Maximum execution time in milliseconds */
  timeout: number;
  /** Maximum memory usage in bytes */
  maxMemory: number;
  /** Maximum CPU time in milliseconds */
  maxCpuTime: number;
  /** Maximum number of API calls per type */
  maxApiCalls: {
    http: number;
    console: number;
  };
}

/**
 * Allowed APIs available to sandboxed skills
 */
export interface AllowedAPIs {
  /** Safe console for logging */
  console: {
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  };
  /** Safe HTTP fetch with domain whitelisting */
  fetch: (url: string, options?: RequestInit) => Promise<Response>;
  /** Safe setTimeout with rate limiting */
  setTimeout: (callback: () => void, ms: number) => NodeJS.Timeout;
  /** Safe setInterval with rate limiting */
  setInterval: (callback: () => void, ms: number) => NodeJS.Timeout;
  /** clearTimeout */
  clearTimeout: (id: NodeJS.Timeout) => void;
  /** clearInterval */
  clearInterval: (id: NodeJS.Timeout) => void;
  /** Promise constructor */
  Promise: PromiseConstructor;
  /** JSON utilities */
  JSON: typeof JSON;
  /** Math utilities */
  Math: typeof Math;
  /** Date constructor */
  Date: typeof Date;
  /** Array constructor */
  Array: typeof Array;
  /** Object utilities */
  Object: typeof Object;
  /** String constructor */
  String: typeof String;
  /** Number constructor */
  Number: typeof Number;
  /** Boolean constructor */
  Boolean: typeof Boolean;
}

/**
 * Sandbox configuration options
 */
export interface SandboxConfig {
  /** Maximum execution timeout in milliseconds */
  timeout?: number;
  /** Maximum memory usage in bytes */
  maxMemory?: number;
  /** Maximum CPU time in milliseconds */
  maxCpuTime?: number;
  /** Allowed domains for HTTP requests */
  allowedDomains?: string[];
  /** Maximum HTTP requests per execution */
  maxHttpRequests?: number;
  /** Maximum console logs per execution */
  maxConsoleLogs?: number;
  /** Enable audit logging */
  auditLog?: boolean;
  /** Audit log callback */
  onAuditLog?: (event: AuditLogEvent) => void;
}

/**
 * Audit log event
 */
export interface AuditLogEvent {
  /** Event type */
  type: 'api_call' | 'resource_limit' | 'violation' | 'error';
  /** Event timestamp */
  timestamp: Date;
  /** Skill context */
  context: SkillContext;
  /** Event details */
  details: {
    api?: string;
    args?: unknown[];
    result?: unknown;
    error?: string;
    resourceType?: string;
    limit?: number;
    current?: number;
  };
}

/**
 * Sandbox violation error
 */
export class SandboxViolationError extends Error {
  constructor(
    message: string,
    public readonly violationType: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SandboxViolationError';
  }
}

/**
 * Resource limit exceeded error
 */
export class ResourceLimitError extends Error {
  constructor(
    message: string,
    public readonly resourceType: string,
    public readonly limit: number,
    public readonly current: number
  ) {
    super(message);
    this.name = 'ResourceLimitError';
  }
}
