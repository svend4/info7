/**
 * OpenClaw Meta-Agents - Types
 *
 * Type definitions for hierarchical multi-agent system
 */

/**
 * Agent hierarchy levels
 */
export enum AgentLevel {
  META = 3,        // Meta-Agent Coordinator
  SPECIALIZED = 2, // Specialized domain agents
  EXECUTOR = 1,    // Task executors
}

/**
 * Task status
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Task priority
 */
export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

/**
 * Base task definition
 */
export interface Task {
  /** Unique task ID */
  id: string;

  /** Task description */
  description: string;

  /** Task type/category */
  type: string;

  /** Task priority */
  priority: TaskPriority;

  /** Current status */
  status: TaskStatus;

  /** Parent task ID (if subtask) */
  parentId?: string;

  /** Subtasks */
  subtasks: Task[];

  /** Task metadata */
  metadata: {
    createdAt: number;
    updatedAt: number;
    startedAt?: number;
    completedAt?: number;
    estimatedDuration?: number;
    actualDuration?: number;
    [key: string]: any;
  };

  /** Task requirements */
  requirements?: {
    skills?: string[];
    resources?: string[];
    dependencies?: string[];
  };

  /** Task result (when completed) */
  result?: TaskResult;
}

/**
 * Task result
 */
export interface TaskResult {
  /** Success status */
  success: boolean;

  /** Result data */
  data?: any;

  /** Error information (if failed) */
  error?: {
    message: string;
    code?: string;
    details?: any;
  };

  /** Execution metrics */
  metrics?: {
    duration: number;
    resourcesUsed: Record<string, number>;
    apiCalls: number;
    cost: number;
  };

  /** Output artifacts */
  artifacts?: Array<{
    type: string;
    name: string;
    content: any;
  }>;
}

/**
 * Agent capability
 */
export interface AgentCapability {
  /** Capability name */
  name: string;

  /** Description */
  description: string;

  /** Supported task types */
  taskTypes: string[];

  /** Required skills */
  skills: string[];

  /** Estimated proficiency (0-1) */
  proficiency: number;
}

/**
 * Base agent definition
 */
export interface Agent {
  /** Unique agent ID */
  id: string;

  /** Agent name */
  name: string;

  /** Agent level in hierarchy */
  level: AgentLevel;

  /** Agent type/specialization */
  type: string;

  /** Agent capabilities */
  capabilities: AgentCapability[];

  /** Agent status */
  status: 'idle' | 'busy' | 'offline';

  /** Current workload */
  workload: {
    activeTasks: number;
    maxConcurrentTasks: number;
    utilizationRate: number;
  };

  /** Agent metadata */
  metadata: {
    createdAt: number;
    lastActiveAt: number;
    totalTasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
  };
}

/**
 * Meta-Agent Coordinator specific properties
 */
export interface MetaAgent extends Agent {
  level: AgentLevel.META;

  /** Managed specialized agents */
  specializedAgents: SpecializedAgent[];

  /** Coordination strategy */
  strategy: {
    taskDecomposition: 'automatic' | 'rule-based' | 'ml-based';
    agentSelection: 'round-robin' | 'load-based' | 'capability-based';
    parallelization: boolean;
  };
}

/**
 * Specialized Agent specific properties
 */
export interface SpecializedAgent extends Agent {
  level: AgentLevel.SPECIALIZED;

  /** Domain expertise */
  domain: string;

  /** Managed executor agents */
  executors: ExecutorAgent[];

  /** Learning capability */
  learning?: {
    enabled: boolean;
    experienceCount: number;
    lastTrainingAt?: number;
  };
}

/**
 * Executor Agent specific properties
 */
export interface ExecutorAgent extends Agent {
  level: AgentLevel.EXECUTOR;

  /** Associated skill/tool */
  skill: string;

  /** Execution configuration */
  config: {
    timeout: number;
    retries: number;
    sandbox: boolean;
  };
}

/**
 * Task decomposition result
 */
export interface DecompositionResult {
  /** Original task */
  originalTask: Task;

  /** Decomposed subtasks */
  subtasks: Task[];

  /** Execution plan */
  plan: {
    /** Sequential or parallel execution */
    mode: 'sequential' | 'parallel' | 'mixed';

    /** Execution steps */
    steps: Array<{
      taskIds: string[];
      dependencies: string[];
      estimatedDuration: number;
    }>;

    /** Total estimated duration */
    totalEstimatedDuration: number;
  };

  /** Agent assignments */
  assignments: Map<string, string>; // taskId -> agentId
}

/**
 * Agent selection criteria
 */
export interface SelectionCriteria {
  /** Required task type */
  taskType: string;

  /** Required skills */
  requiredSkills?: string[];

  /** Minimum proficiency */
  minProficiency?: number;

  /** Prefer agents with lower workload */
  preferLowLoad?: boolean;

  /** Prefer agents with higher success rate */
  preferHighSuccessRate?: boolean;
}

/**
 * Progress update
 */
export interface ProgressUpdate {
  /** Task ID */
  taskId: string;

  /** Progress percentage (0-100) */
  progress: number;

  /** Current step description */
  currentStep?: string;

  /** Estimated time remaining (ms) */
  estimatedTimeRemaining?: number;

  /** Intermediate results */
  intermediateResults?: any[];

  /** Timestamp */
  timestamp: number;
}

/**
 * Event types
 */
export enum EventType {
  TASK_CREATED = 'task_created',
  TASK_STARTED = 'task_started',
  TASK_PROGRESS = 'task_progress',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  AGENT_ASSIGNED = 'agent_assigned',
  AGENT_AVAILABLE = 'agent_available',
  AGENT_BUSY = 'agent_busy',
}

/**
 * System event
 */
export interface SystemEvent {
  /** Event type */
  type: EventType;

  /** Event payload */
  payload: any;

  /** Timestamp */
  timestamp: number;

  /** Source agent ID */
  sourceAgentId?: string;
}

/**
 * Communication message between agents
 */
export interface AgentMessage {
  /** Message ID */
  id: string;

  /** Sender agent ID */
  from: string;

  /** Recipient agent ID */
  to: string;

  /** Message type */
  type: 'task_assignment' | 'status_update' | 'result' | 'query' | 'command';

  /** Message payload */
  payload: any;

  /** Timestamp */
  timestamp: number;

  /** In response to message ID */
  inReplyTo?: string;
}

/**
 * Meta-Agent configuration
 */
export interface MetaAgentConfig {
  /** Max concurrent tasks */
  maxConcurrentTasks: number;

  /** Task decomposition strategy */
  decompositionStrategy: 'automatic' | 'rule-based' | 'ml-based';

  /** Agent selection strategy */
  selectionStrategy: 'round-robin' | 'load-based' | 'capability-based';

  /** Enable task parallelization */
  enableParallelization: boolean;

  /** Enable learning from experience */
  enableLearning: boolean;

  /** Task timeout (ms) */
  taskTimeout: number;

  /** Retry failed tasks */
  retryFailedTasks: boolean;

  /** Max retries */
  maxRetries: number;
}
