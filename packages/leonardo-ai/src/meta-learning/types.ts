/**
 * Meta-Learning Types
 *
 * Types for the meta-learning system that learns to learn.
 */

import { Experience } from '../rl/types';

/**
 * Learning strategy types
 */
export enum StrategyType {
  STANDARD_RL = 'standard-rl',
  FAST_ADAPTATION = 'fast-adaptation',
  EXPLORATION_HEAVY = 'exploration-heavy',
  EXPLOITATION_FOCUSED = 'exploitation-focused',
  TRANSFER_LEARNING = 'transfer-learning',
  FEW_SHOT = 'few-shot',
}

/**
 * Task features for strategy selection
 */
export interface TaskFeatures {
  taskType: string;
  complexity: number;
  novelty: number;  // How different from previously seen tasks
  dataAvailability: number;  // How much training data is available
  timeConstraint: number;  // Time available for learning
  qualityRequirement: number;  // Required performance level
}

/**
 * Learning strategy configuration
 */
export interface StrategyConfig {
  type: StrategyType;
  learningRate: number;
  explorationRate: number;
  batchSize: number;
  updateFrequency: number;
  // Meta-learning specific
  adaptationSteps?: number;
  innerLearningRate?: number;
  transferSource?: string;
}

/**
 * Strategy performance metrics
 */
export interface StrategyPerformance {
  strategyType: StrategyType;
  taskType: string;
  successRate: number;
  averageReward: number;
  learningSpeed: number;  // Episodes to reach target performance
  sampleEfficiency: number;  // Performance per sample
  adaptationTime: number;  // Time to adapt to new task
  episodesTrained: number;
  timestamp: number;
}

/**
 * Meta-learning result
 */
export interface MetaLearningResult {
  selectedStrategy: StrategyConfig;
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    strategy: StrategyConfig;
    confidence: number;
    tradeoffs: string;
  }>;
  expectedPerformance: {
    successRate: number;
    learningSpeed: number;
    sampleEfficiency: number;
  };
}

/**
 * Task similarity measure
 */
export interface TaskSimilarity {
  taskId: string;
  similarity: number;
  features: TaskFeatures;
  bestStrategy: StrategyType;
  performance: StrategyPerformance;
}

/**
 * Meta-learning statistics
 */
export interface MetaLearningStats {
  totalTasks: number;
  strategiesEvaluated: number;
  adaptationsPerformed: number;
  averageAdaptationTime: number;
  bestPerformingStrategy: StrategyType;
  strategyUsageCount: Map<StrategyType, number>;
  strategySuccessRates: Map<StrategyType, number>;
}
