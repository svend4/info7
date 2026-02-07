/**
 * OpenClaw Meta-Agents
 *
 * Hierarchical multi-agent orchestration system
 */

// Types
export * from './types';

// Core
export * from './core/task-manager';
export * from './core/base-agent';

// Coordinator
export * from './coordinator/meta-agent-coordinator';
export * from './coordinator/task-decomposer';
export * from './coordinator/agent-selector';

// Specialized Agents
export * from './agents/legal-agent';
export * from './agents/medical-agent';
export * from './agents/finance-agent';

// Examples
export { runExample } from './example';
export { runIntegrationExample } from './integration-example';
