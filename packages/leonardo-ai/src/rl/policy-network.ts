/**
 * Leonardo AI - Policy Network
 *
 * Neural network that learns optimal policy π(a|s)
 * Maps states to action probabilities
 */

import * as tf from '@tensorflow/tfjs-node';
import { State, Action, Policy } from './types';

/**
 * Configuration for policy network
 */
export interface PolicyNetworkConfig {
  /** State feature dimension */
  stateDim: number;

  /** Action space dimension */
  actionDim: number;

  /** Hidden layer sizes */
  hiddenLayers: number[];

  /** Learning rate */
  learningRate: number;

  /** Activation function */
  activation?: 'relu' | 'tanh' | 'sigmoid';
}

/**
 * Policy Network using TensorFlow.js
 */
export class PolicyNetwork implements Policy {
  private model: tf.LayersModel;
  private optimizer: tf.Optimizer;

  constructor(private config: PolicyNetworkConfig) {
    this.model = this.buildModel();
    this.optimizer = tf.train.adam(config.learningRate);
  }

  /**
   * Build neural network model
   */
  private buildModel(): tf.LayersModel {
    const { stateDim, actionDim, hiddenLayers, activation = 'relu' } = this.config;

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

    // Output layer (action probabilities)
    // Use softmax for discrete action probabilities
    model.add(
      tf.layers.dense({
        units: actionDim,
        activation: 'softmax',
        kernelInitializer: 'glorotNormal',
      })
    );

    return model;
  }

  /**
   * Convert state to tensor
   */
  private stateToTensor(state: State): tf.Tensor2D {
    // Extract features from state
    const features = this.extractFeatures(state);

    // Convert to tensor
    return tf.tensor2d([features]);
  }

  /**
   * Extract numerical features from state
   */
  private extractFeatures(state: State): number[] {
    const features: number[] = [];

    // Task complexity
    features.push(state.complexity);

    // Available resources (binary features)
    features.push(state.resources.orchestratorAvailable ? 1 : 0);
    features.push(state.resources.openclawAvailable ? 1 : 0);
    features.push(state.resources.externalAPIsAvailable.length / 10); // Normalized

    // Historical success rate
    features.push(state.history.successRate);

    // Recent rewards (average of last 5)
    const recentRewards = state.history.recentRewards.slice(-5);
    const avgRecentReward =
      recentRewards.length > 0
        ? recentRewards.reduce((a, b) => a + b, 0) / recentRewards.length
        : 0;
    features.push(avgRecentReward / 10); // Normalized

    // User preferences
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
    features.push((state.userContext?.timeConstraint ?? 60) / 300); // Normalized to 0-1
    features.push(state.userContext?.qualityThreshold ?? 0.7);

    // System metrics (normalized)
    features.push(Math.min(1, state.metrics.cpuUsage / 100));
    features.push(Math.min(1, state.metrics.memoryUsage / 100));
    features.push(Math.min(1, state.metrics.queueLength / 10));

    // Time of day (cyclical encoding)
    const hour = new Date(state.timestamp).getHours();
    features.push(Math.sin((2 * Math.PI * hour) / 24));
    features.push(Math.cos((2 * Math.PI * hour) / 24));

    return features;
  }

  /**
   * Get action probabilities for given state
   */
  async getActionProbabilities(state: State): Promise<Map<Action, number>> {
    const stateTensor = this.stateToTensor(state);

    // Forward pass
    const output = this.model.predict(stateTensor) as tf.Tensor2D;
    const probabilities = await output.data();

    // Clean up tensors
    stateTensor.dispose();
    output.dispose();

    // Map probabilities to actions
    const actionProbs = new Map<Action, number>();

    // For now, we'll use a simplified action space
    // In production, you'd define all possible actions
    const availableActions = this.getAvailableActions(state);

    availableActions.forEach((action, idx) => {
      actionProbs.set(action, probabilities[idx] ?? 0);
    });

    return actionProbs;
  }

  /**
   * Sample action from policy
   */
  async sampleAction(state: State): Promise<Action> {
    const actionProbs = await this.getActionProbabilities(state);

    // Sample from categorical distribution
    const actions = Array.from(actionProbs.keys());
    const probs = Array.from(actionProbs.values());

    const sampledIdx = this.categoricalSample(probs);

    return actions[sampledIdx];
  }

  /**
   * Sample from categorical distribution
   */
  private categoricalSample(probabilities: number[]): number {
    const random = Math.random();
    let cumsum = 0;

    for (let i = 0; i < probabilities.length; i++) {
      cumsum += probabilities[i];
      if (random < cumsum) {
        return i;
      }
    }

    return probabilities.length - 1;
  }

  /**
   * Update policy using gradient
   */
  async update(gradient: number[]): Promise<void> {
    // This would typically be done using policy gradient methods
    // For now, we'll use a simple gradient descent update
    const gradientTensor = tf.tensor1d(gradient);

    // Apply gradient (this is simplified - in practice, you'd use policy gradient theorem)
    this.optimizer.applyGradients({ gradient: gradientTensor } as any);

    gradientTensor.dispose();
  }

  /**
   * Train on batch of experiences
   */
  async trainOnBatch(
    states: State[],
    actions: Action[],
    advantages: number[]
  ): Promise<number> {
    return tf.tidy(() => {
      // Convert states to tensors
      const stateTensors = states.map((s) => this.extractFeatures(s));
      const stateBatch = tf.tensor2d(stateTensors);

      // Convert actions to one-hot encoding
      const actionIndices = actions.map((a) => this.actionToIndex(a));
      const actionBatch = tf.oneHot(actionIndices, this.config.actionDim);

      // Advantages
      const advantageBatch = tf.tensor1d(advantages);

      // Compute loss and gradients
      const loss = this.optimizer.minimize(() => {
        const predictions = this.model.predict(stateBatch) as tf.Tensor2D;

        // Policy gradient loss: -log(π(a|s)) * advantage
        const logProbs = tf.log(
          tf.add(
            tf.sum(tf.mul(predictions, actionBatch), 1),
            1e-10 // Avoid log(0)
          )
        );

        const policyLoss = tf.neg(
          tf.mean(tf.mul(logProbs, advantageBatch))
        );

        return policyLoss;
      }, true);

      return loss?.dataSync()[0] ?? 0;
    });
  }

  /**
   * Get available actions for state
   * In production, this would be more sophisticated
   */
  private getAvailableActions(state: State): Action[] {
    const modes: Action['mode'][] = [
      'thinking',
      'action',
      'iterative',
      'parallel',
      'creative',
    ];

    return modes.map((mode) => ({
      mode,
      strategy: {
        useOrchestrator: state.resources.orchestratorAvailable,
        useOpenclaw: state.resources.openclawAvailable,
        analysisDepth: 3,
      },
      resources: {
        timeout: 60,
        maxMemory: 512,
        maxAPICalls: 10,
      },
      timestamp: Date.now(),
    }));
  }

  /**
   * Convert action to index (for one-hot encoding)
   */
  private actionToIndex(action: Action): number {
    const modes = ['thinking', 'action', 'iterative', 'parallel', 'creative'];
    return modes.indexOf(action.mode);
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
   * Dispose resources
   */
  dispose(): void {
    this.model.dispose();
  }
}
