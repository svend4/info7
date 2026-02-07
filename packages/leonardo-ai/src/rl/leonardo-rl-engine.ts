/**
 * Leonardo AI - RL Engine
 *
 * Main reinforcement learning engine that coordinates all RL components
 */

import { PolicyNetwork, PolicyNetworkConfig } from './policy-network';
import { ValueNetwork, ValueNetworkConfig } from './value-network';
import { RewardCalculator, DEFAULT_REWARD_CONFIG } from './reward-calculator';
import { ExperienceReplayBuffer } from './experience-buffer';
import { ExplorationStrategy } from './exploration-strategy';
import {
  State,
  Action,
  Experience,
  RLConfig,
  TrainingMetrics,
  ModelCheckpoint,
} from './types';

/**
 * Default RL configuration
 */
export const DEFAULT_RL_CONFIG: RLConfig = {
  learningRate: 0.001,
  discountFactor: 0.99,
  bufferSize: 10000,
  batchSize: 32,
  exploration: {
    strategy: 'epsilon-greedy',
    initialEpsilon: 1.0,
    minEpsilon: 0.01,
    decayRate: 0.995,
  },
  reward: DEFAULT_REWARD_CONFIG,
  updateFrequency: 4,
  targetUpdateFrequency: 100,
};

/**
 * Main Leonardo AI RL Engine
 */
export class LeonardoRLEngine {
  private policyNetwork: PolicyNetwork;
  private valueNetwork: ValueNetwork;
  private targetValueNetwork: ValueNetwork;
  private rewardCalculator: RewardCalculator;
  private experienceBuffer: ExperienceReplayBuffer;
  private explorationStrategy: ExplorationStrategy;

  private step = 0;
  private episode = 0;
  private episodeRewards: number[] = [];
  private episodeSuccesses: number[] = [];

  constructor(private config: RLConfig = DEFAULT_RL_CONFIG) {
    // Feature dimension (based on state features)
    const stateDim = 14; // Number of features extracted from state

    // Action dimension (5 modes)
    const actionDim = 5;

    // Initialize policy network
    const policyConfig: PolicyNetworkConfig = {
      stateDim,
      actionDim,
      hiddenLayers: [128, 64, 32],
      learningRate: config.learningRate,
    };
    this.policyNetwork = new PolicyNetwork(policyConfig);

    // Initialize value network
    const valueConfig: ValueNetworkConfig = {
      stateDim,
      hiddenLayers: [128, 64, 32],
      learningRate: config.learningRate,
    };
    this.valueNetwork = new ValueNetwork(valueConfig);

    // Initialize target value network (for stable learning)
    this.targetValueNetwork = this.valueNetwork.clone();

    // Initialize reward calculator
    this.rewardCalculator = new RewardCalculator(config.reward);

    // Initialize experience buffer
    this.experienceBuffer = new ExperienceReplayBuffer(
      config.bufferSize,
      true // Use prioritized replay
    );

    // Initialize exploration strategy
    this.explorationStrategy = new ExplorationStrategy(config.exploration);
  }

  /**
   * Select action for given state
   */
  async selectAction(state: State, training: boolean = true): Promise<Action> {
    if (training && this.explorationStrategy.shouldExplore()) {
      // Explore: sample from policy
      return await this.policyNetwork.sampleAction(state);
    } else {
      // Exploit: get best action from policy
      const actionProbs = await this.policyNetwork.getActionProbabilities(state);

      // Select action with highest probability
      let bestAction: Action | null = null;
      let bestProb = -Infinity;

      for (const [action, prob] of actionProbs.entries()) {
        if (prob > bestProb) {
          bestProb = prob;
          bestAction = action;
        }
      }

      if (!bestAction) {
        return await this.policyNetwork.sampleAction(state);
      }

      return bestAction;
    }
  }

  /**
   * Store experience and learn
   */
  async learn(
    state: State,
    action: Action,
    reward: number,
    nextState: State,
    done: boolean
  ): Promise<void> {
    // Store experience in buffer
    const experience: Experience = {
      state,
      action,
      reward,
      nextState,
      done,
      timestamp: Date.now(),
    };

    // Calculate TD error for prioritized replay
    const tdError = await this.valueNetwork.computeTDError(
      state,
      reward,
      nextState,
      this.config.discountFactor
    );

    this.experienceBuffer.add(experience, tdError);

    // Update exploration strategy
    this.explorationStrategy.updateAfterStep(action, reward);

    // Increment step counter
    this.step++;

    // Train if buffer is ready and update frequency reached
    if (
      this.experienceBuffer.isReady(this.config.batchSize) &&
      this.step % this.config.updateFrequency === 0
    ) {
      await this.trainOnBatch();
    }

    // Update target network periodically
    if (
      this.config.targetUpdateFrequency &&
      this.step % this.config.targetUpdateFrequency === 0
    ) {
      this.updateTargetNetwork();
    }

    // Track episode metrics
    if (done) {
      this.endEpisode(reward);
    }
  }

  /**
   * Train on batch of experiences
   */
  private async trainOnBatch(): Promise<void> {
    // Sample batch from replay buffer
    const batch = this.experienceBuffer.sample(this.config.batchSize);

    if (batch.length === 0) return;

    // Separate batch components
    const states = batch.map((exp) => exp.state);
    const actions = batch.map((exp) => exp.action);
    const rewards = batch.map((exp) => exp.reward);
    const nextStates = batch.map((exp) => exp.nextState);
    const dones = batch.map((exp) => exp.done);

    // Compute advantages for policy gradient
    const advantages = await this.computeAdvantages(
      states,
      rewards,
      nextStates,
      dones
    );

    // Update policy network
    await this.policyNetwork.trainOnBatch(states, actions, advantages);

    // Compute value targets
    const valueTargets = await this.computeValueTargets(
      rewards,
      nextStates,
      dones
    );

    // Update value network
    await this.valueNetwork.trainOnBatch(states, valueTargets);
  }

  /**
   * Compute advantages for policy gradient
   * Advantage = Q(s,a) - V(s) = r + γV(s') - V(s)
   */
  private async computeAdvantages(
    states: State[],
    rewards: number[],
    nextStates: State[],
    dones: boolean[]
  ): Promise<number[]> {
    // Estimate values for current and next states
    const currentValues = await this.valueNetwork.batchEstimateValues(states);
    const nextValues = await this.targetValueNetwork.batchEstimateValues(
      nextStates
    );

    // Compute advantages
    const advantages = rewards.map((reward, i) => {
      const nextValue = dones[i] ? 0 : nextValues[i];
      const target = reward + this.config.discountFactor * nextValue;
      return target - currentValues[i];
    });

    return advantages;
  }

  /**
   * Compute value targets
   * Target = r + γV(s')
   */
  private async computeValueTargets(
    rewards: number[],
    nextStates: State[],
    dones: boolean[]
  ): Promise<number[]> {
    const nextValues = await this.targetValueNetwork.batchEstimateValues(
      nextStates
    );

    return rewards.map((reward, i) => {
      const nextValue = dones[i] ? 0 : nextValues[i];
      return reward + this.config.discountFactor * nextValue;
    });
  }

  /**
   * Update target network (soft update)
   */
  private updateTargetNetwork(tau: number = 0.01): void {
    this.targetValueNetwork.softUpdate(this.valueNetwork, tau);
  }

  /**
   * End episode and track metrics
   */
  private endEpisode(finalReward: number): void {
    this.episode++;
    this.episodeRewards.push(finalReward);
    this.episodeSuccesses.push(finalReward > 0 ? 1 : 0);

    // Keep only last 100 episodes
    if (this.episodeRewards.length > 100) {
      this.episodeRewards.shift();
      this.episodeSuccesses.shift();
    }
  }

  /**
   * Get training metrics
   */
  getMetrics(): TrainingMetrics {
    const recentRewards = this.episodeRewards.slice(-100);
    const recentSuccesses = this.episodeSuccesses.slice(-100);

    const averageReward =
      recentRewards.length > 0
        ? recentRewards.reduce((a, b) => a + b, 0) / recentRewards.length
        : 0;

    const successRate =
      recentSuccesses.length > 0
        ? recentSuccesses.reduce((a, b) => a + b, 0) / recentSuccesses.length
        : 0;

    return {
      totalSteps: this.step,
      episodes: this.episode,
      averageReward,
      successRate,
      averageLoss: 0, // TODO: track loss
      explorationRate: this.explorationStrategy.getExplorationRate(),
      timestamp: Date.now(),
    };
  }

  /**
   * Save model checkpoint
   */
  async saveCheckpoint(basePath: string): Promise<void> {
    await this.policyNetwork.save(`${basePath}/policy`);
    await this.valueNetwork.save(`${basePath}/value`);
    await this.targetValueNetwork.save(`${basePath}/target-value`);

    // Save metadata
    const checkpoint: Omit<ModelCheckpoint, 'policyWeights' | 'valueWeights'> = {
      metrics: this.getMetrics(),
      config: this.config,
      timestamp: Date.now(),
      version: '2.0.0',
    };

    const fs = await import('fs/promises');
    await fs.writeFile(
      `${basePath}/checkpoint.json`,
      JSON.stringify(checkpoint, null, 2)
    );
  }

  /**
   * Load model checkpoint
   */
  async loadCheckpoint(basePath: string): Promise<void> {
    await this.policyNetwork.load(`${basePath}/policy`);
    await this.valueNetwork.load(`${basePath}/value`);
    await this.targetValueNetwork.load(`${basePath}/target-value`);

    // Load metadata
    const fs = await import('fs/promises');
    const checkpointData = await fs.readFile(`${basePath}/checkpoint.json`, 'utf-8');
    const checkpoint = JSON.parse(checkpointData);

    this.step = checkpoint.metrics.totalSteps;
    this.episode = checkpoint.metrics.episodes;
  }

  /**
   * Reset engine (for new training)
   */
  reset(): void {
    this.step = 0;
    this.episode = 0;
    this.episodeRewards = [];
    this.episodeSuccesses = [];
    this.experienceBuffer.clear();
    this.explorationStrategy.reset();
  }

  /**
   * Get buffer statistics
   */
  getBufferStats() {
    return this.experienceBuffer.getStats();
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.policyNetwork.dispose();
    this.valueNetwork.dispose();
    this.targetValueNetwork.dispose();
  }
}
