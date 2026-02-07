/**
 * Hierarchy Types
 *
 * 5-level hierarchical agent system for complex task orchestration.
 */

import { Task, TaskResult, AgentCapability } from '../core/types';

/**
 * Agent hierarchy levels
 */
export enum HierarchyLevel {
  META_META_AGENT = 5,    // Strategic planning and system optimization
  META_AGENT = 4,         // High-level coordination and resource allocation
  COORDINATOR = 3,        // Task distribution and progress monitoring
  SPECIALIST = 2,         // Domain-specific task execution
  WORKER = 1,             // Basic task execution
}

/**
 * Agent in the hierarchy
 */
export interface HierarchicalAgent {
  id: string;
  level: HierarchyLevel;
  capabilities: AgentCapability[];
  subordinates: string[];  // IDs of agents below in hierarchy
  supervisor?: string;     // ID of agent above in hierarchy
  status: 'idle' | 'busy' | 'unavailable';
  currentLoad: number;     // 0-1
  performance: {
    tasksCompleted: number;
    averageQuality: number;
    averageSpeed: number;
    successRate: number;
  };
  metadata: Record<string, any>;
}

/**
 * Task delegation decision
 */
export interface DelegationDecision {
  task: Task;
  targetAgent: HierarchicalAgent;
  reasoning: string;
  priority: number;
  deadline?: number;
  requiredResources: string[];
  dependencies: string[];  // Task IDs this task depends on
}

/**
 * Coordination strategy
 */
export enum CoordinationStrategy {
  SEQUENTIAL = 'sequential',        // Execute tasks one after another
  PARALLEL = 'parallel',            // Execute tasks simultaneously
  PIPELINE = 'pipeline',            // Execute in pipeline fashion
  HIERARCHICAL = 'hierarchical',    // Delegate to lower levels
  COLLABORATIVE = 'collaborative',  // Multiple agents work together
}

/**
 * Coordination plan
 */
export interface CoordinationPlan {
  task: Task;
  strategy: CoordinationStrategy;
  subtasks: Array<{
    id: string;
    task: Task;
    assignedTo: string;
    dependencies: string[];
    estimatedDuration: number;
  }>;
  executionOrder: string[];  // Subtask IDs in execution order
  resourceAllocation: Map<string, string[]>;  // Agent ID -> Resource IDs
  estimatedCompletion: number;
  contingencyPlans: Array<{
    trigger: string;
    action: string;
  }>;
}

/**
 * Collaboration request
 */
export interface CollaborationRequest {
  requesterId: string;
  targetAgents: string[];
  task: Task;
  collaborationType: 'knowledge-sharing' | 'joint-execution' | 'review' | 'consultation';
  urgency: 'low' | 'medium' | 'high';
  context: Record<string, any>;
}

/**
 * Collaboration response
 */
export interface CollaborationResponse {
  responderId: string;
  requestId: string;
  accepted: boolean;
  contribution?: {
    type: 'knowledge' | 'execution' | 'feedback' | 'resources';
    data: any;
  };
  availability: {
    canStart: number;  // Timestamp
    estimatedDuration: number;
  };
  conditions?: string[];
}

/**
 * Knowledge sharing
 */
export interface KnowledgeShare {
  sourceAgent: string;
  targetAgent: string;
  knowledge: {
    type: 'pattern' | 'strategy' | 'solution' | 'warning';
    domain: string;
    content: any;
    confidence: number;
    applicability: number;  // 0-1, how applicable to target's tasks
  };
  timestamp: number;
}

/**
 * Task decomposition result
 */
export interface TaskDecomposition {
  originalTask: Task;
  subtasks: Task[];
  decompositionStrategy: string;
  dependencies: Map<string, string[]>;  // Subtask ID -> Dependencies
  criticalPath: string[];  // Subtask IDs on critical path
  estimatedTotalDuration: number;
  confidence: number;
}

/**
 * Agent learning record
 */
export interface LearningRecord {
  agentId: string;
  timestamp: number;
  task: Task;
  result: TaskResult;
  insights: Array<{
    type: 'success' | 'failure' | 'optimization';
    description: string;
    actionable: boolean;
    recommendation?: string;
  }>;
  performanceChange: {
    before: number;
    after: number;
    improvement: number;
  };
  knowledgeAcquired: string[];
}

/**
 * Hierarchy performance metrics
 */
export interface HierarchyMetrics {
  byLevel: Map<HierarchyLevel, {
    agentCount: number;
    averageLoad: number;
    tasksCompleted: number;
    averageQuality: number;
    successRate: number;
  }>;
  delegation: {
    totalDelegations: number;
    averageDelegationTime: number;
    delegationSuccessRate: number;
    averageHierarchyDepth: number;
  };
  collaboration: {
    totalCollaborations: number;
    successfulCollaborations: number;
    averageTeamSize: number;
    knowledgeShares: number;
  };
  learning: {
    totalLearningEvents: number;
    averageImprovement: number;
    knowledgeBaseSize: number;
  };
  efficiency: {
    taskThroughput: number;
    resourceUtilization: number;
    bottleneckCount: number;
  };
}

/**
 * Hierarchy configuration
 */
export interface HierarchyConfig {
  maxAgentsPerLevel: Map<HierarchyLevel, number>;
  maxSubordinatesPerAgent: number;
  delegationThreshold: number;  // Complexity threshold for delegation
  collaborationEnabled: boolean;
  learningEnabled: boolean;
  knowledgeSharingEnabled: boolean;
  loadBalancingStrategy: 'round-robin' | 'least-loaded' | 'capability-based' | 'performance-based';
  failoverEnabled: boolean;
}

/**
 * Strategic directive from Meta-Meta-Agent
 */
export interface StrategicDirective {
  id: string;
  timestamp: number;
  directive: string;
  scope: 'system' | 'subsystem' | 'team' | 'individual';
  targetAgents: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  objectives: Array<{
    metric: string;
    target: number;
    deadline?: number;
  }>;
  constraints: Record<string, any>;
  rationale: string;
}

/**
 * Resource allocation
 */
export interface ResourceAllocation {
  resourceId: string;
  resourceType: string;
  allocatedTo: string;  // Agent ID
  quantity: number;
  startTime: number;
  endTime?: number;
  priority: number;
}

/**
 * Bottleneck detection
 */
export interface Bottleneck {
  location: string;  // Agent ID or subsystem
  type: 'capacity' | 'capability' | 'resource' | 'dependency';
  severity: number;  // 0-1
  impact: {
    affectedTasks: string[];
    estimatedDelay: number;
    cascadeEffect: number;
  };
  recommendations: Array<{
    action: string;
    expectedImprovement: number;
    cost: number;
  }>;
}

/**
 * Hierarchy state snapshot
 */
export interface HierarchyState {
  timestamp: number;
  agents: Map<string, HierarchicalAgent>;
  activeTasks: Map<string, {
    task: Task;
    assignedTo: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    progress: number;
  }>;
  delegations: DelegationDecision[];
  collaborations: CollaborationRequest[];
  learningRecords: LearningRecord[];
  bottlenecks: Bottleneck[];
  metrics: HierarchyMetrics;
}
