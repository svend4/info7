/**
 * OpenClaw Meta-Agents - Meta-Agent Coordinator
 *
 * Top-level coordinator that orchestrates specialized agents
 */

import { v4 as uuidv4 } from 'uuid';
import {
  MetaAgent,
  SpecializedAgent,
  Task,
  TaskResult,
  TaskStatus,
  TaskPriority,
  AgentLevel,
  MetaAgentConfig,
  DecompositionResult,
  EventType,
  SystemEvent,
} from '../types';
import { TaskManager } from '../core/task-manager';
import { TaskDecomposer } from './task-decomposer';
import { AgentSelector } from './agent-selector';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: MetaAgentConfig = {
  maxConcurrentTasks: 10,
  decompositionStrategy: 'automatic',
  selectionStrategy: 'hybrid',
  enableParallelization: true,
  enableLearning: false,
  taskTimeout: 300000, // 5 minutes
  retryFailedTasks: true,
  maxRetries: 3,
};

/**
 * Meta-Agent Coordinator
 */
export class MetaAgentCoordinator implements MetaAgent {
  id: string;
  name: string;
  level: AgentLevel.META = AgentLevel.META;
  type: string = 'meta-coordinator';
  capabilities = [];
  status: 'idle' | 'busy' | 'offline' = 'idle';
  workload = {
    activeTasks: 0,
    maxConcurrentTasks: 10,
    utilizationRate: 0,
  };
  metadata = {
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    totalTasksCompleted: 0,
    successRate: 1.0,
    averageResponseTime: 0,
  };

  specializedAgents: SpecializedAgent[] = [];
  strategy: MetaAgent['strategy'];

  private taskManager: TaskManager;
  private taskDecomposer: TaskDecomposer;
  private agentSelector: AgentSelector;
  private config: MetaAgentConfig;
  private eventListeners: Map<EventType, Array<(event: SystemEvent) => void>> = new Map();

  constructor(config: Partial<MetaAgentConfig> = {}) {
    this.id = uuidv4();
    this.name = 'Meta-Agent Coordinator';
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.workload.maxConcurrentTasks = this.config.maxConcurrentTasks;

    this.strategy = {
      taskDecomposition: this.config.decompositionStrategy,
      agentSelection: this.config.selectionStrategy,
      parallelization: this.config.enableParallelization,
    };

    this.taskManager = new TaskManager();
    this.taskDecomposer = new TaskDecomposer(this.taskManager);
    this.agentSelector = new AgentSelector(this.config.selectionStrategy);
  }

  /**
   * Register specialized agent
   */
  registerAgent(agent: SpecializedAgent): void {
    this.specializedAgents.push(agent);
    console.log(`Registered agent: ${agent.name} (${agent.domain})`);
  }

  /**
   * Execute task with full coordination
   */
  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      // Update task status
      this.taskManager.updateStatus(task.id, TaskStatus.IN_PROGRESS);
      this.workload.activeTasks++;
      this.updateStatus();

      // Emit task started event
      this.emitEvent({
        type: EventType.TASK_STARTED,
        payload: { task },
        timestamp: Date.now(),
        sourceAgentId: this.id,
      });

      // Decompose task if needed
      const decomposition = this.decomposeTask(task);

      let result: TaskResult;

      if (decomposition.subtasks.length === 0) {
        // Atomic task - execute directly
        result = await this.executeAtomicTask(task);
      } else {
        // Complex task - execute subtasks
        result = await this.executeComplexTask(task, decomposition);
      }

      // Update task with result
      this.taskManager.setResult(task.id, result);

      // Update metadata
      const duration = Date.now() - startTime;
      this.metadata.totalTasksCompleted++;
      this.metadata.averageResponseTime =
        (this.metadata.averageResponseTime * (this.metadata.totalTasksCompleted - 1) + duration) /
        this.metadata.totalTasksCompleted;

      if (result.success) {
        this.metadata.successRate =
          (this.metadata.successRate * (this.metadata.totalTasksCompleted - 1) + 1) /
          this.metadata.totalTasksCompleted;
      } else {
        this.metadata.successRate =
          (this.metadata.successRate * (this.metadata.totalTasksCompleted - 1)) /
          this.metadata.totalTasksCompleted;
      }

      // Emit task completed event
      this.emitEvent({
        type: result.success ? EventType.TASK_COMPLETED : EventType.TASK_FAILED,
        payload: { task, result },
        timestamp: Date.now(),
        sourceAgentId: this.id,
      });

      return result;
    } catch (error) {
      const errorResult: TaskResult = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
        metrics: {
          duration: Date.now() - startTime,
          resourcesUsed: {},
          apiCalls: 0,
          cost: 0,
        },
      };

      this.taskManager.setResult(task.id, errorResult);

      return errorResult;
    } finally {
      this.workload.activeTasks--;
      this.updateStatus();
    }
  }

  /**
   * Decompose task into subtasks
   */
  private decomposeTask(task: Task): DecompositionResult {
    if (this.strategy.taskDecomposition === 'automatic') {
      return this.taskDecomposer.autoDecompose(task);
    } else {
      return this.taskDecomposer.decompose(task);
    }
  }

  /**
   * Execute atomic task (no subtasks)
   */
  private async executeAtomicTask(task: Task): Promise<TaskResult> {
    // Select agent for task
    const agent = this.agentSelector.selectAgent(task, this.specializedAgents);

    if (!agent) {
      return {
        success: false,
        error: {
          message: `No available agent found for task type: ${task.type}`,
        },
        metrics: {
          duration: 0,
          resourcesUsed: {},
          apiCalls: 0,
          cost: 0,
        },
      };
    }

    // Emit agent assigned event
    this.emitEvent({
      type: EventType.AGENT_ASSIGNED,
      payload: { task, agent },
      timestamp: Date.now(),
      sourceAgentId: this.id,
    });

    // Execute task with agent
    try {
      const result = await agent.executeTask(task);
      return result;
    } catch (error) {
      // Retry logic
      if (this.config.retryFailedTasks) {
        return await this.retryTask(task, agent, error);
      }

      throw error;
    }
  }

  /**
   * Execute complex task with subtasks
   */
  private async executeComplexTask(
    task: Task,
    decomposition: DecompositionResult
  ): Promise<TaskResult> {
    const subtaskResults: TaskResult[] = [];

    if (decomposition.plan.mode === 'parallel' && this.strategy.parallelization) {
      // Execute subtasks in parallel
      const promises = decomposition.subtasks.map((subtask) =>
        this.executeTask(subtask)
      );

      subtaskResults.push(...(await Promise.all(promises)));
    } else {
      // Execute subtasks sequentially
      for (const subtask of decomposition.subtasks) {
        const result = await this.executeTask(subtask);
        subtaskResults.push(result);

        // Stop if subtask failed (fail-fast)
        if (!result.success) {
          break;
        }
      }
    }

    // Aggregate results
    const allSuccessful = subtaskResults.every((r) => r.success);
    const totalDuration = subtaskResults.reduce(
      (sum, r) => sum + (r.metrics?.duration ?? 0),
      0
    );
    const totalCost = subtaskResults.reduce(
      (sum, r) => sum + (r.metrics?.cost ?? 0),
      0
    );

    return {
      success: allSuccessful,
      data: {
        subtaskResults,
        completedSubtasks: subtaskResults.filter((r) => r.success).length,
        totalSubtasks: decomposition.subtasks.length,
      },
      metrics: {
        duration: totalDuration,
        resourcesUsed: {},
        apiCalls: subtaskResults.reduce(
          (sum, r) => sum + (r.metrics?.apiCalls ?? 0),
          0
        ),
        cost: totalCost,
      },
    };
  }

  /**
   * Retry failed task
   */
  private async retryTask(
    task: Task,
    agent: SpecializedAgent,
    previousError: any,
    retryCount: number = 0
  ): Promise<TaskResult> {
    if (retryCount >= this.config.maxRetries) {
      return {
        success: false,
        error: {
          message: `Task failed after ${this.config.maxRetries} retries`,
          details: previousError,
        },
        metrics: {
          duration: 0,
          resourcesUsed: {},
          apiCalls: 0,
          cost: 0,
        },
      };
    }

    console.log(`Retrying task ${task.id}, attempt ${retryCount + 1}/${this.config.maxRetries}`);

    // Wait before retry (exponential backoff)
    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));

    try {
      return await agent.executeTask(task);
    } catch (error) {
      return await this.retryTask(task, agent, error, retryCount + 1);
    }
  }

  /**
   * Submit new task
   */
  async submitTask(params: {
    description: string;
    type: string;
    priority?: TaskPriority;
    requirements?: Task['requirements'];
  }): Promise<TaskResult> {
    const task = this.taskManager.createTask(params);

    this.emitEvent({
      type: EventType.TASK_CREATED,
      payload: { task },
      timestamp: Date.now(),
      sourceAgentId: this.id,
    });

    return await this.executeTask(task);
  }

  /**
   * Update coordinator status
   */
  private updateStatus(): void {
    this.workload.utilizationRate =
      this.workload.activeTasks / this.workload.maxConcurrentTasks;
    this.status = this.workload.activeTasks > 0 ? 'busy' : 'idle';
    this.metadata.lastActiveAt = Date.now();
  }

  /**
   * Get coordinator statistics
   */
  getStatistics() {
    return {
      coordinator: {
        ...this.metadata,
        workload: this.workload,
      },
      tasks: this.taskManager.getStatistics(),
      agents: {
        total: this.specializedAgents.length,
        byDomain: this.getAgentsByDomain(),
        utilization: this.getAverageAgentUtilization(),
      },
    };
  }

  /**
   * Get agents grouped by domain
   */
  private getAgentsByDomain(): Record<string, number> {
    const byDomain: Record<string, number> = {};

    for (const agent of this.specializedAgents) {
      byDomain[agent.domain] = (byDomain[agent.domain] ?? 0) + 1;
    }

    return byDomain;
  }

  /**
   * Get average agent utilization
   */
  private getAverageAgentUtilization(): number {
    if (this.specializedAgents.length === 0) return 0;

    const totalUtilization = this.specializedAgents.reduce(
      (sum, agent) => sum + agent.workload.utilizationRate,
      0
    );

    return totalUtilization / this.specializedAgents.length;
  }

  /**
   * Subscribe to system events
   */
  on(eventType: EventType, callback: (event: SystemEvent) => void): () => void {
    const listeners = this.eventListeners.get(eventType) ?? [];
    listeners.push(callback);
    this.eventListeners.set(eventType, listeners);

    // Return unsubscribe function
    return () => {
      const currentListeners = this.eventListeners.get(eventType) ?? [];
      const index = currentListeners.indexOf(callback);
      if (index !== -1) {
        currentListeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit system event
   */
  private emitEvent(event: SystemEvent): void {
    const listeners = this.eventListeners.get(event.type) ?? [];
    listeners.forEach((listener) => listener(event));
  }

  /**
   * Shutdown coordinator
   */
  shutdown(): void {
    this.status = 'offline';
    this.taskManager.clear();
  }
}
