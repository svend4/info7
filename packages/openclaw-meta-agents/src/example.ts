/**
 * OpenClaw Meta-Agents - Usage Example
 *
 * Demonstrates hierarchical multi-agent system
 */

import { MetaAgentCoordinator } from './coordinator/meta-agent-coordinator';
import { LegalAgent } from './agents/legal-agent';
import { MedicalAgent } from './agents/medical-agent';
import { FinanceAgent } from './agents/finance-agent';
import { TaskPriority, EventType } from './types';

async function main() {
  console.log('🤖 OpenClaw Meta-Agents - Example\n');

  // Initialize Meta-Agent Coordinator
  const coordinator = new MetaAgentCoordinator({
    maxConcurrentTasks: 10,
    decompositionStrategy: 'automatic',
    selectionStrategy: 'hybrid',
    enableParallelization: true,
    taskTimeout: 300000,
    retryFailedTasks: true,
    maxRetries: 3,
  });

  console.log('✅ Meta-Agent Coordinator initialized');
  console.log(`   ID: ${coordinator.id}`);
  console.log(`   Max concurrent tasks: ${coordinator.workload.maxConcurrentTasks}\n`);

  // Register specialized agents
  const legalAgent = new LegalAgent('Senior Legal Advisor');
  const medicalAgent = new MedicalAgent('Medical Specialist');
  const financeAgent = new FinanceAgent('Financial Analyst');

  coordinator.registerAgent(legalAgent);
  coordinator.registerAgent(medicalAgent);
  coordinator.registerAgent(financeAgent);

  console.log('📋 Registered Specialized Agents:');
  console.log(`   • ${legalAgent.name} (${legalAgent.domain})`);
  console.log(`   • ${medicalAgent.name} (${medicalAgent.domain})`);
  console.log(`   • ${financeAgent.name} (${financeAgent.domain})`);
  console.log();

  // Subscribe to events
  coordinator.on(EventType.TASK_CREATED, (event) => {
    console.log(`📝 Task created: ${event.payload.task.description}`);
  });

  coordinator.on(EventType.TASK_STARTED, (event) => {
    console.log(`▶️  Task started: ${event.payload.task.id}`);
  });

  coordinator.on(EventType.AGENT_ASSIGNED, (event) => {
    console.log(
      `🎯 Agent assigned: ${event.payload.agent.name} → Task ${event.payload.task.id}`
    );
  });

  coordinator.on(EventType.TASK_COMPLETED, (event) => {
    console.log(
      `✅ Task completed: ${event.payload.task.id} (${event.payload.result.metrics?.duration}ms)`
    );
  });

  console.log('🚀 Starting task execution examples\n');
  console.log('━'.repeat(60));
  console.log();

  // Example 1: Legal consultation (will decompose into subtasks)
  console.log('Example 1: Legal Consultation (Complex Task)\n');

  const legalResult = await coordinator.submitTask({
    description:
      'Review employment contract and provide legal opinion on non-compete clause',
    type: 'legal_consultation',
    priority: TaskPriority.HIGH,
    requirements: {
      skills: ['legal_research', 'contract_review'],
    },
  });

  console.log('\n📊 Legal Task Result:');
  console.log(`   Success: ${legalResult.success}`);
  console.log(`   Subtasks completed: ${legalResult.data?.completedSubtasks ?? 0}/${legalResult.data?.totalSubtasks ?? 0}`);
  console.log(`   Total duration: ${legalResult.metrics?.duration}ms`);
  console.log(`   Total cost: $${legalResult.metrics?.cost.toFixed(2)}`);
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // Example 2: Medical research (atomic task)
  console.log('Example 2: Medical Research (Atomic Task)\n');

  const medicalResult = await coordinator.submitTask({
    description: 'Research latest treatment options for Type 2 Diabetes',
    type: 'medical_research',
    priority: TaskPriority.MEDIUM,
  });

  console.log('\n📊 Medical Task Result:');
  console.log(`   Success: ${medicalResult.success}`);
  console.log(`   Evidence level: ${medicalResult.data?.evidenceLevel}`);
  console.log(`   Duration: ${medicalResult.metrics?.duration}ms`);
  console.log(`   API calls: ${medicalResult.metrics?.apiCalls}`);
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // Example 3: Financial analysis (will decompose)
  console.log('Example 3: Financial Analysis (Complex Task)\n');

  const financeResult = await coordinator.submitTask({
    description: 'Analyze household finances and create budget plan for next year',
    type: 'financial_analysis',
    priority: TaskPriority.HIGH,
  });

  console.log('\n📊 Finance Task Result:');
  console.log(`   Success: ${financeResult.success}`);
  console.log(`   Subtasks completed: ${financeResult.data?.completedSubtasks ?? 0}/${financeResult.data?.totalSubtasks ?? 0}`);
  console.log(`   Total duration: ${financeResult.metrics?.duration}ms`);
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // Get system statistics
  const stats = coordinator.getStatistics();

  console.log('📊 System Statistics:\n');

  console.log('Coordinator:');
  console.log(`   Total tasks completed: ${stats.coordinator.totalTasksCompleted}`);
  console.log(`   Success rate: ${(stats.coordinator.successRate * 100).toFixed(1)}%`);
  console.log(`   Average response time: ${stats.coordinator.averageResponseTime.toFixed(0)}ms`);
  console.log(`   Current utilization: ${(stats.coordinator.workload.utilizationRate * 100).toFixed(1)}%`);
  console.log();

  console.log('Tasks:');
  console.log(`   Total: ${stats.tasks.total}`);
  console.log(`   Completed: ${stats.tasks.byStatus.completed}`);
  console.log(`   Failed: ${stats.tasks.byStatus.failed}`);
  console.log(`   Success rate: ${(stats.tasks.successRate * 100).toFixed(1)}%`);
  console.log(`   Avg duration: ${stats.tasks.avgDuration.toFixed(0)}ms`);
  console.log();

  console.log('Agents:');
  console.log(`   Total: ${stats.agents.total}`);
  console.log(`   By domain:`, stats.agents.byDomain);
  console.log(`   Avg utilization: ${(stats.agents.utilization * 100).toFixed(1)}%`);
  console.log();

  console.log('Agent Performance:');
  console.log(`   Legal Agent:`);
  console.log(`      Tasks completed: ${legalAgent.metadata.totalTasksCompleted}`);
  console.log(`      Success rate: ${(legalAgent.metadata.successRate * 100).toFixed(1)}%`);
  console.log(`      Avg response: ${legalAgent.metadata.averageResponseTime.toFixed(0)}ms`);
  console.log();

  console.log(`   Medical Agent:`);
  console.log(`      Tasks completed: ${medicalAgent.metadata.totalTasksCompleted}`);
  console.log(`      Success rate: ${(medicalAgent.metadata.successRate * 100).toFixed(1)}%`);
  console.log(`      Avg response: ${medicalAgent.metadata.averageResponseTime.toFixed(0)}ms`);
  console.log();

  console.log(`   Finance Agent:`);
  console.log(`      Tasks completed: ${financeAgent.metadata.totalTasksCompleted}`);
  console.log(`      Success rate: ${(financeAgent.metadata.successRate * 100).toFixed(1)}%`);
  console.log(`      Avg response: ${financeAgent.metadata.averageResponseTime.toFixed(0)}ms`);
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // Shutdown
  coordinator.shutdown();
  console.log('✅ Meta-Agent Coordinator shutdown complete');
}

// Run example
if (require.main === module) {
  main().catch(console.error);
}

export { main as runMetaAgentsExample };
