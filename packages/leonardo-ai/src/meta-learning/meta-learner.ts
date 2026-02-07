/**
 * Meta-Learner
 *
 * Core meta-learning system that learns to learn.
 * Selects and adapts learning strategies based on task characteristics.
 */

import { Logger, MetricsCollector, AppError } from '@info7/common';
import { Experience } from '../rl/types';
import {
  StrategyType,
  StrategyConfig,
  TaskFeatures,
  StrategyPerformance,
  MetaLearningResult,
  TaskSimilarity,
  MetaLearningStats,
} from './types';
import { LearningStrategy, StrategyFactory } from './learning-strategy';

/**
 * Meta-Learner Configuration
 */
export interface MetaLearnerConfig {
  defaultStrategy: StrategyType;
  performanceWindow: number;  // Number of episodes to track
  similarityThreshold: number;  // Threshold for task similarity
  adaptationThreshold: number;  // Performance threshold for adaptation
  enableTransferLearning: boolean;
}

/**
 * Task history entry
 */
interface TaskHistory {
  taskType: string;
  features: TaskFeatures;
  strategy: StrategyType;
  performance: StrategyPerformance;
}

/**
 * Meta-Learner
 *
 * Learns optimal learning strategies for different types of tasks.
 */
export class MetaLearner {
  private logger: Logger;
  private metrics: MetricsCollector;
  private config: MetaLearnerConfig;

  // Strategy management
  private strategies: Map<StrategyType, LearningStrategy>;
  private currentStrategy: LearningStrategy | null;

  // Performance tracking
  private taskHistory: TaskHistory[];
  private strategyPerformance: Map<StrategyType, StrategyPerformance[]>;
  private recentPerformance: number[];

  // Statistics
  private stats: MetaLearningStats;

  constructor(config: Partial<MetaLearnerConfig> = {}) {
    this.logger = new Logger({
      level: 'info',
      context: { component: 'meta-learner' },
    });

    this.metrics = new MetricsCollector();

    this.config = {
      defaultStrategy: StrategyType.STANDARD_RL,
      performanceWindow: 10,
      similarityThreshold: 0.7,
      adaptationThreshold: 0.6,
      enableTransferLearning: true,
      ...config,
    };

    this.strategies = new Map();
    this.currentStrategy = null;
    this.taskHistory = [];
    this.strategyPerformance = new Map();
    this.recentPerformance = [];

    this.stats = {
      totalTasks: 0,
      strategiesEvaluated: 0,
      adaptationsPerformed: 0,
      averageAdaptationTime: 0,
      bestPerformingStrategy: this.config.defaultStrategy,
      strategyUsageCount: new Map(),
      strategySuccessRates: new Map(),
    };

    this.initializeStrategies();

    this.logger.info('Meta-Learner initialized', {
      defaultStrategy: this.config.defaultStrategy,
    });
  }

  /**
   * Initialize all available strategies
   */
  private initializeStrategies(): void {
    const baseConfig: StrategyConfig = {
      type: StrategyType.STANDARD_RL,
      learningRate: 0.001,
      explorationRate: 0.3,
      batchSize: 32,
      updateFrequency: 4,
    };

    // Create one instance of each strategy type
    for (const strategyType of Object.values(StrategyType)) {
      const strategy = StrategyFactory.create(strategyType, {
        ...baseConfig,
        type: strategyType,
      });
      this.strategies.set(strategyType, strategy);
      this.strategyPerformance.set(strategyType, []);
      this.stats.strategyUsageCount.set(strategyType, 0);
      this.stats.strategySuccessRates.set(strategyType, 0);
    }

    this.logger.debug('Strategies initialized', {
      count: this.strategies.size,
    });
  }

  /**
   * Select optimal learning strategy for a task
   */
  async selectStrategy(taskFeatures: TaskFeatures): Promise<MetaLearningResult> {
    const selectionCounter = this.metrics.counter('metalearner.selection.total');
    const selectionTimer = this.metrics.timer('metalearner.selection.duration');

    this.logger.info('Selecting strategy for task', {
      taskType: taskFeatures.taskType,
      complexity: taskFeatures.complexity,
      novelty: taskFeatures.novelty,
    });

    try {
      const result = await selectionTimer.time(async () => {
        // Step 1: Find similar tasks
        const similarTasks = this.findSimilarTasks(taskFeatures);

        this.logger.debug('Similar tasks found', {
          count: similarTasks.length,
        });

        // Step 2: Select strategy based on similarity and performance
        const selectedType = this.selectStrategyType(taskFeatures, similarTasks);

        // Step 3: Get or create strategy with optimized config
        const strategy = this.getOptimizedStrategy(
          selectedType,
          taskFeatures,
          similarTasks
        );

        // Step 4: Generate alternatives
        const alternatives = this.generateAlternatives(
          selectedType,
          taskFeatures
        );

        // Step 5: Estimate expected performance
        const expectedPerformance = this.estimatePerformance(
          selectedType,
          similarTasks
        );

        // Set as current strategy
        this.currentStrategy = strategy;
        this.stats.strategiesEvaluated++;

        // Update usage count
        const usageCount = this.stats.strategyUsageCount.get(selectedType) || 0;
        this.stats.strategyUsageCount.set(selectedType, usageCount + 1);

        return {
          selectedStrategy: strategy.getHyperparameters(),
          confidence: this.calculateConfidence(similarTasks, taskFeatures),
          reasoning: this.generateReasoning(selectedType, similarTasks, taskFeatures),
          alternatives,
          expectedPerformance,
        };
      });

      selectionCounter.inc();

      this.logger.info('Strategy selected', {
        type: result.selectedStrategy.type,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      this.logger.error('Strategy selection failed', error);
      throw new AppError(
        'Strategy selection failed',
        'STRATEGY_SELECTION_FAILED',
        500,
        'medium',
        { taskType: taskFeatures.taskType }
      );
    }
  }

  /**
   * Learn from experiences using current strategy
   */
  async learn(experiences: Experience[]): Promise<number> {
    if (!this.currentStrategy) {
      throw new AppError(
        'No strategy selected',
        'NO_STRATEGY',
        400,
        'medium'
      );
    }

    const learnCounter = this.metrics.counter('metalearner.learn.total', {
      strategy: this.currentStrategy.type,
    });

    this.logger.debug('Learning with current strategy', {
      strategy: this.currentStrategy.type,
      experiences: experiences.length,
    });

    const loss = await this.currentStrategy.learn(experiences);

    // Calculate performance
    const performance = this.calculatePerformance(experiences);
    this.recentPerformance.push(performance);

    if (this.recentPerformance.length > this.config.performanceWindow) {
      this.recentPerformance.shift();
    }

    // Check if adaptation is needed
    await this.checkAdaptation(performance);

    learnCounter.inc();

    return loss;
  }

  /**
   * Record task completion and performance
   */
  recordTaskCompletion(
    taskFeatures: TaskFeatures,
    performance: number,
    learningTime: number
  ): void {
    if (!this.currentStrategy) return;

    const strategyPerf: StrategyPerformance = {
      strategyType: this.currentStrategy.type,
      taskType: taskFeatures.taskType,
      successRate: performance,
      averageReward: this.calculateAverageReward(),
      learningSpeed: learningTime,
      sampleEfficiency: performance / (this.recentPerformance.length || 1),
      adaptationTime: learningTime,
      episodesTrained: this.recentPerformance.length,
      timestamp: Date.now(),
    };

    // Store in history
    this.taskHistory.push({
      taskType: taskFeatures.taskType,
      features: taskFeatures,
      strategy: this.currentStrategy.type,
      performance: strategyPerf,
    });

    // Update strategy performance
    const perfHistory = this.strategyPerformance.get(this.currentStrategy.type) || [];
    perfHistory.push(strategyPerf);
    this.strategyPerformance.set(this.currentStrategy.type, perfHistory);

    // Update statistics
    this.stats.totalTasks++;

    // Update success rates
    const successRate = this.stats.strategySuccessRates.get(this.currentStrategy.type) || 0;
    const usageCount = this.stats.strategyUsageCount.get(this.currentStrategy.type) || 1;
    this.stats.strategySuccessRates.set(
      this.currentStrategy.type,
      (successRate * (usageCount - 1) + performance) / usageCount
    );

    // Update best performing strategy
    this.updateBestStrategy();

    this.logger.info('Task completion recorded', {
      taskType: taskFeatures.taskType,
      strategy: this.currentStrategy.type,
      performance,
    });
  }

  /**
   * Find similar tasks based on features
   */
  private findSimilarTasks(taskFeatures: TaskFeatures): TaskSimilarity[] {
    const similarities: TaskSimilarity[] = [];

    for (const history of this.taskHistory) {
      const similarity = this.calculateTaskSimilarity(
        taskFeatures,
        history.features
      );

      if (similarity >= this.config.similarityThreshold) {
        similarities.push({
          taskId: history.taskType,
          similarity,
          features: history.features,
          bestStrategy: history.strategy,
          performance: history.performance,
        });
      }
    }

    // Sort by similarity (descending)
    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Calculate similarity between tasks
   */
  private calculateTaskSimilarity(
    task1: TaskFeatures,
    task2: TaskFeatures
  ): number {
    // Simple cosine similarity based on normalized features
    const features1 = [
      task1.complexity,
      task1.novelty,
      task1.dataAvailability,
      task1.timeConstraint,
      task1.qualityRequirement,
    ];

    const features2 = [
      task2.complexity,
      task2.novelty,
      task2.dataAvailability,
      task2.timeConstraint,
      task2.qualityRequirement,
    ];

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < features1.length; i++) {
      dotProduct += features1[i] * features2[i];
      norm1 += features1[i] ** 2;
      norm2 += features2[i] ** 2;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Select strategy type based on task and similar tasks
   */
  private selectStrategyType(
    taskFeatures: TaskFeatures,
    similarTasks: TaskSimilarity[]
  ): StrategyType {
    // If we have similar successful tasks, use their strategy
    if (similarTasks.length > 0) {
      const bestSimilar = similarTasks[0];
      if (bestSimilar.performance.successRate > 0.7) {
        this.logger.debug('Using strategy from similar task', {
          strategy: bestSimilar.bestStrategy,
          similarity: bestSimilar.similarity,
        });
        return bestSimilar.bestStrategy;
      }
    }

    // Otherwise, select based on task features
    if (taskFeatures.novelty > 0.8) {
      // Novel task: explore heavily
      return StrategyType.EXPLORATION_HEAVY;
    }

    if (taskFeatures.dataAvailability < 0.3) {
      // Few samples: fast adaptation
      return StrategyType.FAST_ADAPTATION;
    }

    if (taskFeatures.timeConstraint < 0.3) {
      // Time constrained: fast adaptation
      return StrategyType.FAST_ADAPTATION;
    }

    if (this.config.enableTransferLearning && similarTasks.length > 0) {
      // Similar tasks exist: transfer learning
      return StrategyType.TRANSFER_LEARNING;
    }

    // Default: standard RL
    return StrategyType.STANDARD_RL;
  }

  /**
   * Get strategy with optimized configuration
   */
  private getOptimizedStrategy(
    type: StrategyType,
    taskFeatures: TaskFeatures,
    similarTasks: TaskSimilarity[]
  ): LearningStrategy {
    const baseStrategy = this.strategies.get(type)!;

    // Optimize hyperparameters based on task and similar tasks
    const config = baseStrategy.getHyperparameters();

    // Adjust learning rate based on complexity
    config.learningRate *= 1 / (1 + taskFeatures.complexity);

    // Adjust exploration based on novelty
    config.explorationRate = 0.1 + taskFeatures.novelty * 0.6;

    // Create new strategy instance with optimized config
    return StrategyFactory.create(type, config);
  }

  /**
   * Generate alternative strategies
   */
  private generateAlternatives(
    selectedType: StrategyType,
    taskFeatures: TaskFeatures
  ) {
    const alternatives: any[] = [];

    // Add up to 2 alternatives
    for (const strategyType of Object.values(StrategyType)) {
      if (strategyType !== selectedType && alternatives.length < 2) {
        const strategy = this.strategies.get(strategyType)!;
        const perfHistory = this.strategyPerformance.get(strategyType) || [];

        const avgPerf = perfHistory.length > 0
          ? perfHistory.reduce((sum, p) => sum + p.successRate, 0) / perfHistory.length
          : 0.5;

        alternatives.push({
          strategy: strategy.getHyperparameters(),
          confidence: avgPerf,
          tradeoffs: this.getStrategyTradeoffs(strategyType),
        });
      }
    }

    return alternatives;
  }

  /**
   * Get strategy tradeoffs description
   */
  private getStrategyTradeoffs(type: StrategyType): string {
    const tradeoffs: Record<StrategyType, string> = {
      [StrategyType.STANDARD_RL]: 'Balanced but slower convergence',
      [StrategyType.FAST_ADAPTATION]: 'Quick learning but may overfit',
      [StrategyType.EXPLORATION_HEAVY]: 'Discovers more but slower to exploit',
      [StrategyType.EXPLOITATION_FOCUSED]: 'Fast exploitation but may miss opportunities',
      [StrategyType.TRANSFER_LEARNING]: 'Fast if source task is similar, slow otherwise',
      [StrategyType.FEW_SHOT]: 'Efficient with few samples but requires good prior',
    };

    return tradeoffs[type];
  }

  /**
   * Estimate expected performance
   */
  private estimatePerformance(
    strategyType: StrategyType,
    similarTasks: TaskSimilarity[]
  ) {
    const perfHistory = this.strategyPerformance.get(strategyType) || [];

    if (perfHistory.length === 0) {
      // No history: return default estimates
      return {
        successRate: 0.5,
        learningSpeed: 100,
        sampleEfficiency: 0.5,
      };
    }

    // Calculate averages from history
    const avgSuccessRate = perfHistory.reduce((sum, p) => sum + p.successRate, 0) / perfHistory.length;
    const avgLearningSpeed = perfHistory.reduce((sum, p) => sum + p.learningSpeed, 0) / perfHistory.length;
    const avgSampleEfficiency = perfHistory.reduce((sum, p) => sum + p.sampleEfficiency, 0) / perfHistory.length;

    // Adjust based on similar tasks
    if (similarTasks.length > 0) {
      const similarPerf = similarTasks[0].performance;
      return {
        successRate: (avgSuccessRate + similarPerf.successRate) / 2,
        learningSpeed: (avgLearningSpeed + similarPerf.learningSpeed) / 2,
        sampleEfficiency: (avgSampleEfficiency + similarPerf.sampleEfficiency) / 2,
      };
    }

    return {
      successRate: avgSuccessRate,
      learningSpeed: avgLearningSpeed,
      sampleEfficiency: avgSampleEfficiency,
    };
  }

  /**
   * Calculate confidence in strategy selection
   */
  private calculateConfidence(
    similarTasks: TaskSimilarity[],
    taskFeatures: TaskFeatures
  ): number {
    if (similarTasks.length === 0) {
      return 0.5;  // No similar tasks: medium confidence
    }

    const topSimilarity = similarTasks[0].similarity;
    const topPerformance = similarTasks[0].performance.successRate;

    // Confidence based on similarity and past performance
    return (topSimilarity * 0.6 + topPerformance * 0.4);
  }

  /**
   * Generate reasoning for strategy selection
   */
  private generateReasoning(
    selectedType: StrategyType,
    similarTasks: TaskSimilarity[],
    taskFeatures: TaskFeatures
  ): string {
    const parts: string[] = [];

    parts.push(`Selected ${selectedType} strategy.`);

    if (similarTasks.length > 0) {
      const similarity = similarTasks[0].similarity;
      parts.push(
        `Based on ${similarTasks.length} similar task(s) with ${(similarity * 100).toFixed(0)}% similarity.`
      );
    } else {
      parts.push('No similar tasks found, using task features for selection.');
    }

    if (taskFeatures.novelty > 0.7) {
      parts.push('High novelty detected, prioritizing exploration.');
    }

    if (taskFeatures.dataAvailability < 0.3) {
      parts.push('Limited data available, optimized for few-shot learning.');
    }

    return parts.join(' ');
  }

  /**
   * Calculate performance from experiences
   */
  private calculatePerformance(experiences: Experience[]): number {
    if (experiences.length === 0) return 0;

    const avgReward = experiences.reduce((sum, exp) => sum + exp.reward, 0) / experiences.length;
    return avgReward;
  }

  /**
   * Calculate average reward
   */
  private calculateAverageReward(): number {
    if (this.recentPerformance.length === 0) return 0;

    return this.recentPerformance.reduce((sum, p) => sum + p, 0) / this.recentPerformance.length;
  }

  /**
   * Check if strategy adaptation is needed
   */
  private async checkAdaptation(currentPerformance: number): Promise<void> {
    if (!this.currentStrategy) return;

    const avgPerformance = this.calculateAverageReward();

    // Adapt if performance is below threshold
    if (avgPerformance < this.config.adaptationThreshold) {
      this.logger.info('Adapting strategy', {
        strategy: this.currentStrategy.type,
        currentPerformance,
        avgPerformance,
      });

      const startTime = Date.now();
      await this.currentStrategy.adapt(avgPerformance);
      const adaptationTime = Date.now() - startTime;

      this.stats.adaptationsPerformed++;
      this.stats.averageAdaptationTime =
        (this.stats.averageAdaptationTime * (this.stats.adaptationsPerformed - 1) + adaptationTime) /
        this.stats.adaptationsPerformed;
    }
  }

  /**
   * Update best performing strategy
   */
  private updateBestStrategy(): void {
    let bestType = this.config.defaultStrategy;
    let bestRate = 0;

    for (const [type, rate] of this.stats.strategySuccessRates) {
      if (rate > bestRate) {
        bestRate = rate;
        bestType = type;
      }
    }

    this.stats.bestPerformingStrategy = bestType;
  }

  /**
   * Get meta-learning statistics
   */
  getStatistics(): MetaLearningStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.metrics.export();
  }

  /**
   * Reset meta-learner
   */
  reset(): void {
    this.currentStrategy = null;
    this.recentPerformance = [];
    this.logger.info('Meta-learner reset');
  }
}
