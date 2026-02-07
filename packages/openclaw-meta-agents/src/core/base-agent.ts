/**
 * OpenClaw Meta-Agents - Base Agent
 *
 * Base class for all agent types
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Agent,
  AgentLevel,
  AgentCapability,
  Task,
  TaskResult,
  AgentMessage,
} from '../types';

/**
 * Base agent class
 */
export abstract class BaseAgent implements Agent {
  id: string;
  name: string;
  level: AgentLevel;
  type: string;
  capabilities: AgentCapability[];
  status: 'idle' | 'busy' | 'offline';
  workload: {
    activeTasks: number;
    maxConcurrentTasks: number;
    utilizationRate: number;
  };
  metadata: {
    createdAt: number;
    lastActiveAt: number;
    totalTasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
  };

  protected messageHandlers: Map<
    string,
    (message: AgentMessage) => Promise<void>
  > = new Map();

  constructor(params: {
    name: string;
    level: AgentLevel;
    type: string;
    capabilities: AgentCapability[];
    maxConcurrentTasks?: number;
  }) {
    this.id = uuidv4();
    this.name = params.name;
    this.level = params.level;
    this.type = params.type;
    this.capabilities = params.capabilities;
    this.status = 'idle';
    this.workload = {
      activeTasks: 0,
      maxConcurrentTasks: params.maxConcurrentTasks ?? 5,
      utilizationRate: 0,
    };
    this.metadata = {
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      totalTasksCompleted: 0,
      successRate: 1.0,
      averageResponseTime: 0,
    };

    this.setupMessageHandlers();
  }

  /**
   * Setup message handlers
   */
  protected setupMessageHandlers(): void {
    // Override in subclasses to add specific handlers
  }

  /**
   * Check if agent can handle task type
   */
  canHandle(taskType: string): boolean {
    return this.capabilities.some((cap) =>
      cap.taskTypes.includes(taskType)
    );
  }

  /**
   * Check if agent has required skills
   */
  hasSkills(skills: string[]): boolean {
    const agentSkills = new Set(
      this.capabilities.flatMap((cap) => cap.skills)
    );
    return skills.every((skill) => agentSkills.has(skill));
  }

  /**
   * Check if agent is available
   */
  isAvailable(): boolean {
    return (
      this.status === 'idle' &&
      this.workload.activeTasks < this.workload.maxConcurrentTasks
    );
  }

  /**
   * Execute task (abstract - must be implemented by subclasses)
   */
  abstract executeTask(task: Task): Promise<TaskResult>;

  /**
   * Handle incoming message
   */
  async handleMessage(message: AgentMessage): Promise<void> {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      await handler(message);
    } else {
      console.warn(`No handler for message type: ${message.type}`);
    }
  }

  /**
   * Send message to another agent
   */
  protected async sendMessage(
    to: string,
    type: AgentMessage['type'],
    payload: any,
    inReplyTo?: string
  ): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: uuidv4(),
      from: this.id,
      to,
      type,
      payload,
      timestamp: Date.now(),
      inReplyTo,
    };

    // In a real system, this would go through a message bus
    // For now, we'll just return the message
    return message;
  }

  /**
   * Update workload after task completion
   */
  protected updateWorkload(completed: boolean, responseTime: number): void {
    if (completed) {
      this.workload.activeTasks = Math.max(0, this.workload.activeTasks - 1);
      this.metadata.totalTasksCompleted++;

      // Update average response time
      const n = this.metadata.totalTasksCompleted;
      this.metadata.averageResponseTime =
        (this.metadata.averageResponseTime * (n - 1) + responseTime) / n;
    }

    // Update utilization rate
    this.workload.utilizationRate =
      this.workload.activeTasks / this.workload.maxConcurrentTasks;

    // Update status
    this.status = this.workload.activeTasks > 0 ? 'busy' : 'idle';
    this.metadata.lastActiveAt = Date.now();
  }

  /**
   * Update success rate
   */
  protected updateSuccessRate(success: boolean): void {
    const n = this.metadata.totalTasksCompleted;
    if (n > 0) {
      this.metadata.successRate =
        (this.metadata.successRate * (n - 1) + (success ? 1 : 0)) / n;
    }
  }

  /**
   * Get agent info
   */
  getInfo(): Agent {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      type: this.type,
      capabilities: this.capabilities,
      status: this.status,
      workload: { ...this.workload },
      metadata: { ...this.metadata },
    };
  }

  /**
   * Shutdown agent
   */
  shutdown(): void {
    this.status = 'offline';
  }
}
