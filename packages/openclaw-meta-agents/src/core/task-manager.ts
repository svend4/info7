/**
 * OpenClaw Meta-Agents - Task Manager
 *
 * Manages tasks and their lifecycle
 */

import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus, TaskPriority, TaskResult, ProgressUpdate } from '../types';

/**
 * Task Manager for tracking and managing tasks
 */
export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private progressCallbacks: Map<string, Array<(update: ProgressUpdate) => void>> = new Map();

  /**
   * Create a new task
   */
  createTask(params: {
    description: string;
    type: string;
    priority?: TaskPriority;
    parentId?: string;
    requirements?: Task['requirements'];
    metadata?: Record<string, any>;
  }): Task {
    const task: Task = {
      id: uuidv4(),
      description: params.description,
      type: params.type,
      priority: params.priority ?? TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      parentId: params.parentId,
      subtasks: [],
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...params.metadata,
      },
      requirements: params.requirements,
    };

    this.tasks.set(task.id, task);

    // Add to parent's subtasks if applicable
    if (params.parentId) {
      const parent = this.tasks.get(params.parentId);
      if (parent) {
        parent.subtasks.push(task);
      }
    }

    return task;
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Update task status
   */
  updateStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = status;
    task.metadata.updatedAt = Date.now();

    if (status === TaskStatus.IN_PROGRESS && !task.metadata.startedAt) {
      task.metadata.startedAt = Date.now();
    }

    if (
      status === TaskStatus.COMPLETED ||
      status === TaskStatus.FAILED ||
      status === TaskStatus.CANCELLED
    ) {
      task.metadata.completedAt = Date.now();
      if (task.metadata.startedAt) {
        task.metadata.actualDuration =
          task.metadata.completedAt - task.metadata.startedAt;
      }
    }
  }

  /**
   * Set task result
   */
  setResult(taskId: string, result: TaskResult): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.result = result;
    task.metadata.updatedAt = Date.now();

    // Automatically update status based on result
    if (result.success) {
      this.updateStatus(taskId, TaskStatus.COMPLETED);
    } else {
      this.updateStatus(taskId, TaskStatus.FAILED);
    }
  }

  /**
   * Update task progress
   */
  updateProgress(taskId: string, update: Omit<ProgressUpdate, 'taskId' | 'timestamp'>): void {
    const progressUpdate: ProgressUpdate = {
      taskId,
      ...update,
      timestamp: Date.now(),
    };

    // Notify progress callbacks
    const callbacks = this.progressCallbacks.get(taskId) ?? [];
    callbacks.forEach((callback) => callback(progressUpdate));
  }

  /**
   * Subscribe to task progress updates
   */
  onProgress(taskId: string, callback: (update: ProgressUpdate) => void): () => void {
    const callbacks = this.progressCallbacks.get(taskId) ?? [];
    callbacks.push(callback);
    this.progressCallbacks.set(taskId, callbacks);

    // Return unsubscribe function
    return () => {
      const currentCallbacks = this.progressCallbacks.get(taskId) ?? [];
      const index = currentCallbacks.indexOf(callback);
      if (index !== -1) {
        currentCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get all tasks with a specific status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values()).filter((task) => task.status === status);
  }

  /**
   * Get all subtasks of a task
   */
  getSubtasks(taskId: string): Task[] {
    const task = this.tasks.get(taskId);
    return task?.subtasks ?? [];
  }

  /**
   * Get task tree (task with all nested subtasks)
   */
  getTaskTree(taskId: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    // Clone task with full subtask tree
    const cloneWithSubtasks = (t: Task): Task => ({
      ...t,
      subtasks: t.subtasks.map(cloneWithSubtasks),
    });

    return cloneWithSubtasks(task);
  }

  /**
   * Get pending tasks ordered by priority
   */
  getPendingTasksByPriority(): Task[] {
    return this.getTasksByStatus(TaskStatus.PENDING).sort(
      (a, b) => b.priority - a.priority
    );
  }

  /**
   * Check if all subtasks are completed
   */
  areSubtasksCompleted(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    if (task.subtasks.length === 0) return true;

    return task.subtasks.every(
      (subtask) => subtask.status === TaskStatus.COMPLETED
    );
  }

  /**
   * Get task statistics
   */
  getStatistics(): {
    total: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
    avgDuration: number;
    successRate: number;
  } {
    const tasks = Array.from(this.tasks.values());

    const byStatus: Record<TaskStatus, number> = {
      [TaskStatus.PENDING]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.FAILED]: 0,
      [TaskStatus.CANCELLED]: 0,
    };

    const byPriority: Record<TaskPriority, number> = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.CRITICAL]: 0,
    };

    let totalDuration = 0;
    let durationCount = 0;
    let completedCount = 0;
    let successCount = 0;

    for (const task of tasks) {
      byStatus[task.status]++;
      byPriority[task.priority]++;

      if (task.metadata.actualDuration) {
        totalDuration += task.metadata.actualDuration;
        durationCount++;
      }

      if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED) {
        completedCount++;
        if (task.status === TaskStatus.COMPLETED) {
          successCount++;
        }
      }
    }

    return {
      total: tasks.length,
      byStatus,
      byPriority,
      avgDuration: durationCount > 0 ? totalDuration / durationCount : 0,
      successRate: completedCount > 0 ? successCount / completedCount : 0,
    };
  }

  /**
   * Clear completed tasks older than specified age
   */
  clearOldTasks(maxAgeMs: number): number {
    const now = Date.now();
    let cleared = 0;

    for (const [taskId, task] of this.tasks.entries()) {
      if (
        task.status === TaskStatus.COMPLETED &&
        task.metadata.completedAt &&
        now - task.metadata.completedAt > maxAgeMs
      ) {
        this.tasks.delete(taskId);
        this.progressCallbacks.delete(taskId);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Clear all tasks
   */
  clear(): void {
    this.tasks.clear();
    this.progressCallbacks.clear();
  }
}
