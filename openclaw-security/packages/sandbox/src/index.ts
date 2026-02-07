/**
 * OpenClaw Sandbox - Public API
 *
 * Secure skill execution environment for OpenClaw CLI
 *
 * @example
 * ```typescript
 * import { SkillSandbox } from '@openclaw/sandbox';
 *
 * const sandbox = new SkillSandbox({
 *   timeout: 5000,
 *   maxMemory: 50 * 1024 * 1024,
 *   allowedDomains: ['api.example.com']
 * });
 *
 * const result = await sandbox.execute(skillCode, {
 *   sessionId: 'abc123',
 *   userId: 'user456',
 *   args: { input: 'test' },
 *   config: {},
 *   metadata: {
 *     skillName: 'my-skill',
 *     skillVersion: '1.0.0',
 *     author: 'developer'
 *   }
 * });
 *
 * if (result.success) {
 *   console.log('Result:', result.result);
 *   console.log('Metrics:', result.metrics);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 */

// Main sandbox class
export { SkillSandbox } from './sandbox.js';

// Resource monitoring
export { ResourceMonitor } from './resource-monitor.js';

// Type definitions
export type {
  SkillContext,
  SkillResult,
  ResourceMetrics,
  ResourceLimits,
  AllowedAPIs,
  SandboxConfig,
  AuditLogEvent
} from './types.js';

// Error classes
export {
  SandboxViolationError,
  ResourceLimitError
} from './types.js';

/**
 * Package version
 */
export const VERSION = '0.1.0';
