/**
 * Leonardo AI - Main Entry Point
 *
 * Self-learning AI orchestration system with RL and RAG capabilities
 */

// RL Module
export * from './rl';

// RAG Module
export * from './rag';

// Bridge Layer (Integration with external systems)
export * from './bridge';

// Meta-Learning Module
export * from './meta-learning';

// TODO: Core Module (Corpus Callosum integration)
// export * from './core';

// Examples
export { runExample } from './example';
export { runIntegrationExample } from './integration-example';
export { runBridgeExample } from './bridge-example';
export { runMetaLearningExample } from './meta-learning-example';
