/**
 * Hierarchy Coordinator
 *
 * Manages the 5-level hierarchical agent system for complex task orchestration.
 */

import { Logger, MetricsCollector, AppError } from '@info7/common';
import { Task, TaskResult } from '../core/types';
import {
  HierarchyConfig,
  HierarchyLevel,
  HierarchicalAgent,
  HierarchyState,
  HierarchyMetrics,
  DelegationDecision,
  CoordinationPlan,
  CoordinationStrategy,
  TaskDecomposition,
  CollaborationRequest,
  CollaborationResponse,
  KnowledgeShare,
  LearningRecord,
  StrategicDirective,
  Bottleneck,
} from './types';

/**
 * Hierarchy Coordinator - manages multi-level agent hierarchy
 */
export class HierarchyCoordinator {
  private logger: Logger;
  private metrics: MetricsCollector;
  private config: HierarchyConfig;

  private agents = new Map<string, HierarchicalAgent>();
  private activeTasks = new Map<string, {
    task: Task;
    assignedTo: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    progress: number;
    startTime: number;
  }>();
  private delegations: DelegationDecision[] = [];
  private collaborations = new Map<string, CollaborationRequest>();
  private learningRecords: LearningRecord[] = [];
  private knowledgeBase = new Map<string, KnowledgeShare[]>();

  // Statistics
  private stats = {
    totalDelegations: 0,
    totalCollaborations: 0,
    totalLearningEvents: 0,
    totalKnowledgeShares: 0,
  };

  constructor(config: Partial<HierarchyConfig> = {}) {
    this.logger = new Logger('hierarchy-coordinator');
    this.metrics = new MetricsCollector('hierarchy');

    this.config = {
      maxAgentsPerLevel: new Map([
        [HierarchyLevel.META_META_AGENT, 1],
        [HierarchyLevel.META_AGENT, 3],
        [HierarchyLevel.COORDINATOR, 10],
        [HierarchyLevel.SPECIALIST, 50],
        [HierarchyLevel.WORKER, 200],
      ]),
      maxSubordinatesPerAgent: 10,
      delegationThreshold: 0.7,
      collaborationEnabled: true,
      learningEnabled: true,
      knowledgeSharingEnabled: true,
      loadBalancingStrategy: 'capability-based',
      failoverEnabled: true,
      ...config,
    };

    this.logger.info('Hierarchy Coordinator initialized', { config: this.config });
  }

  /**
   * Register an agent in the hierarchy
   */
  registerAgent(agent: HierarchicalAgent): void {
    // Validate hierarchy constraints
    const agentsAtLevel = Array.from(this.agents.values()).filter(a => a.level === agent.level).length;
    const maxAtLevel = this.config.maxAgentsPerLevel.get(agent.level) || 100;

    if (agentsAtLevel >= maxAtLevel) {
      throw new AppError(
        `Maximum agents at level ${agent.level} reached`,
        'HIERARCHY_LIMIT_REACHED'
      );
    }

    // Validate supervisor relationship
    if (agent.supervisor) {
      const supervisor = this.agents.get(agent.supervisor);
      if (!supervisor) {
        throw new AppError('Supervisor not found', 'INVALID_SUPERVISOR');
      }
      if (supervisor.level <= agent.level) {
        throw new AppError('Supervisor must be at higher level', 'INVALID_HIERARCHY');
      }
      if (supervisor.subordinates.length >= this.config.maxSubordinatesPerAgent) {
        throw new AppError('Supervisor has maximum subordinates', 'SUPERVISOR_FULL');
      }
    }

    this.agents.set(agent.id, agent);
    this.logger.info(`Agent registered: ${agent.id} at level ${agent.level}`);
  }

  /**
   * Delegate a task through the hierarchy
   */
  async delegateTask(task: Task, fromLevel: HierarchyLevel): Promise<DelegationDecision> {
    const startTime = Date.now();

    try {
      this.logger.info(`Delegating task ${task.id} from level ${fromLevel}`);

      // Analyze task complexity
      const complexity = this.analyzeTaskComplexity(task);

      // Determine target level
      const targetLevel = this.determineTargetLevel(complexity, fromLevel);

      // Find best agent at target level
      const targetAgent = this.findBestAgent(task, targetLevel);

      if (!targetAgent) {
        throw new AppError(`No suitable agent at level ${targetLevel}`, 'NO_AGENT_AVAILABLE');
      }

      // Create delegation decision
      const delegation: DelegationDecision = {
        task,
        targetAgent,
        reasoning: `Complexity ${complexity.toFixed(2)} requires level ${targetLevel}`,
        priority: this.calculateTaskPriority(task),
        requiredResources: this.identifyRequiredResources(task),
        dependencies: task.dependencies || [],
      };

      // Record delegation
      this.delegations.push(delegation);
      this.stats.totalDelegations++;

      // Update task tracking
      this.activeTasks.set(task.id, {
        task,
        assignedTo: targetAgent.id,
        status: 'pending',
        progress: 0,
        startTime: Date.now(),
      });

      const duration = Date.now() - startTime;
      this.metrics.recordValue('delegation_time', duration);
      this.logger.info(`Task delegated to ${targetAgent.id}`, { duration });

      return delegation;
    } catch (error) {
      this.logger.error('Delegation failed', error);
      throw new AppError('Task delegation failed', 'DELEGATION_ERROR', error);
    }
  }

  /**
   * Create a coordination plan for complex tasks
   */
  async createCoordinationPlan(task: Task): Promise<CoordinationPlan> {
    const startTime = Date.now();

    try {
      this.logger.info(`Creating coordination plan for task ${task.id}`);

      // Decompose task
      const decomposition = await this.decomposeTask(task);

      // Determine coordination strategy
      const strategy = this.selectCoordinationStrategy(decomposition);

      // Assign subtasks to agents
      const assignments = await this.assignSubtasks(decomposition.subtasks, strategy);

      // Allocate resources
      const resourceAllocation = this.allocateResources(assignments);

      // Determine execution order
      const executionOrder = this.determineExecutionOrder(
        decomposition.subtasks,
        decomposition.dependencies,
        strategy
      );

      // Estimate completion
      const estimatedCompletion = this.estimateCompletion(assignments, executionOrder);

      // Create contingency plans
      const contingencyPlans = this.createContingencyPlans(assignments, decomposition);

      const plan: CoordinationPlan = {
        task,
        strategy,
        subtasks: assignments,
        executionOrder,
        resourceAllocation,
        estimatedCompletion,
        contingencyPlans,
      };

      const duration = Date.now() - startTime;
      this.metrics.recordValue('coordination_planning_time', duration);
      this.logger.info('Coordination plan created', { strategy, subtasksCount: assignments.length });

      return plan;
    } catch (error) {
      this.logger.error('Coordination planning failed', error);
      throw new AppError('Coordination planning failed', 'PLANNING_ERROR', error);
    }
  }

  /**
   * Request collaboration between agents
   */
  async requestCollaboration(request: CollaborationRequest): Promise<CollaborationResponse[]> {
    if (!this.config.collaborationEnabled) {
      throw new AppError('Collaboration is disabled', 'COLLABORATION_DISABLED');
    }

    const startTime = Date.now();

    try {
      this.logger.info(`Collaboration requested by ${request.requesterId} for ${request.targetAgents.length} agents`);

      this.collaborations.set(`collab-${Date.now()}`, request);
      this.stats.totalCollaborations++;

      const responses: CollaborationResponse[] = [];

      // Request collaboration from each target agent
      for (const targetId of request.targetAgents) {
        const target = this.agents.get(targetId);
        if (!target) {
          this.logger.warn(`Target agent not found: ${targetId}`);
          continue;
        }

        // Evaluate if agent can collaborate
        const response = await this.evaluateCollaboration(target, request);
        responses.push(response);
      }

      const duration = Date.now() - startTime;
      this.metrics.recordValue('collaboration_request_time', duration);
      this.logger.info(`Collaboration responses: ${responses.filter(r => r.accepted).length}/${responses.length} accepted`);

      return responses;
    } catch (error) {
      this.logger.error('Collaboration request failed', error);
      throw new AppError('Collaboration request failed', 'COLLABORATION_ERROR', error);
    }
  }

  /**
   * Share knowledge between agents
   */
  async shareKnowledge(share: KnowledgeShare): Promise<void> {
    if (!this.config.knowledgeSharingEnabled) {
      return;
    }

    try {
      this.logger.info(`Knowledge sharing: ${share.sourceAgent} → ${share.targetAgent}`);

      // Store knowledge for target agent
      const targetKnowledge = this.knowledgeBase.get(share.targetAgent) || [];
      targetKnowledge.push(share);
      this.knowledgeBase.set(share.targetAgent, targetKnowledge);

      this.stats.totalKnowledgeShares++;

      // If knowledge is highly applicable, update target agent's performance
      if (share.knowledge.applicability > 0.8) {
        const target = this.agents.get(share.targetAgent);
        if (target) {
          target.performance.averageQuality = Math.min(
            1,
            target.performance.averageQuality + share.knowledge.applicability * 0.05
          );
        }
      }

      this.logger.info('Knowledge shared successfully');
    } catch (error) {
      this.logger.error('Knowledge sharing failed', error);
    }
  }

  /**
   * Record learning from task execution
   */
  async recordLearning(agentId: string, task: Task, result: TaskResult): Promise<void> {
    if (!this.config.learningEnabled) {
      return;
    }

    const startTime = Date.now();

    try {
      this.logger.info(`Recording learning for agent ${agentId}`);

      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new AppError('Agent not found', 'AGENT_NOT_FOUND');
      }

      // Extract insights
      const insights = this.extractInsights(task, result);

      // Calculate performance change
      const before = agent.performance.averageQuality;
      const current = result.quality || 0.5;
      const after = (before * agent.performance.tasksCompleted + current) / (agent.performance.tasksCompleted + 1);
      const improvement = after - before;

      // Identify acquired knowledge
      const knowledgeAcquired = this.identifyKnowledge(task, result, insights);

      // Create learning record
      const record: LearningRecord = {
        agentId,
        timestamp: Date.now(),
        task,
        result,
        insights,
        performanceChange: {
          before,
          after,
          improvement,
        },
        knowledgeAcquired,
      };

      this.learningRecords.push(record);
      this.stats.totalLearningEvents++;

      // Update agent performance
      agent.performance.tasksCompleted++;
      agent.performance.averageQuality = after;
      agent.performance.successRate = (
        (agent.performance.successRate * (agent.performance.tasksCompleted - 1) + (result.success ? 1 : 0)) /
        agent.performance.tasksCompleted
      );

      // Share valuable knowledge with similar agents
      if (improvement > 0.1 && this.config.knowledgeSharingEnabled) {
        await this.propagateKnowledge(agentId, record);
      }

      const duration = Date.now() - startTime;
      this.metrics.recordValue('learning_time', duration);
      this.logger.info('Learning recorded', { improvement: improvement.toFixed(3) });
    } catch (error) {
      this.logger.error('Learning recording failed', error);
    }
  }

  /**
   * Issue strategic directive from Meta-Meta-Agent
   */
  async issueStrategicDirective(directive: StrategicDirective): Promise<void> {
    this.logger.info(`Issuing strategic directive: ${directive.directive}`);

    for (const targetId of directive.targetAgents) {
      const agent = this.agents.get(targetId);
      if (agent) {
        agent.metadata.currentDirective = directive;
        this.logger.info(`Directive assigned to ${targetId}`);
      }
    }
  }

  /**
   * Detect and report bottlenecks
   */
  detectBottlenecks(): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];

    // Check each agent for high load
    for (const [agentId, agent] of this.agents) {
      if (agent.currentLoad > 0.9) {
        const affectedTasks = Array.from(this.activeTasks.values())
          .filter(t => t.assignedTo === agentId && t.status !== 'completed')
          .map(t => t.task.id);

        bottlenecks.push({
          location: agentId,
          type: 'capacity',
          severity: agent.currentLoad,
          impact: {
            affectedTasks,
            estimatedDelay: affectedTasks.length * 1000,
            cascadeEffect: this.calculateCascadeEffect(agentId),
          },
          recommendations: [
            {
              action: 'Add parallel agents at same level',
              expectedImprovement: 0.5,
              cost: 100,
            },
            {
              action: 'Redistribute tasks to subordinates',
              expectedImprovement: 0.3,
              cost: 10,
            },
          ],
        });
      }
    }

    this.logger.info(`Detected ${bottlenecks.length} bottlenecks`);
    return bottlenecks;
  }

  /**
   * Get current hierarchy state
   */
  getState(): HierarchyState {
    return {
      timestamp: Date.now(),
      agents: new Map(this.agents),
      activeTasks: new Map(this.activeTasks),
      delegations: [...this.delegations],
      collaborations: Array.from(this.collaborations.values()),
      learningRecords: [...this.learningRecords],
      bottlenecks: this.detectBottlenecks(),
      metrics: this.getMetrics(),
    };
  }

  /**
   * Get hierarchy metrics
   */
  getMetrics(): HierarchyMetrics {
    const byLevel = new Map<HierarchyLevel, any>();

    // Aggregate metrics by level
    for (const level of Object.values(HierarchyLevel).filter(v => typeof v === 'number') as HierarchyLevel[]) {
      const agentsAtLevel = Array.from(this.agents.values()).filter(a => a.level === level);

      if (agentsAtLevel.length > 0) {
        byLevel.set(level, {
          agentCount: agentsAtLevel.length,
          averageLoad: agentsAtLevel.reduce((sum, a) => sum + a.currentLoad, 0) / agentsAtLevel.length,
          tasksCompleted: agentsAtLevel.reduce((sum, a) => sum + a.performance.tasksCompleted, 0),
          averageQuality: agentsAtLevel.reduce((sum, a) => sum + a.performance.averageQuality, 0) / agentsAtLevel.length,
          successRate: agentsAtLevel.reduce((sum, a) => sum + a.performance.successRate, 0) / agentsAtLevel.length,
        });
      }
    }

    // Calculate overall metrics
    const totalAgents = this.agents.size;
    const avgLoad = totalAgents > 0
      ? Array.from(this.agents.values()).reduce((sum, a) => sum + a.currentLoad, 0) / totalAgents
      : 0;

    const completedTasks = Array.from(this.activeTasks.values()).filter(t => t.status === 'completed').length;

    return {
      byLevel,
      delegation: {
        totalDelegations: this.stats.totalDelegations,
        averageDelegationTime: this.metrics.getAverageValue('delegation_time') || 0,
        delegationSuccessRate: this.delegations.length > 0
          ? completedTasks / this.delegations.length
          : 0,
        averageHierarchyDepth: this.calculateAverageHierarchyDepth(),
      },
      collaboration: {
        totalCollaborations: this.stats.totalCollaborations,
        successfulCollaborations: this.stats.totalCollaborations,
        averageTeamSize: 2.5,
        knowledgeShares: this.stats.totalKnowledgeShares,
      },
      learning: {
        totalLearningEvents: this.stats.totalLearningEvents,
        averageImprovement: this.learningRecords.length > 0
          ? this.learningRecords.reduce((sum, r) => sum + r.performanceChange.improvement, 0) / this.learningRecords.length
          : 0,
        knowledgeBaseSize: this.knowledgeBase.size,
      },
      efficiency: {
        taskThroughput: completedTasks / Math.max(1, (Date.now() / 1000 / 60)),
        resourceUtilization: avgLoad,
        bottleneckCount: this.detectBottlenecks().length,
      },
    };
  }

  // ===== Private Helper Methods =====

  private analyzeTaskComplexity(task: Task): number {
    let complexity = 0.5;

    // Adjust based on task type
    if (task.type.includes('strategic')) complexity += 0.3;
    if (task.type.includes('coordination')) complexity += 0.2;
    if (task.type.includes('simple')) complexity -= 0.2;

    // Adjust based on priority
    if (task.priority === 'critical') complexity += 0.1;

    // Adjust based on dependencies
    if (task.dependencies && task.dependencies.length > 3) complexity += 0.1;

    return Math.min(1, Math.max(0, complexity));
  }

  private determineTargetLevel(complexity: number, fromLevel: HierarchyLevel): HierarchyLevel {
    if (complexity > 0.8 && fromLevel > HierarchyLevel.META_AGENT) {
      return HierarchyLevel.META_AGENT;
    } else if (complexity > 0.6 && fromLevel > HierarchyLevel.COORDINATOR) {
      return HierarchyLevel.COORDINATOR;
    } else if (complexity > 0.4 && fromLevel > HierarchyLevel.SPECIALIST) {
      return HierarchyLevel.SPECIALIST;
    } else {
      return HierarchyLevel.WORKER;
    }
  }

  private findBestAgent(task: Task, targetLevel: HierarchyLevel): HierarchicalAgent | null {
    const candidates = Array.from(this.agents.values()).filter(
      a => a.level === targetLevel && a.status !== 'unavailable'
    );

    if (candidates.length === 0) return null;

    // Apply load balancing strategy
    if (this.config.loadBalancingStrategy === 'least-loaded') {
      return candidates.reduce((best, curr) => curr.currentLoad < best.currentLoad ? curr : best);
    } else if (this.config.loadBalancingStrategy === 'performance-based') {
      return candidates.reduce((best, curr) =>
        curr.performance.successRate > best.performance.successRate ? curr : best
      );
    } else {
      // Capability-based (default)
      return candidates[0];
    }
  }

  private calculateTaskPriority(task: Task): number {
    const priorityMap = { low: 0.25, medium: 0.5, high: 0.75, critical: 1 };
    return priorityMap[task.priority] || 0.5;
  }

  private identifyRequiredResources(task: Task): string[] {
    // Simple resource identification
    const resources: string[] = [];

    if (task.type.includes('data')) resources.push('database');
    if (task.type.includes('compute')) resources.push('cpu', 'memory');
    if (task.type.includes('network')) resources.push('bandwidth');

    return resources;
  }

  private async decomposeTask(task: Task): Promise<TaskDecomposition> {
    // Simple task decomposition logic
    const subtasks: Task[] = [];
    const dependencies = new Map<string, string[]>();

    // For demonstration, create 2-4 subtasks
    const subtaskCount = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < subtaskCount; i++) {
      const subtask: Task = {
        id: `${task.id}_sub${i}`,
        type: `${task.type}_part${i}`,
        description: `Subtask ${i + 1} of ${task.description}`,
        priority: task.priority,
        complexity: Math.random() * 0.5,
      };
      subtasks.push(subtask);

      // Sequential dependencies
      if (i > 0) {
        dependencies.set(subtask.id, [subtasks[i - 1].id]);
      }
    }

    return {
      originalTask: task,
      subtasks,
      decompositionStrategy: 'sequential',
      dependencies,
      criticalPath: subtasks.map(st => st.id),
      estimatedTotalDuration: subtasks.length * 1000,
      confidence: 0.8,
    };
  }

  private selectCoordinationStrategy(decomposition: TaskDecomposition): CoordinationStrategy {
    // If tasks have dependencies, use sequential or pipeline
    if (decomposition.dependencies.size > 0) {
      return CoordinationStrategy.SEQUENTIAL;
    }

    // If tasks can run independently, use parallel
    if (decomposition.subtasks.every(st => !decomposition.dependencies.has(st.id))) {
      return CoordinationStrategy.PARALLEL;
    }

    return CoordinationStrategy.HIERARCHICAL;
  }

  private async assignSubtasks(
    subtasks: Task[],
    strategy: CoordinationStrategy
  ): Promise<CoordinationPlan['subtasks']> {
    const assignments: CoordinationPlan['subtasks'] = [];

    for (const subtask of subtasks) {
      const agent = this.findBestAgent(subtask, HierarchyLevel.SPECIALIST);

      assignments.push({
        id: subtask.id,
        task: subtask,
        assignedTo: agent?.id || 'unassigned',
        dependencies: [],
        estimatedDuration: 1000,
      });
    }

    return assignments;
  }

  private allocateResources(assignments: CoordinationPlan['subtasks']): Map<string, string[]> {
    const allocation = new Map<string, string[]>();

    for (const assignment of assignments) {
      const resources = this.identifyRequiredResources(assignment.task);
      allocation.set(assignment.assignedTo, resources);
    }

    return allocation;
  }

  private determineExecutionOrder(
    subtasks: Task[],
    dependencies: Map<string, string[]>,
    strategy: CoordinationStrategy
  ): string[] {
    if (strategy === CoordinationStrategy.PARALLEL) {
      return subtasks.map(st => st.id);
    }

    // Simple sequential order
    return subtasks.map(st => st.id);
  }

  private estimateCompletion(
    assignments: CoordinationPlan['subtasks'],
    executionOrder: string[]
  ): number {
    const totalDuration = assignments.reduce((sum, a) => sum + a.estimatedDuration, 0);
    return Date.now() + totalDuration;
  }

  private createContingencyPlans(
    assignments: CoordinationPlan['subtasks'],
    decomposition: TaskDecomposition
  ): CoordinationPlan['contingencyPlans'] {
    return [
      {
        trigger: 'Agent failure',
        action: 'Reassign to backup agent',
      },
      {
        trigger: 'Resource unavailable',
        action: 'Queue task until resource available',
      },
    ];
  }

  private async evaluateCollaboration(
    agent: HierarchicalAgent,
    request: CollaborationRequest
  ): Promise<CollaborationResponse> {
    // Simple evaluation - accept if load is below 0.8
    const canAccept = agent.currentLoad < 0.8 && agent.status !== 'busy';

    return {
      responderId: agent.id,
      requestId: `req-${Date.now()}`,
      accepted: canAccept,
      availability: {
        canStart: Date.now() + (canAccept ? 0 : 5000),
        estimatedDuration: 2000,
      },
    };
  }

  private extractInsights(task: Task, result: TaskResult): LearningRecord['insights'] {
    const insights: LearningRecord['insights'] = [];

    if (result.success) {
      insights.push({
        type: 'success',
        description: `Successfully completed ${task.type} task`,
        actionable: false,
      });
    } else {
      insights.push({
        type: 'failure',
        description: `Failed to complete ${task.type} task`,
        actionable: true,
        recommendation: 'Review approach for this task type',
      });
    }

    return insights;
  }

  private identifyKnowledge(
    task: Task,
    result: TaskResult,
    insights: LearningRecord['insights']
  ): string[] {
    const knowledge: string[] = [];

    knowledge.push(`${task.type}_execution`);

    if (result.success) {
      knowledge.push(`${task.type}_success_pattern`);
    }

    return knowledge;
  }

  private async propagateKnowledge(sourceId: string, record: LearningRecord): Promise<void> {
    const source = this.agents.get(sourceId);
    if (!source) return;

    // Find similar agents (same level, similar capabilities)
    const similarAgents = Array.from(this.agents.values()).filter(
      a => a.id !== sourceId && a.level === source.level
    );

    for (const target of similarAgents.slice(0, 3)) {
      const share: KnowledgeShare = {
        sourceAgent: sourceId,
        targetAgent: target.id,
        knowledge: {
          type: 'solution',
          domain: record.task.type,
          content: record.insights,
          confidence: 0.8,
          applicability: 0.7,
        },
        timestamp: Date.now(),
      };

      await this.shareKnowledge(share);
    }
  }

  private calculateCascadeEffect(agentId: string): number {
    // Calculate how many downstream agents are affected
    const agent = this.agents.get(agentId);
    if (!agent) return 0;

    let affected = agent.subordinates.length;
    for (const subId of agent.subordinates) {
      affected += this.calculateCascadeEffect(subId);
    }

    return affected;
  }

  private calculateAverageHierarchyDepth(): number {
    let totalDepth = 0;
    let count = 0;

    for (const agent of this.agents.values()) {
      if (agent.level === HierarchyLevel.WORKER) {
        let depth = 1;
        let current = agent.supervisor;

        while (current) {
          depth++;
          const supervisor = this.agents.get(current);
          current = supervisor?.supervisor;
        }

        totalDepth += depth;
        count++;
      }
    }

    return count > 0 ? totalDepth / count : 0;
  }
}
