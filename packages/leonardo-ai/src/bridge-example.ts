/**
 * Bridge Layer Usage Example
 *
 * Demonstrates integration between Leonardo AI and external systems
 * (Orchestrator Kit, OpenClaw Meta-Agents).
 */

import { LeonardoRLEngine } from './rl/leonardo-rl-engine';
import { RAGEngine } from './rag/rag-engine';
import {
  IntegrationBridge,
  OrchestratorContext,
  OpenClawContext,
  SystemFeedback,
  SystemType,
} from './bridge';
import { ActionType } from './rl/types';

/**
 * Example usage of Integration Bridge
 */
async function runBridgeExample() {
  console.log('🌉 Leonardo AI - Bridge Layer Example\n');
  console.log('━'.repeat(60));
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Setup: Initialize Leonardo AI components
  // ═══════════════════════════════════════════════════════════════

  console.log('Step 1: Initializing Leonardo AI components\n');

  const rlEngine = new LeonardoRLEngine({
    learningRate: 0.001,
    discountFactor: 0.99,
    batchSize: 32,
    memorySize: 10000,
    updateFrequency: 4,
    targetUpdateFrequency: 100,
    explorationStrategy: 'epsilon-greedy',
    initialExploration: 1.0,
    minExploration: 0.1,
    explorationDecay: 0.995,
  });

  const ragEngine = new RAGEngine({
    pineconeApiKey: 'test-key',
    pineconeEnvironment: 'test-env',
    indexName: 'leonardo-knowledge',
    embeddingModel: 'text-embedding-ada-002',
    chunkSize: 500,
    chunkOverlap: 50,
    topK: 5,
    minRelevanceScore: 0.7,
  });

  // Add some knowledge to RAG
  await ragEngine.addDocument({
    id: 'knowledge-1',
    content: 'For high-priority tasks, direct execution is often preferred for speed.',
    metadata: { type: 'best-practice', category: 'execution' },
  });

  await ragEngine.addDocument({
    id: 'knowledge-2',
    content: 'Complex tasks benefit from orchestration to ensure quality and coordination.',
    metadata: { type: 'best-practice', category: 'orchestration' },
  });

  console.log('✅ Components initialized\n');
  console.log('━'.repeat(60));
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Initialize Bridge
  // ═══════════════════════════════════════════════════════════════

  console.log('Step 2: Initializing Integration Bridge\n');

  const bridge = new IntegrationBridge(rlEngine, ragEngine, {
    enableLearning: true,
    knowledgeThreshold: 0.7,
    confidenceThreshold: 0.6,
    feedbackBufferSize: 100,
  });

  console.log('✅ Bridge initialized\n');
  console.log('━'.repeat(60));
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Example 1: Bridge to Orchestrator Kit
  // ═══════════════════════════════════════════════════════════════

  console.log('Example 1: Integration with Orchestrator Kit\n');

  const orchestratorContext: OrchestratorContext = {
    tenantId: 'tenant-001',
    userId: 'user-123',
    task: {
      id: 'task-001',
      type: 'data-analysis',
      description: 'Analyze customer data to identify trends',
      priority: 'high',
      deadline: Date.now() + 3600000,  // 1 hour from now
    },
    constraints: {
      timeLimit: 3600000,
      budgetLimit: 1000,
      qualityThreshold: 0.9,
    },
    resources: {
      available: ['database', 'analytics-engine', 'ml-models'],
      allocated: [],
    },
  };

  console.log('Context:');
  console.log(`  Task: ${orchestratorContext.task.type}`);
  console.log(`  Priority: ${orchestratorContext.task.priority}`);
  console.log(`  Time Limit: ${orchestratorContext.constraints.timeLimit! / 1000}s`);
  console.log();

  const orchestratorAction = await bridge.bridgeToOrchestrator(orchestratorContext);

  console.log('Recommendation:');
  console.log(`  Action: ${orchestratorAction.type}`);
  console.log(`  Confidence: ${(orchestratorAction.confidence * 100).toFixed(1)}%`);
  console.log(`  Reasoning: ${orchestratorAction.reasoning}`);
  console.log();

  console.log('Estimated Impact:');
  console.log(`  Time to Complete: ${(orchestratorAction.estimatedImpact.timeToComplete / 1000).toFixed(1)}s`);
  console.log(`  Success Probability: ${(orchestratorAction.estimatedImpact.successProbability * 100).toFixed(1)}%`);
  console.log(`  Resources Needed: ${orchestratorAction.estimatedImpact.resourcesNeeded.join(', ')}`);
  console.log();

  if (orchestratorAction.alternatives.length > 0) {
    console.log('Alternatives:');
    orchestratorAction.alternatives.forEach((alt, i) => {
      console.log(`  ${i + 1}. ${alt.type} (${(alt.confidence * 100).toFixed(1)}% confidence)`);
      console.log(`     Tradeoffs: ${alt.tradeoffs}`);
    });
    console.log();
  }

  console.log('Next Steps:');
  orchestratorAction.nextSteps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step}`);
  });
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Example 2: Bridge to OpenClaw Meta-Agents
  // ═══════════════════════════════════════════════════════════════

  console.log('Example 2: Integration with OpenClaw Meta-Agents\n');

  const openclawContext: OpenClawContext = {
    task: {
      id: 'task-002',
      type: 'legal-analysis',
      name: 'Analyze Contract',
      description: 'Review and analyze NDA contract for compliance',
      complexity: 0.8,
      priority: 'high',
    },
    availableAgents: [
      {
        id: 'agent-legal-001',
        type: 'legal-specialist',
        capabilities: ['contract-analysis', 'compliance-check'],
        currentLoad: 40,
        performance: 0.92,
      },
      {
        id: 'agent-legal-002',
        type: 'legal-specialist',
        capabilities: ['contract-analysis'],
        currentLoad: 70,
        performance: 0.88,
      },
      {
        id: 'agent-general-001',
        type: 'general',
        capabilities: ['analysis', 'review'],
        currentLoad: 20,
        performance: 0.75,
      },
    ],
    decompositionRequired: false,
  };

  console.log('Context:');
  console.log(`  Task: ${openclawContext.task.type}`);
  console.log(`  Complexity: ${openclawContext.task.complexity}`);
  console.log(`  Available Agents: ${openclawContext.availableAgents.length}`);
  console.log();

  const agentRecommendation = await bridge.bridgeToOpenClaw(openclawContext);

  console.log('Agent Recommendations:');
  agentRecommendation.recommendedAgents.forEach((rec, i) => {
    console.log(`  ${i + 1}. Agent: ${rec.agentId}`);
    console.log(`     Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
    console.log(`     Reasoning: ${rec.reasoning}`);
  });
  console.log();

  if (agentRecommendation.decomposition?.shouldDecompose) {
    console.log('Task Decomposition:');
    console.log(`  Recommended: Yes`);
    console.log(`  Execution Mode: ${agentRecommendation.decomposition.executionMode}`);
    console.log();
    console.log('  Suggested Subtasks:');
    agentRecommendation.decomposition.suggestedSubtasks.forEach((subtask, i) => {
      console.log(`    ${i + 1}. ${subtask.name}`);
      console.log(`       Description: ${subtask.description}`);
      console.log(`       Complexity: ${subtask.estimatedComplexity.toFixed(2)}`);
      console.log(`       Required Capabilities: ${subtask.requiredCapabilities.join(', ')}`);
    });
    console.log();
  } else {
    console.log('Task Decomposition:');
    console.log(`  Recommended: No (complexity below threshold)`);
    console.log();
  }

  console.log('Routing Strategy:');
  console.log(`  Strategy: ${agentRecommendation.routing.strategy}`);
  console.log(`  Reasoning: ${agentRecommendation.routing.reasoning}`);
  console.log();

  console.log(`Priority Score: ${agentRecommendation.priority.toFixed(2)}`);
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Example 3: Feedback Loop (Learning)
  // ═══════════════════════════════════════════════════════════════

  console.log('Example 3: Bidirectional Feedback Loop\n');

  // Simulate execution feedback from Orchestrator
  const orchestratorFeedback: SystemFeedback = {
    systemType: SystemType.ORCHESTRATOR,
    task: 'data-analysis',
    state: {
      task: 'data-analysis',
      complexity: 0.6,
      resources: {
        orchestratorAvailable: true,
        openclawAvailable: false,
        externalAPIsAvailable: ['database', 'analytics-engine'],
      },
      history: {
        recentActions: [],
        recentRewards: [],
        successRate: 0,
      },
      userContext: {
        preferredMode: 'fast',
        timeConstraint: 3600000,
        qualityThreshold: 0.9,
      },
      metrics: {
        cpuUsage: 50,
        memoryUsage: 60,
        queueLength: 5,
      },
      timestamp: Date.now(),
    },
    action: {
      type: ActionType.EXECUTE_DIRECTLY,
      confidence: 0.85,
      parameters: {},
    },
    reward: 0.92,  // High reward = successful execution
    nextState: {
      task: 'data-analysis',
      complexity: 0.6,
      resources: {
        orchestratorAvailable: true,
        openclawAvailable: false,
        externalAPIsAvailable: ['database', 'analytics-engine'],
      },
      history: {
        recentActions: [
          { type: ActionType.EXECUTE_DIRECTLY, confidence: 0.85, parameters: {} },
        ],
        recentRewards: [0.92],
        successRate: 1.0,
      },
      userContext: {
        preferredMode: 'fast',
        timeConstraint: 3600000,
        qualityThreshold: 0.9,
      },
      metrics: {
        cpuUsage: 45,
        memoryUsage: 55,
        queueLength: 4,
      },
      timestamp: Date.now(),
    },
    done: true,
    success: true,
    metadata: {
      duration: 2500,  // 2.5 seconds
      resourcesUsed: ['database', 'analytics-engine'],
      quality: 0.95,
    },
  };

  console.log('Feedback from Orchestrator:');
  console.log(`  Task: ${orchestratorFeedback.task}`);
  console.log(`  Action: ${orchestratorFeedback.action.type}`);
  console.log(`  Reward: ${orchestratorFeedback.reward.toFixed(2)}`);
  console.log(`  Success: ${orchestratorFeedback.success}`);
  console.log(`  Duration: ${orchestratorFeedback.metadata.duration}ms`);
  console.log(`  Quality: ${orchestratorFeedback.metadata.quality}`);
  console.log();

  await bridge.receiveFeedback(orchestratorFeedback);

  console.log('✅ Feedback processed and learning updated\n');
  console.log('━'.repeat(60));
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Example 4: Bridge Statistics
  // ═══════════════════════════════════════════════════════════════

  console.log('Example 4: Bridge Performance Statistics\n');

  const stats = bridge.getStatistics();

  console.log('Overall Statistics:');
  console.log(`  Total Requests: ${stats.totalRequests}`);
  console.log(`  Successful: ${stats.successfulRequests}`);
  console.log(`  Failed: ${stats.failedRequests}`);
  console.log(`  Success Rate: ${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%`);
  console.log();

  console.log('By System Type:');
  for (const [systemType, typeStats] of stats.bySystemType) {
    console.log(`  ${systemType}:`);
    console.log(`    Requests: ${typeStats.requests}`);
    console.log(`    Success Rate: ${(typeStats.successRate * 100).toFixed(1)}%`);
  }
  console.log();

  console.log('Learning Statistics:');
  console.log(`  Feedback Received: ${stats.feedbackReceived}`);
  console.log(`  Learning Iterations: ${stats.learningIterations}`);
  console.log();

  const metrics = bridge.getMetrics();
  console.log(`Total Metrics Collected: ${metrics.length}`);
  console.log();

  console.log('━'.repeat(60));
  console.log();
  console.log('✅ Bridge Layer example completed!\n');
  console.log('Summary:');
  console.log('  • Integrated with Orchestrator Kit for action recommendations');
  console.log('  • Integrated with OpenClaw for agent selection and task decomposition');
  console.log('  • Demonstrated bidirectional feedback loop for continuous learning');
  console.log('  • Tracked performance metrics and statistics');
  console.log();
}

// Run example if executed directly
if (require.main === module) {
  runBridgeExample().catch(console.error);
}

export { runBridgeExample };
