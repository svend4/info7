/**
 * Leonardo AI RL Engine - Usage Example
 *
 * Demonstrates how to use the RL optimization module
 */

import { LeonardoRLEngine, DEFAULT_RL_CONFIG } from './leonardo-rl-engine';
import { State, Action } from './types';

/**
 * Simulate task execution
 */
async function executeTask(
  state: State,
  action: Action
): Promise<{
  success: boolean;
  quality: number;
  executionTime: number;
  resourcesUsed: { memory: number; apiCalls: number; cost: number };
}> {
  // Simulate task execution based on action
  const baseExecutionTime = 30; // seconds
  const timeMultiplier = action.strategy.analysisDepth / 3;
  const executionTime = baseExecutionTime * timeMultiplier;

  // Simulate success probability based on complexity and strategy
  const successProb =
    1 - state.complexity * 0.5 + action.strategy.analysisDepth * 0.1;
  const success = Math.random() < Math.max(0.1, Math.min(0.95, successProb));

  // Simulate quality
  const quality = success
    ? 0.6 + action.strategy.analysisDepth * 0.1 + Math.random() * 0.2
    : 0.2 + Math.random() * 0.2;

  // Simulate resource usage
  const memory = (action.resources.maxMemory * (0.5 + Math.random() * 0.3));
  const apiCalls = Math.floor(
    action.resources.maxAPICalls * (0.6 + Math.random() * 0.3)
  );
  const cost = apiCalls * 0.01;

  return {
    success,
    quality: Math.min(1, quality),
    executionTime,
    resourcesUsed: { memory, apiCalls, cost },
  };
}

/**
 * Create initial state
 */
function createInitialState(taskComplexity: number): State {
  return {
    task: 'Example task',
    complexity: taskComplexity,
    resources: {
      orchestratorAvailable: true,
      openclawAvailable: true,
      externalAPIsAvailable: ['openai', 'anthropic'],
    },
    history: {
      recentActions: [],
      recentRewards: [],
      successRate: 0.5,
    },
    userContext: {
      preferredMode: 'balanced',
      timeConstraint: 60,
      qualityThreshold: 0.7,
    },
    metrics: {
      cpuUsage: 20,
      memoryUsage: 30,
      queueLength: 2,
    },
    timestamp: Date.now(),
  };
}

/**
 * Create next state after action
 */
function createNextState(
  prevState: State,
  action: Action,
  result: { success: boolean; quality: number }
): State {
  return {
    ...prevState,
    history: {
      recentActions: [...prevState.history.recentActions.slice(-4), action],
      recentRewards: [
        ...prevState.history.recentRewards.slice(-4),
        result.success ? result.quality * 10 : -5,
      ],
      successRate:
        (prevState.history.successRate * 0.9 +
          (result.success ? 1 : 0) * 0.1),
    },
    timestamp: Date.now(),
  };
}

/**
 * Main example
 */
async function main() {
  console.log('🧠 Leonardo AI RL Engine - Example\n');

  // Initialize RL engine
  const rlEngine = new LeonardoRLEngine(DEFAULT_RL_CONFIG);

  console.log('✅ RL Engine initialized');
  console.log('📊 Configuration:', {
    learningRate: DEFAULT_RL_CONFIG.learningRate,
    discountFactor: DEFAULT_RL_CONFIG.discountFactor,
    bufferSize: DEFAULT_RL_CONFIG.bufferSize,
    explorationStrategy: DEFAULT_RL_CONFIG.exploration.strategy,
  });
  console.log();

  // Training loop
  const numEpisodes = 10;
  const maxStepsPerEpisode = 5;

  console.log(`🎓 Starting training: ${numEpisodes} episodes\n`);

  for (let episode = 1; episode <= numEpisodes; episode++) {
    console.log(`📝 Episode ${episode}/${numEpisodes}`);

    let state = createInitialState(Math.random()); // Random complexity
    let episodeReward = 0;

    for (let step = 0; step < maxStepsPerEpisode; step++) {
      // Select action
      const action = await rlEngine.selectAction(state, true);

      console.log(`  Step ${step + 1}: Mode = ${action.mode}, Depth = ${action.strategy.analysisDepth}`);

      // Execute task
      const result = await executeTask(state, action);

      // Calculate reward
      const rewardComponents = {
        taskSuccess: result.success ? 1 : 0,
        quality: result.quality,
        timeEfficiency: Math.max(0, 1 - result.executionTime / 60),
        resourceEfficiency:
          1 - result.resourcesUsed.memory / action.resources.maxMemory,
        costEfficiency: 1 - result.resourcesUsed.cost / 0.1,
      };

      const reward =
        rewardComponents.taskSuccess * 10 +
        rewardComponents.quality * 5 +
        rewardComponents.timeEfficiency * 2 +
        rewardComponents.resourceEfficiency * 2 +
        rewardComponents.costEfficiency * 2;

      episodeReward += reward;

      // Create next state
      const nextState = createNextState(state, action, result);

      // Learn from experience
      await rlEngine.learn(
        state,
        action,
        reward,
        nextState,
        step === maxStepsPerEpisode - 1
      );

      console.log(`    → Success: ${result.success}, Quality: ${result.quality.toFixed(2)}, Reward: ${reward.toFixed(2)}`);

      state = nextState;
    }

    const metrics = rlEngine.getMetrics();
    console.log(`  ✅ Episode reward: ${episodeReward.toFixed(2)}`);
    console.log(`  📈 Avg reward (last 100): ${metrics.averageReward.toFixed(2)}`);
    console.log(`  🎯 Success rate: ${(metrics.successRate * 100).toFixed(1)}%`);
    console.log(`  🔍 Exploration rate: ${(metrics.explorationRate * 100).toFixed(1)}%`);
    console.log();
  }

  // Final metrics
  const finalMetrics = rlEngine.getMetrics();
  const bufferStats = rlEngine.getBufferStats();

  console.log('🎉 Training complete!\n');
  console.log('📊 Final Metrics:');
  console.log(`  Total steps: ${finalMetrics.totalSteps}`);
  console.log(`  Episodes: ${finalMetrics.episodes}`);
  console.log(`  Average reward: ${finalMetrics.averageReward.toFixed(2)}`);
  console.log(`  Success rate: ${(finalMetrics.successRate * 100).toFixed(1)}%`);
  console.log(`  Exploration rate: ${(finalMetrics.explorationRate * 100).toFixed(1)}%`);
  console.log();
  console.log('💾 Experience Buffer Stats:');
  console.log(`  Size: ${bufferStats.size}/${DEFAULT_RL_CONFIG.bufferSize}`);
  console.log(`  Avg reward: ${bufferStats.avgReward.toFixed(2)}`);
  console.log(`  Success rate: ${(bufferStats.successRate * 100).toFixed(1)}%`);
  console.log();

  // Test learned policy (inference mode)
  console.log('🧪 Testing learned policy (no exploration):\n');

  for (let test = 1; test <= 3; test++) {
    const testState = createInitialState(0.5); // Medium complexity
    const testAction = await rlEngine.selectAction(testState, false); // No exploration

    console.log(`Test ${test}:`);
    console.log(`  Selected mode: ${testAction.mode}`);
    console.log(`  Analysis depth: ${testAction.strategy.analysisDepth}`);
    console.log(`  Use Orchestrator: ${testAction.strategy.useOrchestrator}`);
    console.log(`  Use OpenClaw: ${testAction.strategy.useOpenclaw}`);
    console.log();
  }

  // Clean up
  rlEngine.dispose();
  console.log('✅ Resources disposed');
}

// Run example if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as runRLExample };
