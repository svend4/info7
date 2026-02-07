/**
 * Hierarchy Example
 *
 * Demonstrates the 5-level hierarchical agent system with delegation,
 * coordination, collaboration, and learning capabilities.
 */

import { Logger } from '@info7/common';
import {
  HierarchyCoordinator,
  HierarchyLevel,
  HierarchicalAgent,
  CoordinationStrategy,
  CollaborationRequest,
  KnowledgeShare,
  StrategicDirective,
} from './hierarchy';
import { Task, TaskResult, AgentCapability } from './core/types';

const logger = new Logger('hierarchy-example');

/**
 * Example 1: Building a Hierarchy
 */
async function example1_BuildingHierarchy() {
  logger.info('Example 1: Building a 5-Level Hierarchy');

  const coordinator = new HierarchyCoordinator();

  // Level 5: Meta-Meta-Agent (Strategic Planning)
  const metaMetaAgent: HierarchicalAgent = {
    id: 'meta-meta-1',
    level: HierarchyLevel.META_META_AGENT,
    capabilities: [AgentCapability.REASONING, AgentCapability.PLANNING],
    subordinates: [],
    status: 'idle',
    currentLoad: 0.1,
    performance: {
      tasksCompleted: 0,
      averageQuality: 0.9,
      averageSpeed: 0.8,
      successRate: 0.95,
    },
    metadata: {},
  };
  coordinator.registerAgent(metaMetaAgent);
  logger.info('✓ Meta-Meta-Agent registered (Strategic Planning)');

  // Level 4: Meta-Agents (High-level Coordination)
  const metaAgents: HierarchicalAgent[] = [];
  for (let i = 1; i <= 3; i++) {
    const metaAgent: HierarchicalAgent = {
      id: `meta-${i}`,
      level: HierarchyLevel.META_AGENT,
      capabilities: [AgentCapability.PLANNING, AgentCapability.COORDINATION],
      subordinates: [],
      supervisor: 'meta-meta-1',
      status: 'idle',
      currentLoad: 0.2,
      performance: {
        tasksCompleted: 0,
        averageQuality: 0.85,
        averageSpeed: 0.8,
        successRate: 0.9,
      },
      metadata: { domain: i === 1 ? 'operations' : i === 2 ? 'analytics' : 'development' },
    };
    coordinator.registerAgent(metaAgent);
    metaAgents.push(metaAgent);
    metaMetaAgent.subordinates.push(metaAgent.id);
  }
  logger.info('✓ 3 Meta-Agents registered (Operations, Analytics, Development)');

  // Level 3: Coordinators (Task Distribution)
  for (const metaAgent of metaAgents) {
    for (let i = 1; i <= 3; i++) {
      const coordinatorAgent: HierarchicalAgent = {
        id: `coord-${metaAgent.id}-${i}`,
        level: HierarchyLevel.COORDINATOR,
        capabilities: [AgentCapability.EXECUTION, AgentCapability.COORDINATION],
        subordinates: [],
        supervisor: metaAgent.id,
        status: 'idle',
        currentLoad: 0.3,
        performance: {
          tasksCompleted: 0,
          averageQuality: 0.8,
          averageSpeed: 0.85,
          successRate: 0.85,
        },
        metadata: {},
      };
      coordinator.registerAgent(coordinatorAgent);
      metaAgent.subordinates.push(coordinatorAgent.id);
    }
  }
  logger.info('✓ 9 Coordinators registered');

  // Level 2: Specialists (Domain-specific Execution)
  let specialistCount = 0;
  for (const metaAgent of metaAgents) {
    for (const coordId of metaAgent.subordinates) {
      for (let i = 1; i <= 2; i++) {
        const specialist: HierarchicalAgent = {
          id: `specialist-${coordId}-${i}`,
          level: HierarchyLevel.SPECIALIST,
          capabilities: [AgentCapability.EXECUTION],
          subordinates: [],
          supervisor: coordId,
          status: 'idle',
          currentLoad: 0.4,
          performance: {
            tasksCompleted: 0,
            averageQuality: 0.75,
            averageSpeed: 0.9,
            successRate: 0.8,
          },
          metadata: {},
        };
        coordinator.registerAgent(specialist);
        specialistCount++;
      }
    }
  }
  logger.info(`✓ ${specialistCount} Specialists registered`);

  // Level 1: Workers (Basic Execution)
  let workerCount = 0;
  const state = coordinator.getState();
  for (const agent of state.agents.values()) {
    if (agent.level === HierarchyLevel.SPECIALIST) {
      for (let i = 1; i <= 2; i++) {
        const worker: HierarchicalAgent = {
          id: `worker-${agent.id}-${i}`,
          level: HierarchyLevel.WORKER,
          capabilities: [AgentCapability.EXECUTION],
          subordinates: [],
          supervisor: agent.id,
          status: 'idle',
          currentLoad: 0.5,
          performance: {
            tasksCompleted: 0,
            averageQuality: 0.7,
            averageSpeed: 0.95,
            successRate: 0.75,
          },
          metadata: {},
        };
        coordinator.registerAgent(worker);
        agent.subordinates.push(worker.id);
        workerCount++;
      }
    }
  }
  logger.info(`✓ ${workerCount} Workers registered`);

  // Display hierarchy summary
  const finalState = coordinator.getState();
  logger.info('\n' + '='.repeat(60));
  logger.info('Hierarchy Summary:');
  logger.info(`  Total Agents: ${finalState.agents.size}`);
  logger.info(`  Meta-Meta-Agent: 1`);
  logger.info(`  Meta-Agents: 3`);
  logger.info(`  Coordinators: 9`);
  logger.info(`  Specialists: ${specialistCount}`);
  logger.info(`  Workers: ${workerCount}`);
  logger.info('='.repeat(60));

  return coordinator;
}

/**
 * Example 2: Task Delegation Through Hierarchy
 */
async function example2_TaskDelegation(coordinator: HierarchyCoordinator) {
  logger.info('\nExample 2: Task Delegation Through Hierarchy');

  // Strategic task from Meta-Meta-Agent
  const strategicTask: Task = {
    id: 'strategic-optimization-1',
    type: 'strategic-planning',
    description: 'Optimize system-wide resource allocation',
    priority: 'critical',
    complexity: 0.95,
  };

  logger.info(`\nDelegating strategic task: ${strategicTask.description}`);
  const delegation1 = await coordinator.delegateTask(strategicTask, HierarchyLevel.META_META_AGENT);
  logger.info(`→ Delegated to: ${delegation1.targetAgent.id} (Level ${delegation1.targetAgent.level})`);
  logger.info(`  Reasoning: ${delegation1.reasoning}`);

  // Complex task from Meta-Agent
  const complexTask: Task = {
    id: 'complex-analysis-1',
    type: 'coordination-task',
    description: 'Analyze and consolidate quarterly reports',
    priority: 'high',
    complexity: 0.7,
  };

  logger.info(`\nDelegating complex task: ${complexTask.description}`);
  const delegation2 = await coordinator.delegateTask(complexTask, HierarchyLevel.META_AGENT);
  logger.info(`→ Delegated to: ${delegation2.targetAgent.id} (Level ${delegation2.targetAgent.level})`);
  logger.info(`  Reasoning: ${delegation2.reasoning}`);

  // Medium task from Coordinator
  const mediumTask: Task = {
    id: 'medium-processing-1',
    type: 'data-processing',
    description: 'Process customer feedback data',
    priority: 'medium',
    complexity: 0.5,
  };

  logger.info(`\nDelegating medium task: ${mediumTask.description}`);
  const delegation3 = await coordinator.delegateTask(mediumTask, HierarchyLevel.COORDINATOR);
  logger.info(`→ Delegated to: ${delegation3.targetAgent.id} (Level ${delegation3.targetAgent.level})`);
  logger.info(`  Reasoning: ${delegation3.reasoning}`);

  // Simple task from Specialist
  const simpleTask: Task = {
    id: 'simple-validation-1',
    type: 'simple-validation',
    description: 'Validate data format',
    priority: 'low',
    complexity: 0.2,
  };

  logger.info(`\nDelegating simple task: ${simpleTask.description}`);
  const delegation4 = await coordinator.delegateTask(simpleTask, HierarchyLevel.SPECIALIST);
  logger.info(`→ Delegated to: ${delegation4.targetAgent.id} (Level ${delegation4.targetAgent.level})`);
  logger.info(`  Reasoning: ${delegation4.reasoning}`);

  const metrics = coordinator.getMetrics();
  logger.info(`\nDelegation Metrics:`);
  logger.info(`  Total Delegations: ${metrics.delegation.totalDelegations}`);
  logger.info(`  Average Delegation Time: ${metrics.delegation.averageDelegationTime.toFixed(0)}ms`);
}

/**
 * Example 3: Coordination Planning
 */
async function example3_CoordinationPlanning(coordinator: HierarchyCoordinator) {
  logger.info('\nExample 3: Coordination Planning for Complex Task');

  const complexTask: Task = {
    id: 'product-launch-1',
    type: 'product-launch',
    description: 'Launch new product feature',
    priority: 'critical',
    complexity: 0.85,
    dependencies: [],
  };

  logger.info(`\nPlanning coordination for: ${complexTask.description}`);

  const plan = await coordinator.createCoordinationPlan(complexTask);

  logger.info(`\nCoordination Plan:`);
  logger.info(`  Strategy: ${plan.strategy}`);
  logger.info(`  Subtasks: ${plan.subtasks.length}`);
  logger.info(`  Estimated Completion: ${new Date(plan.estimatedCompletion).toISOString()}`);

  logger.info(`\nSubtask Assignments:`);
  plan.subtasks.forEach((subtask, idx) => {
    logger.info(`  ${idx + 1}. ${subtask.task.description}`);
    logger.info(`     Assigned to: ${subtask.assignedTo}`);
    logger.info(`     Duration: ${subtask.estimatedDuration}ms`);
  });

  logger.info(`\nExecution Order:`);
  plan.executionOrder.forEach((taskId, idx) => {
    logger.info(`  ${idx + 1}. ${taskId}`);
  });

  logger.info(`\nContingency Plans:`);
  plan.contingencyPlans.forEach((contingency, idx) => {
    logger.info(`  ${idx + 1}. If ${contingency.trigger} → ${contingency.action}`);
  });
}

/**
 * Example 4: Agent Collaboration
 */
async function example4_Collaboration(coordinator: HierarchyCoordinator) {
  logger.info('\nExample 4: Agent Collaboration');

  const state = coordinator.getState();
  const specialists = Array.from(state.agents.values()).filter(a => a.level === HierarchyLevel.SPECIALIST);

  if (specialists.length < 3) {
    logger.warn('Not enough specialists for collaboration example');
    return;
  }

  const collaborationTask: Task = {
    id: 'collab-research-1',
    type: 'collaborative-research',
    description: 'Research and implement new algorithm',
    priority: 'high',
    complexity: 0.8,
  };

  const request: CollaborationRequest = {
    requesterId: specialists[0].id,
    targetAgents: [specialists[1].id, specialists[2].id],
    task: collaborationTask,
    collaborationType: 'joint-execution',
    urgency: 'high',
    context: {
      expertise: ['algorithm-design', 'optimization'],
    },
  };

  logger.info(`\nCollaboration Request:`);
  logger.info(`  Requester: ${request.requesterId}`);
  logger.info(`  Targets: ${request.targetAgents.join(', ')}`);
  logger.info(`  Task: ${collaborationTask.description}`);
  logger.info(`  Type: ${request.collaborationType}`);

  const responses = await coordinator.requestCollaboration(request);

  logger.info(`\nCollaboration Responses:`);
  responses.forEach((response, idx) => {
    logger.info(`  ${idx + 1}. ${response.responderId}: ${response.accepted ? 'ACCEPTED' : 'DECLINED'}`);
    if (response.accepted) {
      logger.info(`     Can start: ${new Date(response.availability.canStart).toISOString()}`);
      logger.info(`     Duration: ${response.availability.estimatedDuration}ms`);
    }
  });

  const acceptedCount = responses.filter(r => r.accepted).length;
  logger.info(`\nResult: ${acceptedCount}/${responses.length} agents accepted collaboration`);
}

/**
 * Example 5: Knowledge Sharing and Learning
 */
async function example5_LearningAndKnowledge(coordinator: HierarchyCoordinator) {
  logger.info('\nExample 5: Knowledge Sharing and Learning');

  const state = coordinator.getState();
  const workers = Array.from(state.agents.values()).filter(a => a.level === HierarchyLevel.WORKER);

  if (workers.length < 2) {
    logger.warn('Not enough workers for learning example');
    return;
  }

  const learningTask: Task = {
    id: 'data-processing-123',
    type: 'data-processing',
    description: 'Process customer data batch',
    priority: 'medium',
    complexity: 0.4,
  };

  // Simulate successful task execution
  const successResult: TaskResult = {
    taskId: learningTask.id,
    success: true,
    quality: 0.88,
    output: { processed: 1000, validated: 950 },
    duration: 2500,
  };

  logger.info(`\nAgent ${workers[0].id} completed task:`);
  logger.info(`  Task: ${learningTask.description}`);
  logger.info(`  Success: ${successResult.success}`);
  logger.info(`  Quality: ${successResult.quality?.toFixed(2)}`);

  // Record learning
  await coordinator.recordLearning(workers[0].id, learningTask, successResult);

  logger.info(`\nLearning recorded for ${workers[0].id}`);

  // Knowledge sharing
  const knowledge: KnowledgeShare = {
    sourceAgent: workers[0].id,
    targetAgent: workers[1].id,
    knowledge: {
      type: 'pattern',
      domain: 'data-processing',
      content: {
        technique: 'batch-processing',
        parameters: { batchSize: 100, validationThreshold: 0.95 },
      },
      confidence: 0.85,
      applicability: 0.9,
    },
    timestamp: Date.now(),
  };

  await coordinator.shareKnowledge(knowledge);

  logger.info(`\nKnowledge shared:`);
  logger.info(`  From: ${knowledge.sourceAgent}`);
  logger.info(`  To: ${knowledge.targetAgent}`);
  logger.info(`  Type: ${knowledge.knowledge.type}`);
  logger.info(`  Domain: ${knowledge.knowledge.domain}`);
  logger.info(`  Applicability: ${knowledge.knowledge.applicability.toFixed(2)}`);

  // Simulate more learning events
  for (let i = 0; i < 5; i++) {
    const task: Task = {
      id: `task-${i}`,
      type: 'data-processing',
      description: `Processing batch ${i}`,
      priority: 'medium',
      complexity: 0.4,
    };

    const result: TaskResult = {
      taskId: task.id,
      success: Math.random() > 0.2,
      quality: 0.7 + Math.random() * 0.2,
      output: {},
      duration: 2000,
    };

    await coordinator.recordLearning(workers[0].id, task, result);
  }

  const metrics = coordinator.getMetrics();
  logger.info(`\nLearning Metrics:`);
  logger.info(`  Total Learning Events: ${metrics.learning.totalLearningEvents}`);
  logger.info(`  Average Improvement: ${metrics.learning.averageImprovement.toFixed(3)}`);
  logger.info(`  Knowledge Base Size: ${metrics.learning.knowledgeBaseSize}`);
  logger.info(`  Knowledge Shares: ${metrics.collaboration.knowledgeShares}`);
}

/**
 * Example 6: Strategic Directive
 */
async function example6_StrategicDirective(coordinator: HierarchyCoordinator) {
  logger.info('\nExample 6: Strategic Directive from Meta-Meta-Agent');

  const state = coordinator.getState();
  const metaAgents = Array.from(state.agents.values()).filter(a => a.level === HierarchyLevel.META_AGENT);

  const directive: StrategicDirective = {
    id: 'strategic-directive-1',
    timestamp: Date.now(),
    directive: 'Optimize resource utilization across all subsystems',
    scope: 'system',
    targetAgents: metaAgents.map(a => a.id),
    priority: 'high',
    objectives: [
      {
        metric: 'resource-utilization',
        target: 0.85,
        deadline: Date.now() + 86400000, // 24 hours
      },
      {
        metric: 'task-throughput',
        target: 100,
        deadline: Date.now() + 86400000,
      },
    ],
    constraints: {
      maxCost: 10000,
      qualityThreshold: 0.8,
    },
    rationale: 'Current utilization is below target, impacting overall system efficiency',
  };

  logger.info(`\nStrategic Directive Issued:`);
  logger.info(`  ID: ${directive.id}`);
  logger.info(`  Directive: ${directive.directive}`);
  logger.info(`  Scope: ${directive.scope}`);
  logger.info(`  Priority: ${directive.priority}`);
  logger.info(`  Targets: ${directive.targetAgents.length} Meta-Agents`);

  logger.info(`\nObjectives:`);
  directive.objectives.forEach((obj, idx) => {
    logger.info(`  ${idx + 1}. ${obj.metric}: ${obj.target}`);
    logger.info(`     Deadline: ${new Date(obj.deadline!).toISOString()}`);
  });

  logger.info(`\nConstraints:`);
  Object.entries(directive.constraints).forEach(([key, value]) => {
    logger.info(`  - ${key}: ${value}`);
  });

  logger.info(`\nRationale: ${directive.rationale}`);

  await coordinator.issueStrategicDirective(directive);
  logger.info('\n✓ Directive issued to all target agents');
}

/**
 * Example 7: Bottleneck Detection and Resolution
 */
async function example7_BottleneckDetection(coordinator: HierarchyCoordinator) {
  logger.info('\nExample 7: Bottleneck Detection');

  // Simulate high load on some agents
  const state = coordinator.getState();
  const specialists = Array.from(state.agents.values()).filter(a => a.level === HierarchyLevel.SPECIALIST);

  if (specialists.length > 0) {
    // Artificially increase load on first specialist
    specialists[0].currentLoad = 0.95;
    logger.info(`\nSimulated high load on ${specialists[0].id}: ${specialists[0].currentLoad.toFixed(2)}`);
  }

  // Detect bottlenecks
  const bottlenecks = coordinator.detectBottlenecks();

  if (bottlenecks.length === 0) {
    logger.info('\nNo bottlenecks detected');
    return;
  }

  logger.info(`\n${bottlenecks.length} Bottleneck(s) Detected:`);
  bottlenecks.forEach((bottleneck, idx) => {
    logger.info(`\n${idx + 1}. Location: ${bottleneck.location}`);
    logger.info(`   Type: ${bottleneck.type}`);
    logger.info(`   Severity: ${bottleneck.severity.toFixed(2)}`);
    logger.info(`   Impact:`);
    logger.info(`     - Affected Tasks: ${bottleneck.impact.affectedTasks.length}`);
    logger.info(`     - Estimated Delay: ${bottleneck.impact.estimatedDelay}ms`);
    logger.info(`     - Cascade Effect: ${bottleneck.impact.cascadeEffect} downstream agents`);

    logger.info(`   Recommendations:`);
    bottleneck.recommendations.forEach((rec, recIdx) => {
      logger.info(`     ${recIdx + 1}. ${rec.action}`);
      logger.info(`        Expected Improvement: ${(rec.expectedImprovement * 100).toFixed(0)}%`);
      logger.info(`        Cost: ${rec.cost}`);
    });
  });
}

/**
 * Example 8: Hierarchy Performance Metrics
 */
async function example8_PerformanceMetrics(coordinator: HierarchyCoordinator) {
  logger.info('\nExample 8: Hierarchy Performance Metrics');

  const metrics = coordinator.getMetrics();

  logger.info('\n' + '='.repeat(60));
  logger.info('Performance by Level:');
  for (const [level, data] of metrics.byLevel) {
    const levelName = HierarchyLevel[level];
    logger.info(`\n${levelName} (Level ${level}):`);
    logger.info(`  Agents: ${data.agentCount}`);
    logger.info(`  Average Load: ${data.averageLoad.toFixed(2)}`);
    logger.info(`  Tasks Completed: ${data.tasksCompleted}`);
    logger.info(`  Average Quality: ${data.averageQuality.toFixed(2)}`);
    logger.info(`  Success Rate: ${(data.successRate * 100).toFixed(1)}%`);
  }

  logger.info('\n' + '-'.repeat(60));
  logger.info('Delegation Metrics:');
  logger.info(`  Total Delegations: ${metrics.delegation.totalDelegations}`);
  logger.info(`  Success Rate: ${(metrics.delegation.delegationSuccessRate * 100).toFixed(1)}%`);
  logger.info(`  Average Time: ${metrics.delegation.averageDelegationTime.toFixed(0)}ms`);
  logger.info(`  Average Depth: ${metrics.delegation.averageHierarchyDepth.toFixed(1)} levels`);

  logger.info('\n' + '-'.repeat(60));
  logger.info('Collaboration Metrics:');
  logger.info(`  Total Collaborations: ${metrics.collaboration.totalCollaborations}`);
  logger.info(`  Successful: ${metrics.collaboration.successfulCollaborations}`);
  logger.info(`  Average Team Size: ${metrics.collaboration.averageTeamSize.toFixed(1)}`);
  logger.info(`  Knowledge Shares: ${metrics.collaboration.knowledgeShares}`);

  logger.info('\n' + '-'.repeat(60));
  logger.info('Learning Metrics:');
  logger.info(`  Total Learning Events: ${metrics.learning.totalLearningEvents}`);
  logger.info(`  Average Improvement: ${(metrics.learning.averageImprovement * 100).toFixed(2)}%`);
  logger.info(`  Knowledge Base Size: ${metrics.learning.knowledgeBaseSize}`);

  logger.info('\n' + '-'.repeat(60));
  logger.info('Efficiency Metrics:');
  logger.info(`  Task Throughput: ${metrics.efficiency.taskThroughput.toFixed(2)} tasks/min`);
  logger.info(`  Resource Utilization: ${(metrics.efficiency.resourceUtilization * 100).toFixed(1)}%`);
  logger.info(`  Bottlenecks: ${metrics.efficiency.bottleneckCount}`);
  logger.info('='.repeat(60));
}

/**
 * Run all examples
 */
export async function runHierarchyExample() {
  logger.info('='.repeat(80));
  logger.info('OpenClaw Meta-Agents - Hierarchy System Examples');
  logger.info('='.repeat(80));

  try {
    const coordinator = await example1_BuildingHierarchy();
    await example2_TaskDelegation(coordinator);
    await example3_CoordinationPlanning(coordinator);
    await example4_Collaboration(coordinator);
    await example5_LearningAndKnowledge(coordinator);
    await example6_StrategicDirective(coordinator);
    await example7_BottleneckDetection(coordinator);
    await example8_PerformanceMetrics(coordinator);

    logger.info('\n' + '='.repeat(80));
    logger.info('All examples completed successfully!');
    logger.info('='.repeat(80));
  } catch (error) {
    logger.error('Error running examples:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  runHierarchyExample()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Fatal error:', error);
      process.exit(1);
    });
}
