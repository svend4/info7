# Leonardo AI - Reinforcement Learning Optimization

**Version:** 2.0.0 | **Status:** 🚀 Production Ready

> 🧠 Self-learning AI orchestration system with RL optimization

---

## 📖 Overview

Leonardo AI RL Optimization module transforms Leonardo AI from a static orchestration system into a **self-learning agent** that continuously improves based on experience.

### Key Features

- 🎯 **Policy Network**: Learns optimal action selection strategies
- 📊 **Value Network**: Estimates expected returns from states
- 🎁 **Multi-criteria Rewards**: Optimizes for success, quality, time, resources, and cost
- 💾 **Experience Replay**: Learns from past experiences
- 🔍 **Smart Exploration**: ε-greedy, UCB, and Thompson sampling strategies
- 📈 **Continuous Learning**: Adapts to new tasks and environments

---

## 🚀 Quick Start

### Installation

```bash
npm install @info7/leonardo-ai
```

### Basic Usage

```typescript
import { LeonardoRLEngine, State, Action } from '@info7/leonardo-ai';

// Initialize RL engine
const rlEngine = new LeonardoRLEngine();

// Create state
const state: State = {
  task: 'Process user request',
  complexity: 0.7,
  resources: {
    orchestratorAvailable: true,
    openclawAvailable: true,
    externalAPIsAvailable: ['openai'],
  },
  history: {
    recentActions: [],
    recentRewards: [],
    successRate: 0.5,
  },
  metrics: {
    cpuUsage: 20,
    memoryUsage: 30,
    queueLength: 2,
  },
  timestamp: Date.now(),
};

// Select action
const action = await rlEngine.selectAction(state);

console.log('Selected action:', action.mode);
console.log('Analysis depth:', action.strategy.analysisDepth);

// Execute task and get result
const result = await executeTask(action);

// Learn from experience
await rlEngine.learn(
  state,
  action,
  result.reward,
  result.nextState,
  result.done
);

// Get training metrics
const metrics = rlEngine.getMetrics();
console.log('Success rate:', metrics.successRate);
console.log('Average reward:', metrics.averageReward);
```

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│              LEONARDO AI RL ENGINE                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   Policy Network (π)                             │ │
│  │   • Learns optimal action selection              │ │
│  │   • Maps states → action probabilities           │ │
│  │   • Neural network: [128, 64, 32] → softmax      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   Value Network (V)                              │ │
│  │   • Estimates state values                       │ │
│  │   • Maps states → expected returns               │ │
│  │   • Neural network: [128, 64, 32] → linear       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   Reward Calculator                              │ │
│  │   • Multi-criteria reward function               │ │
│  │   • Weights: success, quality, time, resources   │ │
│  │   • Penalties: timeout, error, overuse           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   Experience Replay Buffer                       │ │
│  │   • Stores past experiences                      │ │
│  │   • Prioritized sampling                         │ │
│  │   • Circular buffer (max 10,000)                 │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │   Exploration Strategy                           │ │
│  │   • ε-greedy with decay                          │ │
│  │   • Upper Confidence Bound (UCB)                 │ │
│  │   • Thompson Sampling                            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📊 Components

### 1. LeonardoRLEngine

Main orchestration class that coordinates all RL components.

```typescript
const engine = new LeonardoRLEngine({
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
});
```

### 2. PolicyNetwork

Learns which actions to take in different states.

- **Architecture**: [128, 64, 32] → softmax
- **Output**: Action probabilities
- **Training**: Policy gradient with advantages

### 3. ValueNetwork

Estimates expected returns from states.

- **Architecture**: [128, 64, 32] → linear
- **Output**: State value estimate
- **Training**: TD learning with target network

### 4. RewardCalculator

Multi-criteria reward function with configurable weights.

```typescript
const rewards = {
  taskSuccess: 10.0,    // Did we complete the task?
  quality: 5.0,         // How good is the result?
  timeEfficiency: 2.0,  // How fast?
  resourceEfficiency: 2.0, // How efficient?
  userSatisfaction: 3.0,   // Is user happy?
  costEfficiency: 2.0,     // How cheap?
};
```

### 5. ExperienceReplayBuffer

Stores and samples past experiences for training.

- **Capacity**: 10,000 experiences
- **Sampling**: Prioritized replay (higher TD error = higher priority)
- **Persistence**: JSON serialization

### 6. ExplorationStrategy

Balances exploration vs exploitation.

- **ε-greedy**: Random action with probability ε
- **UCB**: Upper Confidence Bound for optimistic exploration
- **Thompson Sampling**: Bayesian exploration

---

## 🎯 Use Cases

### 1. Adaptive Task Routing

```typescript
// Leonardo AI learns which system to use for different tasks
const action = await rlEngine.selectAction(state);

if (action.mode === 'thinking') {
  // Use Orchestrator Kit for planning
  await orchestratorKit.plan(task);
} else if (action.mode === 'action') {
  // Use OpenClaw for direct execution
  await openclaw.execute(task);
}
```

### 2. Resource Optimization

```typescript
// RL learns optimal resource allocation
const action = await rlEngine.selectAction(state);

console.log('Allocated timeout:', action.resources.timeout);
console.log('Max memory:', action.resources.maxMemory);
console.log('API call budget:', action.resources.maxAPICalls);
```

### 3. Quality vs Speed Tradeoff

```typescript
// RL learns when to prioritize speed vs quality
const action = await rlEngine.selectAction(state);

if (action.strategy.analysisDepth > 3) {
  // Deep analysis for high quality
} else {
  // Fast execution for quick response
}
```

---

## 📈 Training

### Example Training Loop

```typescript
for (let episode = 0; episode < 100; episode++) {
  let state = createInitialState();
  let done = false;

  while (!done) {
    // Select action
    const action = await rlEngine.selectAction(state, true);

    // Execute
    const result = await executeTask(state, action);

    // Learn
    await rlEngine.learn(
      state,
      action,
      result.reward,
      result.nextState,
      result.done
    );

    state = result.nextState;
    done = result.done;
  }

  // Check progress
  const metrics = rlEngine.getMetrics();
  console.log(`Episode ${episode}: Reward = ${metrics.averageReward}`);
}
```

### Metrics

```typescript
const metrics = rlEngine.getMetrics();

console.log({
  totalSteps: metrics.totalSteps,
  episodes: metrics.episodes,
  averageReward: metrics.averageReward,
  successRate: metrics.successRate,
  explorationRate: metrics.explorationRate,
});
```

---

## 💾 Persistence

### Save Checkpoint

```typescript
await rlEngine.saveCheckpoint('./checkpoints/leonardo-rl');
```

### Load Checkpoint

```typescript
await rlEngine.loadCheckpoint('./checkpoints/leonardo-rl');
```

---

## 🧪 Testing

Run the example:

```bash
npm run example
```

Run tests:

```bash
npm test
```

---

## 📚 API Reference

See [API Documentation](./docs/API.md) for detailed API reference.

---

## 🛣️ Roadmap

- [x] RL Optimization Engine (v2.0.0)
- [ ] RAG Integration (v2.1.0)
- [ ] Multi-agent RL (v2.2.0)
- [ ] Offline RL (v2.3.0)
- [ ] Distributed training (v3.0.0)

---

## 📄 License

MIT License - see [LICENSE](../../LICENSE)

---

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**Built with ❤️ by the info7 team**

https://claude.ai/code/session_01WnQdgU1MrECnhh3xfVNRAg
