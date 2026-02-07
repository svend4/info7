/**
 * OpenClaw Meta-Agents - Task Decomposer
 *
 * Decomposes complex tasks into manageable subtasks
 */

import { Task, DecompositionResult, TaskPriority } from '../types';
import { TaskManager } from '../core/task-manager';

/**
 * Task decomposition rules
 */
interface DecompositionRule {
  /** Task type this rule applies to */
  taskType: string;

  /** Function to decompose task */
  decompose: (task: Task, taskManager: TaskManager) => Task[];

  /** Execution mode (sequential/parallel) */
  executionMode: 'sequential' | 'parallel';
}

/**
 * Task Decomposer
 */
export class TaskDecomposer {
  private rules: Map<string, DecompositionRule> = new Map();

  constructor(private taskManager: TaskManager) {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default decomposition rules
   */
  private initializeDefaultRules(): void {
    // Legal consultation decomposition
    this.addRule({
      taskType: 'legal_consultation',
      decompose: (task) => [
        this.taskManager.createTask({
          description: 'Analyze legal issue',
          type: 'legal_analysis',
          priority: task.priority,
          parentId: task.id,
        }),
        this.taskManager.createTask({
          description: 'Research relevant laws and precedents',
          type: 'legal_research',
          priority: task.priority,
          parentId: task.id,
        }),
        this.taskManager.createTask({
          description: 'Draft legal opinion',
          type: 'document_generation',
          priority: task.priority,
          parentId: task.id,
        }),
      ],
      executionMode: 'sequential',
    });

    // Medical consultation decomposition
    this.addRule({
      taskType: 'medical_consultation',
      decompose: (task) => [
        this.taskManager.createTask({
          description: 'Review symptoms and history',
          type: 'medical_assessment',
          priority: task.priority,
          parentId: task.id,
        }),
        this.taskManager.createTask({
          description: 'Research conditions and treatments',
          type: 'medical_research',
          priority: task.priority,
          parentId: task.id,
        }),
        this.taskManager.createTask({
          description: 'Generate medical recommendations',
          type: 'recommendation_generation',
          priority: task.priority,
          parentId: task.id,
        }),
      ],
      executionMode: 'sequential',
    });

    // Financial analysis decomposition
    this.addRule({
      taskType: 'financial_analysis',
      decompose: (task) => [
        this.taskManager.createTask({
          description: 'Collect financial data',
          type: 'data_collection',
          priority: task.priority,
          parentId: task.id,
        }),
        this.taskManager.createTask({
          description: 'Analyze income and expenses',
          type: 'financial_calculation',
          priority: task.priority,
          parentId: task.id,
        }),
        this.taskManager.createTask({
          description: 'Generate financial report',
          type: 'report_generation',
          priority: task.priority,
          parentId: task.id,
        }),
      ],
      executionMode: 'sequential',
    });

    // Research task (can run in parallel)
    this.addRule({
      taskType: 'comprehensive_research',
      decompose: (task) => [
        this.taskManager.createTask({
          description: 'Search online databases',
          type: 'database_search',
          priority: task.priority,
          parentId: task.id,
        }),
        this.taskManager.createTask({
          description: 'Review academic papers',
          type: 'literature_review',
          priority: task.priority,
          parentId: task.id,
        }),
        this.taskManager.createTask({
          description: 'Analyze expert opinions',
          type: 'expert_consultation',
          priority: task.priority,
          parentId: task.id,
        }),
      ],
      executionMode: 'parallel',
    });

    // Content creation decomposition
    this.addRule({
      taskType: 'content_creation',
      decompose: (task) => [
        this.taskManager.createTask({
          description: 'Research topic and gather information',
          type: 'content_research',
          priority: task.priority,
          parentId: task.id,
        }),
        this.taskManager.createTask({
          description: 'Create outline and structure',
          type: 'content_planning',
          priority: task.priority,
          parentId: task.id,
        }),
        this.taskManager.createTask({
          description: 'Write and format content',
          type: 'content_writing',
          priority: task.priority,
          parentId: task.id,
        }),
        this.taskManager.createTask({
          description: 'Review and edit content',
          type: 'content_editing',
          priority: task.priority,
          parentId: task.id,
        }),
      ],
      executionMode: 'sequential',
    });
  }

  /**
   * Add custom decomposition rule
   */
  addRule(rule: DecompositionRule): void {
    this.rules.set(rule.taskType, rule);
  }

  /**
   * Decompose task into subtasks
   */
  decompose(task: Task): DecompositionResult {
    const rule = this.rules.get(task.type);

    if (!rule) {
      // No decomposition rule - task is atomic
      return {
        originalTask: task,
        subtasks: [],
        plan: {
          mode: 'sequential',
          steps: [{
            taskIds: [task.id],
            dependencies: [],
            estimatedDuration: task.metadata.estimatedDuration ?? 60000,
          }],
          totalEstimatedDuration: task.metadata.estimatedDuration ?? 60000,
        },
        assignments: new Map(),
      };
    }

    // Decompose using rule
    const subtasks = rule.decompose(task, this.taskManager);

    // Create execution plan
    const plan = this.createExecutionPlan(subtasks, rule.executionMode);

    return {
      originalTask: task,
      subtasks,
      plan,
      assignments: new Map(),
    };
  }

  /**
   * Create execution plan from subtasks
   */
  private createExecutionPlan(
    subtasks: Task[],
    mode: 'sequential' | 'parallel'
  ): DecompositionResult['plan'] {
    if (mode === 'parallel') {
      // All tasks can run in parallel
      return {
        mode: 'parallel',
        steps: [
          {
            taskIds: subtasks.map((t) => t.id),
            dependencies: [],
            estimatedDuration: Math.max(
              ...subtasks.map((t) => t.metadata.estimatedDuration ?? 60000)
            ),
          },
        ],
        totalEstimatedDuration: Math.max(
          ...subtasks.map((t) => t.metadata.estimatedDuration ?? 60000)
        ),
      };
    } else {
      // Sequential execution
      const steps = subtasks.map((task, index) => ({
        taskIds: [task.id],
        dependencies: index > 0 ? [subtasks[index - 1].id] : [],
        estimatedDuration: task.metadata.estimatedDuration ?? 60000,
      }));

      const totalEstimatedDuration = subtasks.reduce(
        (sum, task) => sum + (task.metadata.estimatedDuration ?? 60000),
        0
      );

      return {
        mode: 'sequential',
        steps,
        totalEstimatedDuration,
      };
    }
  }

  /**
   * Auto-decompose task based on complexity
   */
  autoDecompose(task: Task): DecompositionResult {
    // Check if we have a rule for this task type
    if (this.rules.has(task.type)) {
      return this.decompose(task);
    }

    // Auto-decomposition based on description length
    // This is a simplified heuristic - in production, use ML
    const descriptionLength = task.description.length;

    if (descriptionLength > 500) {
      // Complex task - break into phases
      const subtasks = [
        this.taskManager.createTask({
          description: 'Plan and prepare',
          type: `${task.type}_planning`,
          priority: task.priority,
          parentId: task.id,
          metadata: { estimatedDuration: 30000 },
        }),
        this.taskManager.createTask({
          description: 'Execute main work',
          type: `${task.type}_execution`,
          priority: task.priority,
          parentId: task.id,
          metadata: { estimatedDuration: 120000 },
        }),
        this.taskManager.createTask({
          description: 'Review and finalize',
          type: `${task.type}_review`,
          priority: task.priority,
          parentId: task.id,
          metadata: { estimatedDuration: 30000 },
        }),
      ];

      const plan = this.createExecutionPlan(subtasks, 'sequential');

      return {
        originalTask: task,
        subtasks,
        plan,
        assignments: new Map(),
      };
    }

    // Simple task - no decomposition needed
    return {
      originalTask: task,
      subtasks: [],
      plan: {
        mode: 'sequential',
        steps: [{
          taskIds: [task.id],
          dependencies: [],
          estimatedDuration: task.metadata.estimatedDuration ?? 60000,
        }],
        totalEstimatedDuration: task.metadata.estimatedDuration ?? 60000,
      },
      assignments: new Map(),
    };
  }

  /**
   * Check if task needs decomposition
   */
  needsDecomposition(task: Task): boolean {
    return this.rules.has(task.type) || task.description.length > 500;
  }
}
