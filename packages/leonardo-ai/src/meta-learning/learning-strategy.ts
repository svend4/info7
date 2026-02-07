/**
 * Learning Strategy
 *
 * Base interface and implementations for different learning strategies.
 */

import { Logger } from '@info7/common';
import { Experience, State, Action } from '../rl/types';
import { StrategyType, StrategyConfig } from './types';

/**
 * Learning Strategy Interface
 */
export interface LearningStrategy {
  readonly type: StrategyType;
  readonly config: StrategyConfig;

  /**
   * Learn from a batch of experiences
   */
  learn(experiences: Experience[]): Promise<number>;

  /**
   * Adapt the strategy based on performance
   */
  adapt(performance: number): Promise<void>;

  /**
   * Clone the strategy with new configuration
   */
  clone(config?: Partial<StrategyConfig>): LearningStrategy;

  /**
   * Get current hyperparameters
   */
  getHyperparameters(): StrategyConfig;

  /**
   * Reset strategy to initial state
   */
  reset(): void;
}

/**
 * Standard RL Strategy
 *
 * Classic reinforcement learning with experience replay and TD learning.
 */
export class StandardRLStrategy implements LearningStrategy {
  readonly type = StrategyType.STANDARD_RL;
  public config: StrategyConfig;
  private logger: Logger;
  private episodeCount: number;

  constructor(config: StrategyConfig) {
    this.config = config;
    this.logger = new Logger({
      context: { strategy: this.type },
    });
    this.episodeCount = 0;
  }

  async learn(experiences: Experience[]): Promise<number> {
    this.logger.debug('Learning from experiences', {
      count: experiences.length,
    });

    // Standard TD learning
    let totalLoss = 0;

    for (const exp of experiences) {
      // Compute TD error
      const tdError = this.computeTDError(exp);
      totalLoss += Math.abs(tdError);

      // Update policy (simplified)
      // In real implementation, this would update neural network weights
    }

    this.episodeCount++;

    const avgLoss = totalLoss / experiences.length;
    this.logger.debug('Learning completed', {
      avgLoss,
      episode: this.episodeCount,
    });

    return avgLoss;
  }

  async adapt(performance: number): Promise<void> {
    // Standard strategy doesn't adapt much
    if (performance < 0.3) {
      // If performing very poorly, increase exploration slightly
      this.config.explorationRate = Math.min(
        1.0,
        this.config.explorationRate * 1.1
      );
    }
  }

  clone(configOverrides?: Partial<StrategyConfig>): LearningStrategy {
    return new StandardRLStrategy({
      ...this.config,
      ...configOverrides,
    });
  }

  getHyperparameters(): StrategyConfig {
    return { ...this.config };
  }

  reset(): void {
    this.episodeCount = 0;
  }

  private computeTDError(exp: Experience): number {
    // Simplified TD error computation
    const currentValue = exp.reward;
    const nextValue = exp.done ? 0 : exp.reward * 0.99;
    return nextValue - currentValue;
  }
}

/**
 * Fast Adaptation Strategy
 *
 * Optimized for quick adaptation to new tasks (MAML-inspired).
 */
export class FastAdaptationStrategy implements LearningStrategy {
  readonly type = StrategyType.FAST_ADAPTATION;
  public config: StrategyConfig;
  private logger: Logger;
  private metaGradients: Map<string, number[]>;

  constructor(config: StrategyConfig) {
    this.config = {
      ...config,
      adaptationSteps: config.adaptationSteps || 5,
      innerLearningRate: config.innerLearningRate || 0.01,
    };
    this.logger = new Logger({
      context: { strategy: this.type },
    });
    this.metaGradients = new Map();
  }

  async learn(experiences: Experience[]): Promise<number> {
    this.logger.debug('Fast adaptation learning', {
      experiences: experiences.length,
      adaptationSteps: this.config.adaptationSteps,
    });

    // MAML-style meta-learning
    // 1. Inner loop: Quick adaptation to task
    const adaptedParams = await this.innerLoop(experiences);

    // 2. Outer loop: Update meta-parameters
    const loss = await this.outerLoop(adaptedParams);

    return loss;
  }

  async adapt(performance: number): Promise<void> {
    // Fast adaptation adjusts inner learning rate
    if (performance < 0.5) {
      // Need more adaptation steps
      this.config.adaptationSteps = Math.min(
        10,
        (this.config.adaptationSteps || 5) + 1
      );
      this.config.innerLearningRate = (this.config.innerLearningRate || 0.01) * 1.2;
    } else if (performance > 0.8) {
      // Can reduce adaptation steps
      this.config.adaptationSteps = Math.max(
        3,
        (this.config.adaptationSteps || 5) - 1
      );
    }

    this.logger.debug('Adapted strategy', {
      adaptationSteps: this.config.adaptationSteps,
      innerLearningRate: this.config.innerLearningRate,
    });
  }

  clone(configOverrides?: Partial<StrategyConfig>): LearningStrategy {
    return new FastAdaptationStrategy({
      ...this.config,
      ...configOverrides,
    });
  }

  getHyperparameters(): StrategyConfig {
    return { ...this.config };
  }

  reset(): void {
    this.metaGradients.clear();
  }

  private async innerLoop(experiences: Experience[]): Promise<Map<string, number[]>> {
    // Fast adaptation to task using few examples
    const adaptedParams = new Map<string, number[]>();

    for (let step = 0; step < (this.config.adaptationSteps || 5); step++) {
      // Sample mini-batch
      const batch = experiences.slice(0, Math.min(5, experiences.length));

      // Compute gradients
      for (const exp of batch) {
        const gradient = this.computeGradient(exp);
        adaptedParams.set(`param_${step}`, gradient);
      }
    }

    return adaptedParams;
  }

  private async outerLoop(adaptedParams: Map<string, number[]>): Promise<number> {
    // Update meta-parameters
    let totalLoss = 0;

    for (const [key, gradients] of adaptedParams) {
      const loss = gradients.reduce((sum, g) => sum + Math.abs(g), 0) / gradients.length;
      totalLoss += loss;

      // Store meta-gradients
      this.metaGradients.set(key, gradients);
    }

    return totalLoss / adaptedParams.size;
  }

  private computeGradient(exp: Experience): number[] {
    // Simplified gradient computation
    return [exp.reward, exp.reward * 0.5];
  }
}

/**
 * Exploration-Heavy Strategy
 *
 * Focuses on exploration for novel tasks.
 */
export class ExplorationHeavyStrategy implements LearningStrategy {
  readonly type = StrategyType.EXPLORATION_HEAVY;
  public config: StrategyConfig;
  private logger: Logger;

  constructor(config: StrategyConfig) {
    this.config = {
      ...config,
      explorationRate: Math.max(config.explorationRate, 0.7),  // High exploration
    };
    this.logger = new Logger({
      context: { strategy: this.type },
    });
  }

  async learn(experiences: Experience[]): Promise<number> {
    this.logger.debug('Exploration-heavy learning', {
      experiences: experiences.length,
      explorationRate: this.config.explorationRate,
    });

    // Prioritize diverse experiences
    const uniqueStates = new Set(experiences.map(e => e.state.task));

    this.logger.debug('Unique states explored', {
      count: uniqueStates.size,
    });

    // Learn with emphasis on exploration
    let totalLoss = 0;
    for (const exp of experiences) {
      totalLoss += Math.abs(exp.reward);
    }

    return totalLoss / experiences.length;
  }

  async adapt(performance: number): Promise<void> {
    // Gradually reduce exploration as we learn
    if (performance > 0.6) {
      this.config.explorationRate = Math.max(
        0.3,
        this.config.explorationRate * 0.95
      );
    }
  }

  clone(configOverrides?: Partial<StrategyConfig>): LearningStrategy {
    return new ExplorationHeavyStrategy({
      ...this.config,
      ...configOverrides,
    });
  }

  getHyperparameters(): StrategyConfig {
    return { ...this.config };
  }

  reset(): void {
    // Reset exploration rate
    this.config.explorationRate = 0.7;
  }
}

/**
 * Transfer Learning Strategy
 *
 * Transfers knowledge from similar tasks.
 */
export class TransferLearningStrategy implements LearningStrategy {
  readonly type = StrategyType.TRANSFER_LEARNING;
  public config: StrategyConfig;
  private logger: Logger;
  private sourceKnowledge: Map<string, number[]>;

  constructor(config: StrategyConfig) {
    this.config = config;
    this.logger = new Logger({
      context: { strategy: this.type },
    });
    this.sourceKnowledge = new Map();
  }

  async learn(experiences: Experience[]): Promise<number> {
    this.logger.debug('Transfer learning', {
      experiences: experiences.length,
      sourceTask: this.config.transferSource,
    });

    // Load knowledge from source task
    if (this.config.transferSource) {
      this.loadSourceKnowledge(this.config.transferSource);
    }

    // Learn with transferred knowledge
    let totalLoss = 0;

    for (const exp of experiences) {
      // Apply transferred knowledge
      const priorKnowledge = this.sourceKnowledge.get(exp.state.task) || [];
      const loss = Math.abs(exp.reward - (priorKnowledge[0] || 0));
      totalLoss += loss;
    }

    return totalLoss / experiences.length;
  }

  async adapt(performance: number): Promise<void> {
    // If transfer isn't helping, reduce reliance on source
    if (performance < 0.5) {
      this.logger.warn('Transfer learning not effective', { performance });
      // Would reduce transfer weight here
    }
  }

  clone(configOverrides?: Partial<StrategyConfig>): LearningStrategy {
    return new TransferLearningStrategy({
      ...this.config,
      ...configOverrides,
    });
  }

  getHyperparameters(): StrategyConfig {
    return { ...this.config };
  }

  reset(): void {
    this.sourceKnowledge.clear();
  }

  private loadSourceKnowledge(sourceTask: string): void {
    // Simplified: load pre-trained knowledge
    this.sourceKnowledge.set(sourceTask, [0.8, 0.7, 0.9]);
    this.logger.debug('Source knowledge loaded', { sourceTask });
  }
}

/**
 * Strategy Factory
 */
export class StrategyFactory {
  static create(type: StrategyType, config: StrategyConfig): LearningStrategy {
    switch (type) {
      case StrategyType.STANDARD_RL:
        return new StandardRLStrategy(config);
      case StrategyType.FAST_ADAPTATION:
        return new FastAdaptationStrategy(config);
      case StrategyType.EXPLORATION_HEAVY:
        return new ExplorationHeavyStrategy(config);
      case StrategyType.TRANSFER_LEARNING:
        return new TransferLearningStrategy(config);
      default:
        return new StandardRLStrategy(config);
    }
  }
}
