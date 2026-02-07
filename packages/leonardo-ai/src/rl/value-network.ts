/**
 * Leonardo AI - Value Network
 *
 * Neural network that learns state value function V(s)
 * Estimates expected return from a given state
 */

import * as tf from '@tensorflow/tfjs-node';
import { State, Action, ValueFunction } from './types';

/**
 * Configuration for value network
 */
export interface ValueNetworkConfig {
  /** State feature dimension */
  stateDim: number;

  /** Hidden layer sizes */
  hiddenLayers: number[];

  /** Learning rate */
  learningRate: number;

  /** Activation function */
  activation?: 'relu' | 'tanh' | 'sigmoid';
}

/**
 * Value Network using TensorFlow.js
 */
export class ValueNetwork implements ValueFunction {
  private model: tf.LayersModel;
  private optimizer: tf.Optimizer;

  constructor(private config: ValueNetworkConfig) {
    this.model = this.buildModel();
    this.optimizer = tf.train.adam(config.learningRate);
  }

  /**
   * Build neural network model
   */
  private buildModel(): tf.LayersModel {
    const { stateDim, hiddenLayers, activation = 'relu' } = this.config;

    const model = tf.sequential();

    // Input layer
    model.add(
      tf.layers.dense({
        inputShape: [stateDim],
        units: hiddenLayers[0],
        activation,
        kernelInitializer: 'heNormal',
      })
    );

    // Hidden layers
    for (let i = 1; i < hiddenLayers.length; i++) {
      model.add(
        tf.layers.dense({
          units: hiddenLayers[i],
          activation,
          kernelInitializer: 'heNormal',
        })
      );
    }

    // Output layer (single value - state value)
    model.add(
      tf.layers.dense({
        units: 1,
        activation: 'linear',
        kernelInitializer: 'glorotNormal',
      })
    );

    return model;
  }

  /**
   * Extract features from state (same as policy network)
   */
  private extractFeatures(state: State): number[] {
    const features: number[] = [];

    features.push(state.complexity);
    features.push(state.resources.orchestratorAvailable ? 1 : 0);
    features.push(state.resources.openclawAvailable ? 1 : 0);
    features.push(state.resources.externalAPIsAvailable.length / 10);
    features.push(state.history.successRate);

    const recentRewards = state.history.recentRewards.slice(-5);
    const avgRecentReward =
      recentRewards.length > 0
        ? recentRewards.reduce((a, b) => a + b, 0) / recentRewards.length
        : 0;
    features.push(avgRecentReward / 10);

    const preferredModeEncoding = {
      fast: 0,
      balanced: 0.5,
      thorough: 1,
    };
    features.push(
      state.userContext?.preferredMode
        ? preferredModeEncoding[state.userContext.preferredMode]
        : 0.5
    );
    features.push((state.userContext?.timeConstraint ?? 60) / 300);
    features.push(state.userContext?.qualityThreshold ?? 0.7);

    features.push(Math.min(1, state.metrics.cpuUsage / 100));
    features.push(Math.min(1, state.metrics.memoryUsage / 100));
    features.push(Math.min(1, state.metrics.queueLength / 10));

    const hour = new Date(state.timestamp).getHours();
    features.push(Math.sin((2 * Math.PI * hour) / 24));
    features.push(Math.cos((2 * Math.PI * hour) / 24));

    return features;
  }

  /**
   * Estimate value of state
   */
  async estimateValue(state: State): Promise<number> {
    const features = this.extractFeatures(state);
    const stateTensor = tf.tensor2d([features]);

    // Forward pass
    const output = this.model.predict(stateTensor) as tf.Tensor2D;
    const value = (await output.data())[0];

    // Clean up
    stateTensor.dispose();
    output.dispose();

    return value;
  }

  /**
   * Estimate Q-value (state-action value)
   * Q(s,a) = V(s) + advantage(s,a)
   * For simplicity, we approximate as V(s')
   */
  async estimateQValue(state: State, action: Action): Promise<number> {
    // Simplified: just return state value
    // In practice, you'd want a separate Q-network or use advantage estimation
    return this.estimateValue(state);
  }

  /**
   * Update value function with target value
   */
  async update(state: State, target: number): Promise<void> {
    const features = this.extractFeatures(state);
    const stateTensor = tf.tensor2d([features]);
    const targetTensor = tf.tensor2d([[target]]);

    // Gradient descent step
    await this.optimizer.minimize(() => {
      const prediction = this.model.predict(stateTensor) as tf.Tensor2D;
      const loss = tf.losses.meanSquaredError(targetTensor, prediction);
      return loss;
    });

    // Clean up
    stateTensor.dispose();
    targetTensor.dispose();
  }

  /**
   * Train on batch of experiences
   */
  async trainOnBatch(
    states: State[],
    targets: number[]
  ): Promise<number> {
    return tf.tidy(() => {
      // Convert states to tensors
      const stateTensors = states.map((s) => this.extractFeatures(s));
      const stateBatch = tf.tensor2d(stateTensors);
      const targetBatch = tf.tensor2d(targets.map((t) => [t]));

      // Compute loss
      const loss = this.optimizer.minimize(() => {
        const predictions = this.model.predict(stateBatch) as tf.Tensor2D;
        return tf.losses.meanSquaredError(targetBatch, predictions);
      }, true);

      return loss?.dataSync()[0] ?? 0;
    });
  }

  /**
   * Compute TD error (for prioritized replay)
   * TD error = r + γ*V(s') - V(s)
   */
  async computeTDError(
    state: State,
    reward: number,
    nextState: State,
    gamma: number
  ): Promise<number> {
    const currentValue = await this.estimateValue(state);
    const nextValue = await this.estimateValue(nextState);

    const tdTarget = reward + gamma * nextValue;
    const tdError = Math.abs(tdTarget - currentValue);

    return tdError;
  }

  /**
   * Batch estimate values
   */
  async batchEstimateValues(states: State[]): Promise<number[]> {
    if (states.length === 0) return [];

    const featureBatch = states.map((s) => this.extractFeatures(s));
    const stateTensor = tf.tensor2d(featureBatch);

    const output = this.model.predict(stateTensor) as tf.Tensor2D;
    const values = await output.data();

    stateTensor.dispose();
    output.dispose();

    return Array.from(values);
  }

  /**
   * Save model weights
   */
  async save(path: string): Promise<void> {
    await this.model.save(`file://${path}`);
  }

  /**
   * Load model weights
   */
  async load(path: string): Promise<void> {
    this.model = await tf.loadLayersModel(`file://${path}/model.json`);
  }

  /**
   * Get model summary
   */
  getSummary(): string {
    const summary: string[] = [];
    this.model.summary(undefined, undefined, (line) => summary.push(line));
    return summary.join('\n');
  }

  /**
   * Clone network (for target networks in DQN)
   */
  clone(): ValueNetwork {
    const clonedConfig = { ...this.config };
    const clonedNetwork = new ValueNetwork(clonedConfig);

    // Copy weights
    const weights = this.model.getWeights();
    const clonedWeights = weights.map((w) => w.clone());
    clonedNetwork.model.setWeights(clonedWeights);

    return clonedNetwork;
  }

  /**
   * Soft update from another network (for target network updates)
   * target = τ * source + (1-τ) * target
   */
  softUpdate(sourceNetwork: ValueNetwork, tau: number): void {
    const sourceWeights = sourceNetwork.model.getWeights();
    const targetWeights = this.model.getWeights();

    const updatedWeights = targetWeights.map((tw, i) => {
      const sw = sourceWeights[i];
      return tf.tidy(() => {
        return tf.add(
          tf.mul(sw, tau),
          tf.mul(tw, 1 - tau)
        );
      });
    });

    this.model.setWeights(updatedWeights);

    // Clean up old weights
    updatedWeights.forEach((w) => w.dispose());
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.model.dispose();
  }
}
