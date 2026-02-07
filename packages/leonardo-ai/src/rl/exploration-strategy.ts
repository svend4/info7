/**
 * Leonardo AI - Exploration Strategy
 *
 * Balances exploration (trying new actions) vs exploitation (using known good actions)
 */

import { ExplorationConfig, Action, State } from './types';

/**
 * Action statistics for UCB and Thompson Sampling
 */
interface ActionStats {
  action: Action;
  count: number;
  totalReward: number;
  avgReward: number;
  variance: number;
}

/**
 * Exploration strategy for RL agent
 */
export class ExplorationStrategy {
  private epsilon: number;
  private step = 0;
  private actionStats = new Map<string, ActionStats>();

  constructor(private config: ExplorationConfig) {
    this.epsilon = config.initialEpsilon ?? 1.0;
  }

  /**
   * Decide whether to explore or exploit
   */
  shouldExplore(): boolean {
    const random = Math.random();

    switch (this.config.strategy) {
      case 'epsilon-greedy':
        return random < this.epsilon;

      case 'ucb':
      case 'thompson-sampling':
        // These strategies handle exploration internally
        return false;

      default:
        return random < this.epsilon;
    }
  }

  /**
   * Select action using exploration strategy
   */
  selectAction(
    state: State,
    availableActions: Action[],
    actionValues: Map<Action, number>
  ): Action {
    switch (this.config.strategy) {
      case 'epsilon-greedy':
        return this.epsilonGreedy(availableActions, actionValues);

      case 'ucb':
        return this.upperConfidenceBound(availableActions, actionValues);

      case 'thompson-sampling':
        return this.thompsonSampling(availableActions);

      default:
        return this.epsilonGreedy(availableActions, actionValues);
    }
  }

  /**
   * Epsilon-greedy exploration
   * With probability epsilon, choose random action
   * Otherwise, choose best action
   */
  private epsilonGreedy(
    actions: Action[],
    actionValues: Map<Action, number>
  ): Action {
    if (this.shouldExplore()) {
      // Explore: random action
      return actions[Math.floor(Math.random() * actions.length)];
    } else {
      // Exploit: best action
      let bestAction = actions[0];
      let bestValue = actionValues.get(bestAction) ?? -Infinity;

      for (const action of actions) {
        const value = actionValues.get(action) ?? -Infinity;
        if (value > bestValue) {
          bestValue = value;
          bestAction = action;
        }
      }

      return bestAction;
    }
  }

  /**
   * Upper Confidence Bound (UCB) exploration
   * Selects action with highest UCB score: Q(a) + c * sqrt(ln(t) / n(a))
   */
  private upperConfidenceBound(
    actions: Action[],
    actionValues: Map<Action, number>
  ): Action {
    const c = this.config.ucbConstant ?? 2.0;
    const totalSteps = this.step + 1;

    let bestAction = actions[0];
    let bestScore = -Infinity;

    for (const action of actions) {
      const actionKey = this.getActionKey(action);
      const stats = this.actionStats.get(actionKey);

      if (!stats) {
        // Unvisited action, give it max priority
        return action;
      }

      const q = actionValues.get(action) ?? stats.avgReward;
      const n = stats.count;

      // UCB score
      const ucbScore = q + c * Math.sqrt(Math.log(totalSteps) / n);

      if (ucbScore > bestScore) {
        bestScore = ucbScore;
        bestAction = action;
      }
    }

    return bestAction;
  }

  /**
   * Thompson Sampling exploration
   * Sample from posterior distribution of action values
   */
  private thompsonSampling(actions: Action[]): Action {
    let bestAction = actions[0];
    let bestSample = -Infinity;

    for (const action of actions) {
      const actionKey = this.getActionKey(action);
      const stats = this.actionStats.get(actionKey);

      let sample: number;

      if (!stats || stats.count === 0) {
        // Unvisited action, sample from prior (assume uniform)
        sample = Math.random();
      } else {
        // Sample from normal distribution N(mean, variance/count)
        const mean = stats.avgReward;
        const stddev = Math.sqrt(stats.variance / stats.count);
        sample = this.sampleNormal(mean, stddev);
      }

      if (sample > bestSample) {
        bestSample = sample;
        bestAction = action;
      }
    }

    return bestAction;
  }

  /**
   * Update exploration parameters after each step
   */
  updateAfterStep(action: Action, reward: number): void {
    this.step++;

    // Update action statistics
    this.updateActionStats(action, reward);

    // Decay epsilon for epsilon-greedy
    if (this.config.strategy === 'epsilon-greedy') {
      this.decayEpsilon();
    }
  }

  /**
   * Decay epsilon value
   */
  private decayEpsilon(): void {
    const minEpsilon = this.config.minEpsilon ?? 0.01;
    const decayRate = this.config.decayRate ?? 0.995;

    this.epsilon = Math.max(minEpsilon, this.epsilon * decayRate);
  }

  /**
   * Update statistics for action
   */
  private updateActionStats(action: Action, reward: number): void {
    const actionKey = this.getActionKey(action);
    const stats = this.actionStats.get(actionKey);

    if (!stats) {
      this.actionStats.set(actionKey, {
        action,
        count: 1,
        totalReward: reward,
        avgReward: reward,
        variance: 0,
      });
    } else {
      const n = stats.count;
      const oldMean = stats.avgReward;
      const newCount = n + 1;
      const newMean = (stats.totalReward + reward) / newCount;

      // Update variance using Welford's online algorithm
      const delta = reward - oldMean;
      const delta2 = reward - newMean;
      const newVariance = (stats.variance * n + delta * delta2) / newCount;

      this.actionStats.set(actionKey, {
        action,
        count: newCount,
        totalReward: stats.totalReward + reward,
        avgReward: newMean,
        variance: newVariance,
      });
    }
  }

  /**
   * Generate unique key for action (for tracking statistics)
   */
  private getActionKey(action: Action): string {
    return JSON.stringify({
      mode: action.mode,
      strategy: action.strategy,
    });
  }

  /**
   * Sample from normal distribution
   * Box-Muller transform
   */
  private sampleNormal(mean: number, stddev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    return mean + z0 * stddev;
  }

  /**
   * Get current exploration rate
   */
  getExplorationRate(): number {
    return this.epsilon;
  }

  /**
   * Get action statistics
   */
  getActionStats(): Map<string, ActionStats> {
    return new Map(this.actionStats);
  }

  /**
   * Reset exploration strategy
   */
  reset(): void {
    this.epsilon = this.config.initialEpsilon ?? 1.0;
    this.step = 0;
    this.actionStats.clear();
  }

  /**
   * Get best action based on statistics (for evaluation)
   */
  getBestAction(): Action | null {
    let bestAction: Action | null = null;
    let bestAvgReward = -Infinity;

    for (const stats of this.actionStats.values()) {
      if (stats.avgReward > bestAvgReward) {
        bestAvgReward = stats.avgReward;
        bestAction = stats.action;
      }
    }

    return bestAction;
  }
}
