/**
 * Leonardo AI - Reinforcement Learning Types
 *
 * Type definitions for the RL Optimization module
 */

/**
 * State representation in the RL environment
 * Captures current context, task info, and system state
 */
export interface State {
  /** Current task description */
  task: string;

  /** Task complexity (0-1 scale) */
  complexity: number;

  /** Available resources */
  resources: {
    orchestratorAvailable: boolean;
    openclawAvailable: boolean;
    externalAPIsAvailable: string[];
  };

  /** Historical context */
  history: {
    recentActions: Action[];
    recentRewards: number[];
    successRate: number;
  };

  /** User preferences */
  userContext?: {
    preferredMode?: 'fast' | 'balanced' | 'thorough';
    timeConstraint?: number; // seconds
    qualityThreshold?: number; // 0-1
  };

  /** System metrics */
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    queueLength: number;
  };

  /** Timestamp */
  timestamp: number;
}

/**
 * Action that Leonardo AI can take
 * Represents decision about which strategy and parameters to use
 */
export interface Action {
  /** Which operational mode to use */
  mode: 'thinking' | 'action' | 'iterative' | 'parallel' | 'creative';

  /** Strategy selection */
  strategy: {
    /** Use Orchestrator Kit for planning? */
    useOrchestrator: boolean;

    /** Use OpenClaw for execution? */
    useOpenclaw: boolean;

    /** Depth of analysis (1-5) */
    analysisDepth: number;

    /** Number of iterations (for iterative mode) */
    iterations?: number;

    /** Parallel branches (for parallel mode) */
    parallelBranches?: number;
  };

  /** Resource allocation */
  resources: {
    /** Max execution time (seconds) */
    timeout: number;

    /** Max memory (MB) */
    maxMemory: number;

    /** API call budget */
    maxAPICalls: number;
  };

  /** Timestamp */
  timestamp: number;
}

/**
 * Experience tuple for replay buffer
 * (state, action, reward, next_state, done)
 */
export interface Experience {
  state: State;
  action: Action;
  reward: number;
  nextState: State;
  done: boolean;
  timestamp: number;
}

/**
 * Reward components for multi-criteria optimization
 */
export interface RewardComponents {
  /** Task successfully completed? */
  taskSuccess: number; // 0 or 1

  /** Quality of result (0-1) */
  quality: number;

  /** Time efficiency (faster = better) */
  timeEfficiency: number; // 0-1

  /** Resource efficiency (less = better) */
  resourceEfficiency: number; // 0-1

  /** User satisfaction (if available) */
  userSatisfaction?: number; // 0-1

  /** Cost efficiency (cheaper = better) */
  costEfficiency: number; // 0-1
}

/**
 * Configuration for reward function
 */
export interface RewardConfig {
  /** Weights for each reward component */
  weights: {
    taskSuccess: number;
    quality: number;
    timeEfficiency: number;
    resourceEfficiency: number;
    userSatisfaction: number;
    costEfficiency: number;
  };

  /** Penalties */
  penalties: {
    timeout: number;
    error: number;
    resourceOveruse: number;
  };
}

/**
 * RL Policy - maps state to action probabilities
 */
export interface Policy {
  /** Get action probabilities for given state */
  getActionProbabilities(state: State): Promise<Map<Action, number>>;

  /** Sample action from policy */
  sampleAction(state: State): Promise<Action>;

  /** Update policy based on gradient */
  update(gradient: number[]): Promise<void>;
}

/**
 * Value function - estimates expected return from state
 */
export interface ValueFunction {
  /** Estimate value of state */
  estimateValue(state: State): Promise<number>;

  /** Estimate Q-value (state-action value) */
  estimateQValue(state: State, action: Action): Promise<number>;

  /** Update value function */
  update(state: State, target: number): Promise<void>;
}

/**
 * Exploration strategy configuration
 */
export interface ExplorationConfig {
  /** Exploration strategy type */
  strategy: 'epsilon-greedy' | 'ucb' | 'thompson-sampling';

  /** Initial exploration rate (for epsilon-greedy) */
  initialEpsilon?: number;

  /** Minimum exploration rate */
  minEpsilon?: number;

  /** Exploration decay rate */
  decayRate?: number;

  /** UCB exploration constant (for UCB) */
  ucbConstant?: number;
}

/**
 * RL Engine configuration
 */
export interface RLConfig {
  /** Learning rate */
  learningRate: number;

  /** Discount factor (gamma) */
  discountFactor: number;

  /** Replay buffer size */
  bufferSize: number;

  /** Batch size for training */
  batchSize: number;

  /** Exploration configuration */
  exploration: ExplorationConfig;

  /** Reward configuration */
  reward: RewardConfig;

  /** Update frequency (steps between updates) */
  updateFrequency: number;

  /** Target network update frequency */
  targetUpdateFrequency?: number;
}

/**
 * Training metrics
 */
export interface TrainingMetrics {
  /** Total steps */
  totalSteps: number;

  /** Episodes completed */
  episodes: number;

  /** Average reward (last 100 episodes) */
  averageReward: number;

  /** Success rate (last 100 episodes) */
  successRate: number;

  /** Average loss */
  averageLoss: number;

  /** Current exploration rate */
  explorationRate: number;

  /** Timestamp */
  timestamp: number;
}

/**
 * Action space definition
 */
export interface ActionSpace {
  /** All possible modes */
  modes: Action['mode'][];

  /** Analysis depth range */
  analysisDepthRange: [number, number];

  /** Timeout range (seconds) */
  timeoutRange: [number, number];

  /** Memory range (MB) */
  memoryRange: [number, number];

  /** API call budget range */
  apiCallRange: [number, number];
}

/**
 * Model checkpoint for saving/loading
 */
export interface ModelCheckpoint {
  /** Policy network weights */
  policyWeights: number[][];

  /** Value network weights */
  valueWeights: number[][];

  /** Training metrics */
  metrics: TrainingMetrics;

  /** Configuration */
  config: RLConfig;

  /** Timestamp */
  timestamp: number;

  /** Version */
  version: string;
}
