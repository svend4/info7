/**
 * OpenClaw Meta-Agents - Agent Selector
 *
 * Selects optimal agents for tasks based on various criteria
 */

import { Agent, Task, SelectionCriteria, SpecializedAgent } from '../types';

/**
 * Selection strategy
 */
type SelectionStrategy = 'round-robin' | 'load-based' | 'capability-based' | 'hybrid';

/**
 * Agent Selector
 */
export class AgentSelector {
  private roundRobinIndex: Map<string, number> = new Map();

  constructor(private strategy: SelectionStrategy = 'hybrid') {}

  /**
   * Select best agent for task
   */
  selectAgent(
    task: Task,
    availableAgents: SpecializedAgent[]
  ): SpecializedAgent | null {
    // Filter agents that can handle this task
    const capableAgents = availableAgents.filter((agent) => {
      // Check if agent can handle task type
      if (!agent.capabilities.some((cap) => cap.taskTypes.includes(task.type))) {
        return false;
      }

      // Check if agent has required skills
      if (task.requirements?.skills) {
        const agentSkills = new Set(
          agent.capabilities.flatMap((cap) => cap.skills)
        );
        if (!task.requirements.skills.every((skill) => agentSkills.has(skill))) {
          return false;
        }
      }

      // Check if agent is available
      if (agent.status !== 'idle') {
        return false;
      }

      return true;
    });

    if (capableAgents.length === 0) {
      return null;
    }

    // Select agent based on strategy
    switch (this.strategy) {
      case 'round-robin':
        return this.selectRoundRobin(task.type, capableAgents);

      case 'load-based':
        return this.selectByLoad(capableAgents);

      case 'capability-based':
        return this.selectByCapability(task, capableAgents);

      case 'hybrid':
      default:
        return this.selectHybrid(task, capableAgents);
    }
  }

  /**
   * Round-robin selection
   */
  private selectRoundRobin(
    taskType: string,
    agents: SpecializedAgent[]
  ): SpecializedAgent {
    const currentIndex = this.roundRobinIndex.get(taskType) ?? 0;
    const selectedAgent = agents[currentIndex % agents.length];

    this.roundRobinIndex.set(taskType, currentIndex + 1);

    return selectedAgent;
  }

  /**
   * Load-based selection (choose least busy agent)
   */
  private selectByLoad(agents: SpecializedAgent[]): SpecializedAgent {
    return agents.reduce((best, current) =>
      current.workload.utilizationRate < best.workload.utilizationRate
        ? current
        : best
    );
  }

  /**
   * Capability-based selection (choose most proficient agent)
   */
  private selectByCapability(
    task: Task,
    agents: SpecializedAgent[]
  ): SpecializedAgent {
    return agents.reduce((best, current) => {
      const currentProficiency = this.getTaskProficiency(current, task.type);
      const bestProficiency = this.getTaskProficiency(best, task.type);

      return currentProficiency > bestProficiency ? current : best;
    });
  }

  /**
   * Hybrid selection (combines load and capability)
   */
  private selectHybrid(
    task: Task,
    agents: SpecializedAgent[]
  ): SpecializedAgent {
    // Score each agent
    const scores = agents.map((agent) => ({
      agent,
      score: this.calculateAgentScore(agent, task),
    }));

    // Return agent with highest score
    const best = scores.reduce((max, current) =>
      current.score > max.score ? current : max
    );

    return best.agent;
  }

  /**
   * Calculate agent score for hybrid selection
   */
  private calculateAgentScore(agent: SpecializedAgent, task: Task): number {
    let score = 0;

    // Capability score (0-40 points)
    const proficiency = this.getTaskProficiency(agent, task.type);
    score += proficiency * 40;

    // Availability score (0-30 points)
    const availabilityScore = (1 - agent.workload.utilizationRate) * 30;
    score += availabilityScore;

    // Success rate score (0-20 points)
    score += agent.metadata.successRate * 20;

    // Response time score (0-10 points)
    // Lower average response time is better
    const avgResponseMs = agent.metadata.averageResponseTime;
    const responseScore = Math.max(0, 10 - (avgResponseMs / 10000)); // Normalize to 10 points
    score += responseScore;

    return score;
  }

  /**
   * Get agent's proficiency for specific task type
   */
  private getTaskProficiency(agent: SpecializedAgent, taskType: string): number {
    const capability = agent.capabilities.find((cap) =>
      cap.taskTypes.includes(taskType)
    );

    return capability?.proficiency ?? 0;
  }

  /**
   * Select multiple agents for parallel tasks
   */
  selectAgentsForParallelTasks(
    tasks: Task[],
    availableAgents: SpecializedAgent[]
  ): Map<string, SpecializedAgent> {
    const assignments = new Map<string, SpecializedAgent>();
    const usedAgents = new Set<string>();

    // Sort tasks by priority (highest first)
    const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);

    for (const task of sortedTasks) {
      // Filter out already-used agents
      const unusedAgents = availableAgents.filter(
        (agent) => !usedAgents.has(agent.id)
      );

      const selectedAgent = this.selectAgent(task, unusedAgents);

      if (selectedAgent) {
        assignments.set(task.id, selectedAgent);
        usedAgents.add(selectedAgent.id);
      }
    }

    return assignments;
  }

  /**
   * Find agents matching criteria
   */
  findAgentsByCriteria(
    agents: SpecializedAgent[],
    criteria: SelectionCriteria
  ): SpecializedAgent[] {
    return agents.filter((agent) => {
      // Check task type
      if (!agent.capabilities.some((cap) =>
        cap.taskTypes.includes(criteria.taskType)
      )) {
        return false;
      }

      // Check required skills
      if (criteria.requiredSkills) {
        const agentSkills = new Set(
          agent.capabilities.flatMap((cap) => cap.skills)
        );
        if (!criteria.requiredSkills.every((skill) => agentSkills.has(skill))) {
          return false;
        }
      }

      // Check minimum proficiency
      if (criteria.minProficiency) {
        const proficiency = this.getTaskProficiency(agent, criteria.taskType);
        if (proficiency < criteria.minProficiency) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Update selection strategy
   */
  setStrategy(strategy: SelectionStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Get current strategy
   */
  getStrategy(): SelectionStrategy {
    return this.strategy;
  }

  /**
   * Reset round-robin counters
   */
  resetRoundRobin(): void {
    this.roundRobinIndex.clear();
  }
}
