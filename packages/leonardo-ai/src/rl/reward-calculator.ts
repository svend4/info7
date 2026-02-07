/**
 * Leonardo AI - Reward Calculator
 *
 * Multi-criteria reward function for reinforcement learning
 */

import { RewardComponents, RewardConfig, State, Action } from './types';

/**
 * Default reward configuration
 */
export const DEFAULT_REWARD_CONFIG: RewardConfig = {
  weights: {
    taskSuccess: 10.0, // Most important: did we complete the task?
    quality: 5.0, // High quality results
    timeEfficiency: 2.0, // Faster is better
    resourceEfficiency: 2.0, // Less resources is better
    userSatisfaction: 3.0, // User happiness matters
    costEfficiency: 2.0, // Lower cost is better
  },
  penalties: {
    timeout: -10.0, // Heavy penalty for timeout
    error: -5.0, // Penalty for errors
    resourceOveruse: -3.0, // Penalty for using too many resources
  },
};

/**
 * Calculates rewards for Leonardo AI actions
 */
export class RewardCalculator {
  constructor(private config: RewardConfig = DEFAULT_REWARD_CONFIG) {}

  /**
   * Calculate reward from components
   */
  calculateReward(components: RewardComponents): number {
    const { weights } = this.config;

    let reward = 0;

    // Weighted sum of all components
    reward += components.taskSuccess * weights.taskSuccess;
    reward += components.quality * weights.quality;
    reward += components.timeEfficiency * weights.timeEfficiency;
    reward += components.resourceEfficiency * weights.resourceEfficiency;
    reward += (components.userSatisfaction ?? 0.5) * weights.userSatisfaction;
    reward += components.costEfficiency * weights.costEfficiency;

    return reward;
  }

  /**
   * Calculate reward from execution result
   */
  calculateFromExecution(
    state: State,
    action: Action,
    result: {
      success: boolean;
      quality?: number;
      executionTime: number;
      resourcesUsed: {
        memory: number;
        apiCalls: number;
        cost: number;
      };
      error?: Error;
      timedOut?: boolean;
      userFeedback?: number;
    }
  ): number {
    const components: RewardComponents = {
      // Task success (0 or 1)
      taskSuccess: result.success ? 1 : 0,

      // Quality of result (0-1)
      quality: result.quality ?? (result.success ? 0.7 : 0.3),

      // Time efficiency (faster = higher score)
      timeEfficiency: this.calculateTimeEfficiency(
        result.executionTime,
        action.resources.timeout
      ),

      // Resource efficiency (less = higher score)
      resourceEfficiency: this.calculateResourceEfficiency(
        result.resourcesUsed,
        action.resources
      ),

      // User satisfaction (if available)
      userSatisfaction: result.userFeedback,

      // Cost efficiency (cheaper = higher score)
      costEfficiency: this.calculateCostEfficiency(
        result.resourcesUsed.cost,
        action.resources
      ),
    };

    let reward = this.calculateReward(components);

    // Apply penalties
    if (result.timedOut) {
      reward += this.config.penalties.timeout;
    }

    if (result.error) {
      reward += this.config.penalties.error;
    }

    if (this.isResourceOveruse(result.resourcesUsed, action.resources)) {
      reward += this.config.penalties.resourceOveruse;
    }

    return reward;
  }

  /**
   * Calculate time efficiency score
   * Faster execution = higher score
   */
  private calculateTimeEfficiency(
    executionTime: number,
    timeout: number
  ): number {
    // If execution time is very fast (< 10% of timeout), reward generously
    if (executionTime < timeout * 0.1) {
      return 1.0;
    }

    // Linear scaling: timeEfficiency = 1 - (executionTime / timeout)
    const efficiency = Math.max(0, 1 - executionTime / timeout);

    return efficiency;
  }

  /**
   * Calculate resource efficiency score
   * Less resources = higher score
   */
  private calculateResourceEfficiency(
    used: { memory: number; apiCalls: number; cost: number },
    allocated: { maxMemory: number; maxAPICalls: number }
  ): number {
    // Memory efficiency
    const memoryEfficiency = Math.max(
      0,
      1 - used.memory / allocated.maxMemory
    );

    // API call efficiency
    const apiEfficiency = Math.max(
      0,
      1 - used.apiCalls / allocated.maxAPICalls
    );

    // Average of both
    return (memoryEfficiency + apiEfficiency) / 2;
  }

  /**
   * Calculate cost efficiency score
   */
  private calculateCostEfficiency(
    cost: number,
    resources: { timeout: number; maxMemory: number; maxAPICalls: number }
  ): number {
    // Estimate max possible cost based on allocated resources
    const estimatedMaxCost =
      resources.maxAPICalls * 0.01 + // Assume $0.01 per API call
      (resources.maxMemory / 1024) * 0.001; // Assume $0.001 per GB

    if (estimatedMaxCost === 0) return 1.0;

    return Math.max(0, 1 - cost / estimatedMaxCost);
  }

  /**
   * Check if resources were overused
   */
  private isResourceOveruse(
    used: { memory: number; apiCalls: number },
    allocated: { maxMemory: number; maxAPICalls: number }
  ): boolean {
    return (
      used.memory > allocated.maxMemory ||
      used.apiCalls > allocated.maxAPICalls
    );
  }

  /**
   * Calculate shaped reward (for better learning)
   * Adds intermediate rewards based on progress
   */
  calculateShapedReward(
    baseReward: number,
    state: State,
    nextState: State
  ): number {
    let shapedReward = baseReward;

    // Reward for improving success rate
    const successRateImprovement =
      nextState.history.successRate - state.history.successRate;
    if (successRateImprovement > 0) {
      shapedReward += successRateImprovement * 2.0;
    }

    // Penalty for degrading performance
    if (successRateImprovement < 0) {
      shapedReward += successRateImprovement * 1.0;
    }

    return shapedReward;
  }

  /**
   * Update reward configuration
   */
  updateConfig(config: Partial<RewardConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      weights: {
        ...this.config.weights,
        ...(config.weights ?? {}),
      },
      penalties: {
        ...this.config.penalties,
        ...(config.penalties ?? {}),
      },
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): RewardConfig {
    return { ...this.config };
  }
}
