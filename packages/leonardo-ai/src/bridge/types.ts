/**
 * Bridge Layer Types
 *
 * Types for integration between Leonardo AI and external systems
 * (Orchestrator Kit, OpenClaw Meta-Agents).
 */

import { State, Action } from '../rl/types';

/**
 * System types that Leonardo AI can bridge with
 */
export enum SystemType {
  ORCHESTRATOR = 'orchestrator',
  OPENCLAW = 'openclaw',
}

/**
 * Bridge action recommendation
 */
export interface BridgeActionRecommendation {
  action: Action;
  confidence: number;
  reasoning: string;
  alternatives: Action[];
  estimatedOutcome: {
    successProbability: number;
    estimatedDuration: number;  // ms
    expectedReward: number;
  };
}

/**
 * Context from Orchestrator Kit
 */
export interface OrchestratorContext {
  tenantId: string;
  userId: string;
  task: {
    id: string;
    type: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    deadline?: number;
  };
  constraints: {
    timeLimit?: number;
    budgetLimit?: number;
    qualityThreshold?: number;
  };
  resources: {
    available: string[];
    allocated: string[];
  };
}

/**
 * Action for Orchestrator
 */
export interface OrchestratorAction {
  type: string;
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    type: string;
    confidence: number;
    tradeoffs: string;
  }>;
  estimatedImpact: {
    timeToComplete: number;
    resourcesNeeded: string[];
    successProbability: number;
  };
  nextSteps: string[];
}

/**
 * Context from OpenClaw Meta-Agents
 */
export interface OpenClawContext {
  task: {
    id: string;
    type: string;
    name: string;
    description: string;
    complexity: number;
    priority: string;
  };
  availableAgents: Array<{
    id: string;
    type: string;
    capabilities: string[];
    currentLoad: number;
    performance: number;
  }>;
  decompositionRequired: boolean;
  currentStrategy?: string;
}

/**
 * Agent recommendation for OpenClaw
 */
export interface AgentRecommendation {
  recommendedAgents: Array<{
    agentId: string;
    confidence: number;
    reasoning: string;
  }>;
  decomposition?: {
    shouldDecompose: boolean;
    suggestedSubtasks: Array<{
      name: string;
      description: string;
      estimatedComplexity: number;
      requiredCapabilities: string[];
    }>;
    executionMode: 'sequential' | 'parallel' | 'mixed';
  };
  priority: number;
  routing: {
    strategy: 'round-robin' | 'least-loaded' | 'capability-based' | 'priority-based';
    reasoning: string;
  };
}

/**
 * Feedback from external system
 */
export interface SystemFeedback {
  systemType: SystemType;
  task: string;
  state: State;
  action: Action;
  reward: number;
  nextState: State;
  done: boolean;
  success: boolean;
  metadata: {
    duration: number;
    resourcesUsed: string[];
    errors?: string[];
    quality?: number;
  };
}

/**
 * Knowledge from RAG query
 */
export interface KnowledgeContext {
  query: string;
  results: Array<{
    content: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  summary: string;
  relevance: number;
}

/**
 * Bridge statistics
 */
export interface BridgeStatistics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  bySystemType: Map<SystemType, {
    requests: number;
    successRate: number;
    avgResponseTime: number;
  }>;
  feedbackReceived: number;
  learningIterations: number;
}
