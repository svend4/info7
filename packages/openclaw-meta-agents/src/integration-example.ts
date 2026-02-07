/**
 * OpenClaw Meta-Agents - Common Utilities Integration Example
 *
 * Demonstrates integration of @info7/common utilities:
 * - Logger: Structured logging for task execution and agent coordination
 * - MetricsCollector: Performance tracking for task decomposition and routing
 * - AppError: Standardized error handling across agents
 * - HealthCheckManager: Agent health monitoring
 */

import {
  Logger,
  MetricsCollector,
  AppError,
  NotFoundError,
  ValidationError,
  ConfigManager,
  HealthCheckManager,
  HealthStatus,
} from '@info7/common';

import { MetaAgentCoordinator } from './coordinator/meta-agent-coordinator';
import { TaskManager } from './tasks/task-manager';
import { AgentRouter } from './routing/agent-router';
import { Task, TaskResult, TaskType, TaskPriority, TaskStatus } from './tasks/types';

/**
 * OpenClaw Service with Common Utilities Integration
 */
export class OpenClawService {
  private logger: Logger;
  private metrics: MetricsCollector;
  private config: ConfigManager;
  private health: HealthCheckManager;
  private coordinator: MetaAgentCoordinator;
  private taskManager: TaskManager;
  private router: AgentRouter;

  constructor() {
    // Initialize common utilities
    this.logger = new Logger({
      level: 'info',
      context: { service: 'openclaw-meta-agents' },
    });

    this.metrics = new MetricsCollector();
    this.config = new ConfigManager();
    this.health = new HealthCheckManager({ version: '1.0.0' });

    this.logger.info('OpenClaw Meta-Agents Service initializing');

    // Initialize core components
    this.taskManager = new TaskManager();
    this.router = new AgentRouter();
    this.coordinator = new MetaAgentCoordinator(this.taskManager, this.router);

    // Register health checks
    this.registerHealthChecks();

    this.logger.info('OpenClaw Meta-Agents Service initialized successfully');
  }

  /**
   * Register health checks for agents and task manager
   */
  private registerHealthChecks(): void {
    // Task Manager health check
    this.health.registerCheck('task-manager', async () => {
      try {
        const stats = this.taskManager.getStatistics();
        const pendingTasks = stats.byStatus.pending || 0;
        const isHealthy = pendingTasks < 1000; // Threshold

        return {
          status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
          message: isHealthy
            ? 'Task manager operational'
            : `High pending task count: ${pendingTasks}`,
          metadata: {
            totalTasks: stats.total,
            pending: stats.byStatus.pending,
            running: stats.byStatus.running,
            completed: stats.byStatus.completed,
          },
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'Task manager check failed',
        };
      }
    });

    // Agent Router health check
    this.health.registerCheck('agent-router', async () => {
      try {
        const stats = this.router.getStatistics();
        const isHealthy = stats.totalAgents > 0;

        return {
          status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
          message: isHealthy ? 'Agent router operational' : 'No agents registered',
          metadata: {
            totalAgents: stats.totalAgents,
            activeAgents: stats.activeAgents,
            totalRoutes: stats.totalRoutes,
            avgResponseTime: stats.avgResponseTime,
          },
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'Agent router check failed',
        };
      }
    });

    this.logger.info('Health checks registered');
  }

  /**
   * Create and submit task with logging and metrics
   */
  async createTask(params: {
    type: TaskType;
    name: string;
    description: string;
    priority?: TaskPriority;
    metadata?: Record<string, any>;
  }): Promise<Task> {
    const taskCounter = this.metrics.counter('openclaw.tasks.created', {
      type: params.type,
      priority: params.priority || TaskPriority.MEDIUM,
    });

    this.logger.info('Creating task', {
      type: params.type,
      name: params.name,
      priority: params.priority,
    });

    try {
      const task = this.taskManager.createTask({
        type: params.type,
        name: params.name,
        description: params.description,
        priority: params.priority || TaskPriority.MEDIUM,
        metadata: params.metadata || {},
      });

      taskCounter.inc();

      this.logger.info('Task created successfully', {
        taskId: task.id,
        type: task.type,
      });

      return task;
    } catch (error) {
      this.logger.error('Failed to create task', error);
      throw new ValidationError('Task creation failed', {
        type: [error instanceof Error ? error.message : 'Unknown error'],
      });
    }
  }

  /**
   * Execute task with full monitoring
   */
  async executeTask(taskId: string): Promise<TaskResult> {
    const task = this.taskManager.getTask(taskId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    const executionCounter = this.metrics.counter('openclaw.tasks.executed', {
      type: task.type,
      priority: task.priority,
    });
    const executionTimer = this.metrics.timer('openclaw.task.execution.duration', {
      type: task.type,
    });

    // Create child logger for this task
    const taskLogger = this.logger.child({ taskId: task.id, taskType: task.type });

    taskLogger.info('Starting task execution', {
      name: task.name,
      priority: task.priority,
    });

    try {
      // Track execution time
      const result = await executionTimer.time(async () => {
        // Update task status
        this.taskManager.updateTaskStatus(taskId, TaskStatus.RUNNING);

        // Execute via coordinator
        const executionResult = await this.coordinator.executeTask(task);

        // Update task status based on result
        this.taskManager.updateTaskStatus(
          taskId,
          executionResult.success ? TaskStatus.COMPLETED : TaskStatus.FAILED
        );

        return executionResult;
      });

      executionCounter.inc();

      // Track result metrics
      const resultCounter = this.metrics.counter('openclaw.tasks.results', {
        success: result.success.toString(),
        type: task.type,
      });
      resultCounter.inc();

      if (result.success) {
        taskLogger.info('Task completed successfully', {
          duration: result.duration,
          subtasksCount: result.subtasks?.length || 0,
        });
      } else {
        taskLogger.warn('Task failed', {
          error: result.error,
          duration: result.duration,
        });
      }

      return result;
    } catch (error) {
      taskLogger.error('Task execution error', error);

      this.taskManager.updateTaskStatus(taskId, TaskStatus.FAILED);

      throw new AppError(
        'Task execution failed',
        'TASK_EXECUTION_FAILED',
        500,
        'high',
        {
          taskId,
          taskType: task.type,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  /**
   * Get task with error handling
   */
  getTask(taskId: string): Task {
    const task = this.taskManager.getTask(taskId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }
    return task;
  }

  /**
   * Get tasks by status with metrics
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    const queryCounter = this.metrics.counter('openclaw.tasks.queries', {
      status,
    });
    queryCounter.inc();

    return this.taskManager.getTasksByStatus(status);
  }

  /**
   * Get system health status
   */
  async getHealthStatus() {
    return await this.health.check();
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.metrics.export();
  }

  /**
   * Get comprehensive statistics
   */
  getStatistics() {
    const taskStats = this.taskManager.getStatistics();
    const routerStats = this.router.getStatistics();
    const metrics = this.metrics.export();

    return {
      tasks: taskStats,
      router: routerStats,
      metrics: {
        tasksCreated:
          metrics.find(m => m.name === 'openclaw.tasks.created')?.value || 0,
        tasksExecuted:
          metrics.find(m => m.name === 'openclaw.tasks.executed')?.value || 0,
        successfulTasks:
          metrics.filter(
            m => m.name === 'openclaw.tasks.results' && m.tags?.success === 'true'
          ).reduce((sum, m) => sum + (m.value as number), 0) || 0,
        failedTasks:
          metrics.filter(
            m => m.name === 'openclaw.tasks.results' && m.tags?.success === 'false'
          ).reduce((sum, m) => sum + (m.value as number), 0) || 0,
      },
    };
  }
}

/**
 * Example usage
 */
async function runIntegrationExample() {
  console.log('🦅 OpenClaw Meta-Agents - Common Utilities Integration Example\n');
  console.log('━'.repeat(60));
  console.log();

  // Initialize service
  const openClaw = new OpenClawService();

  console.log('✅ Service initialized with common utilities\n');

  // Example 1: Create Tasks
  console.log('Example 1: Creating Tasks with Logging & Metrics\n');

  const legalTask = await openClaw.createTask({
    type: TaskType.LEGAL_ANALYSIS,
    name: 'Analyze NDA Contract',
    description: 'Review and analyze non-disclosure agreement for compliance',
    priority: TaskPriority.HIGH,
    metadata: {
      documentId: 'doc-legal-001',
      jurisdiction: 'US',
      deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
  });
  console.log(`Created legal task: ${legalTask.id}`);

  const medicalTask = await openClaw.createTask({
    type: TaskType.MEDICAL_DIAGNOSIS,
    name: 'Analyze Medical Report',
    description: 'Review patient medical report and provide diagnostic insights',
    priority: TaskPriority.URGENT,
    metadata: {
      patientId: 'patient-001',
      reportType: 'blood-work',
    },
  });
  console.log(`Created medical task: ${medicalTask.id}\n`);

  // Example 2: Execute Tasks
  console.log('Example 2: Executing Tasks with Monitoring\n');

  const legalResult = await openClaw.executeTask(legalTask.id);
  console.log('Legal Task Result:');
  console.log(`  Success: ${legalResult.success}`);
  console.log(`  Duration: ${legalResult.duration}ms`);
  if (legalResult.subtasks) {
    console.log(`  Subtasks: ${legalResult.subtasks.length}`);
  }
  console.log();

  const medicalResult = await openClaw.executeTask(medicalTask.id);
  console.log('Medical Task Result:');
  console.log(`  Success: ${medicalResult.success}`);
  console.log(`  Duration: ${medicalResult.duration}ms`);
  console.log();

  // Example 3: Query Tasks
  console.log('Example 3: Querying Tasks\n');

  const completedTasks = openClaw.getTasksByStatus(TaskStatus.COMPLETED);
  console.log(`Completed Tasks: ${completedTasks.length}`);
  for (const task of completedTasks) {
    console.log(`  • ${task.name} (${task.type})`);
  }
  console.log();

  // Example 4: Health Check
  console.log('Example 4: System Health Check\n');

  const health = await openClaw.getHealthStatus();
  console.log(`Overall Status: ${health.status}`);
  console.log(`Uptime: ${(health.uptime / 1000).toFixed(2)}s`);
  console.log('\nComponent Health:');
  for (const [name, component] of Object.entries(health.components)) {
    console.log(`  • ${name}: ${component.status} - ${component.message}`);
  }
  console.log();

  // Example 5: Performance Metrics
  console.log('Example 5: Performance Metrics\n');

  const stats = openClaw.getStatistics();
  console.log('Task Manager:');
  console.log(`  Total Tasks: ${stats.tasks.total}`);
  console.log(`  Pending: ${stats.tasks.byStatus.pending || 0}`);
  console.log(`  Running: ${stats.tasks.byStatus.running || 0}`);
  console.log(`  Completed: ${stats.tasks.byStatus.completed || 0}`);
  console.log(`  Failed: ${stats.tasks.byStatus.failed || 0}`);
  console.log();

  console.log('Agent Router:');
  console.log(`  Total Agents: ${stats.router.totalAgents}`);
  console.log(`  Active Agents: ${stats.router.activeAgents}`);
  console.log(`  Total Routes: ${stats.router.totalRoutes}`);
  console.log();

  console.log('Service Metrics:');
  console.log(`  Tasks Created: ${stats.metrics.tasksCreated}`);
  console.log(`  Tasks Executed: ${stats.metrics.tasksExecuted}`);
  console.log(`  Successful: ${stats.metrics.successfulTasks}`);
  console.log(`  Failed: ${stats.metrics.failedTasks}`);
  console.log();

  console.log('━'.repeat(60));
  console.log('✅ Integration example completed!\n');
}

// Run example if executed directly
if (require.main === module) {
  runIntegrationExample().catch(console.error);
}

export { runIntegrationExample };
