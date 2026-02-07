/**
 * Integration Bridge
 *
 * Core bridge layer that connects Leonardo AI (RL + RAG) with external systems.
 * Acts as the "brain" that coordinates between learning, knowledge, and execution.
 */

import { Logger, MetricsCollector, AppError } from '@info7/common';
import { LeonardoRLEngine } from '../rl/leonardo-rl-engine';
import { RAGEngine } from '../rag/rag-engine';
import { State, Action, ActionType } from '../rl/types';
import {
  SystemType,
  OrchestratorContext,
  OrchestratorAction,
  OpenClawContext,
  AgentRecommendation,
  SystemFeedback,
  KnowledgeContext,
  BridgeStatistics,
} from './types';

/**
 * Integration Bridge Configuration
 */
export interface BridgeConfig {
  enableLearning: boolean;
  knowledgeThreshold: number;  // minimum relevance score
  confidenceThreshold: number;  // minimum confidence for recommendations
  feedbackBufferSize: number;
}

/**
 * Integration Bridge
 *
 * Connects Leonardo AI with Orchestrator Kit and OpenClaw Meta-Agents.
 */
export class IntegrationBridge {
  private logger: Logger;
  private metrics: MetricsCollector;
  private rlEngine: LeonardoRLEngine;
  private ragEngine: RAGEngine;
  private config: BridgeConfig;

  // Statistics
  private stats: BridgeStatistics;
  private feedbackBuffer: SystemFeedback[];

  constructor(
    rlEngine: LeonardoRLEngine,
    ragEngine: RAGEngine,
    config: Partial<BridgeConfig> = {}
  ) {
    this.logger = new Logger({
      level: 'info',
      context: { component: 'integration-bridge' },
    });

    this.metrics = new MetricsCollector();
    this.rlEngine = rlEngine;
    this.ragEngine = ragEngine;

    this.config = {
      enableLearning: true,
      knowledgeThreshold: 0.7,
      confidenceThreshold: 0.6,
      feedbackBufferSize: 100,
      ...config,
    };

    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      bySystemType: new Map(),
      feedbackReceived: 0,
      learningIterations: 0,
    };

    this.feedbackBuffer = [];

    this.logger.info('Integration Bridge initialized', {
      enableLearning: this.config.enableLearning,
    });
  }

  /**
   * Bridge to Orchestrator Kit
   *
   * Recommends actions for Orchestrator based on RL learning and RAG knowledge.
   */
  async bridgeToOrchestrator(
    context: OrchestratorContext
  ): Promise<OrchestratorAction> {
    const bridgeCounter = this.metrics.counter('bridge.orchestrator.requests');
    const bridgeTimer = this.metrics.timer('bridge.orchestrator.duration');

    this.logger.info('Bridging to Orchestrator', {
      taskType: context.task.type,
      priority: context.task.priority,
    });

    try {
      const result = await bridgeTimer.time(async () => {
        // Step 1: Query RAG for relevant knowledge
        const knowledge = await this.getRelevantKnowledge(
          context.task.description,
          context.task.type
        );

        this.logger.debug('Knowledge retrieved', {
          relevance: knowledge.relevance,
          resultsCount: knowledge.results.length,
        });

        // Step 2: Convert context to RL state
        const state = this.contextToState(context, knowledge);

        // Step 3: Get action recommendation from RL
        const action = await this.rlEngine.selectAction(state);

        this.logger.debug('Action selected', {
          type: action.type,
          confidence: action.confidence,
        });

        // Step 4: Generate alternatives
        const alternatives = await this.generateAlternatives(state, action);

        // Step 5: Estimate impact
        const estimatedImpact = this.estimateImpact(
          action,
          context,
          knowledge
        );

        // Step 6: Generate next steps
        const nextSteps = this.generateNextSteps(action, context, knowledge);

        return {
          type: action.type,
          confidence: action.confidence,
          reasoning: this.generateReasoning(action, knowledge),
          alternatives,
          estimatedImpact,
          nextSteps,
        };
      });

      bridgeCounter.inc();
      this.updateStats(SystemType.ORCHESTRATOR, true, bridgeTimer);

      this.logger.info('Orchestrator bridge completed', {
        actionType: result.type,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      this.logger.error('Orchestrator bridge failed', error);
      this.updateStats(SystemType.ORCHESTRATOR, false, bridgeTimer);

      throw new AppError(
        'Orchestrator bridge failed',
        'ORCHESTRATOR_BRIDGE_FAILED',
        500,
        'high',
        { taskType: context.task.type }
      );
    }
  }

  /**
   * Bridge to OpenClaw Meta-Agents
   *
   * Recommends agent selection and task decomposition strategies.
   */
  async bridgeToOpenClaw(
    context: OpenClawContext
  ): Promise<AgentRecommendation> {
    const bridgeCounter = this.metrics.counter('bridge.openclaw.requests');
    const bridgeTimer = this.metrics.timer('bridge.openclaw.duration');

    this.logger.info('Bridging to OpenClaw', {
      taskType: context.task.type,
      complexity: context.task.complexity,
    });

    try {
      const result = await bridgeTimer.time(async () => {
        // Step 1: Assess task complexity using RL
        const complexity = await this.assessComplexity(context.task);

        this.logger.debug('Complexity assessed', { complexity });

        // Step 2: Search for similar successful cases in RAG
        const similarCases = await this.ragEngine.query(
          `similar successful tasks: ${context.task.type} complexity:${complexity}`,
          10
        );

        this.logger.debug('Similar cases found', {
          count: similarCases.length,
        });

        // Step 3: Recommend agents based on capabilities and past performance
        const recommendedAgents = this.recommendAgents(
          context.availableAgents,
          context.task,
          similarCases
        );

        // Step 4: Decide on decomposition strategy
        const decomposition = this.suggestDecomposition(
          context.task,
          complexity,
          similarCases
        );

        // Step 5: Calculate priority
        const priority = this.calculatePriority(context.task, complexity);

        // Step 6: Recommend routing strategy
        const routing = this.recommendRoutingStrategy(
          context.availableAgents,
          decomposition
        );

        return {
          recommendedAgents,
          decomposition,
          priority,
          routing,
        };
      });

      bridgeCounter.inc();
      this.updateStats(SystemType.OPENCLAW, true, bridgeTimer);

      this.logger.info('OpenClaw bridge completed', {
        agentsRecommended: result.recommendedAgents.length,
        shouldDecompose: result.decomposition?.shouldDecompose,
      });

      return result;
    } catch (error) {
      this.logger.error('OpenClaw bridge failed', error);
      this.updateStats(SystemType.OPENCLAW, false, bridgeTimer);

      throw new AppError(
        'OpenClaw bridge failed',
        'OPENCLAW_BRIDGE_FAILED',
        500,
        'high',
        { taskType: context.task.type }
      );
    }
  }

  /**
   * Receive feedback from external systems
   *
   * Learns from execution results to improve future recommendations.
   */
  async receiveFeedback(feedback: SystemFeedback): Promise<void> {
    const feedbackCounter = this.metrics.counter('bridge.feedback.received', {
      systemType: feedback.systemType,
      success: feedback.success.toString(),
    });

    this.logger.info('Receiving feedback', {
      systemType: feedback.systemType,
      success: feedback.success,
      reward: feedback.reward,
    });

    try {
      // Store feedback
      this.feedbackBuffer.push(feedback);
      if (this.feedbackBuffer.length > this.config.feedbackBufferSize) {
        this.feedbackBuffer.shift();
      }

      this.stats.feedbackReceived++;
      feedbackCounter.inc();

      // Learn from feedback if enabled
      if (this.config.enableLearning) {
        await this.rlEngine.learn(
          feedback.state,
          feedback.action,
          feedback.reward,
          feedback.nextState,
          feedback.done
        );

        this.stats.learningIterations++;

        this.logger.info('Learning from feedback completed', {
          reward: feedback.reward,
          done: feedback.done,
        });
      }

      // Store successful cases in RAG for future reference
      if (feedback.success && feedback.reward > 0.8) {
        await this.ragEngine.addDocument({
          id: `feedback-${Date.now()}-${Math.random()}`,
          content: JSON.stringify({
            task: feedback.task,
            action: feedback.action.type,
            reward: feedback.reward,
            duration: feedback.metadata.duration,
            quality: feedback.metadata.quality,
          }),
          metadata: {
            type: 'success-case',
            systemType: feedback.systemType,
            task: feedback.task,
            reward: feedback.reward,
            timestamp: Date.now(),
          },
        });

        this.logger.debug('Success case stored in knowledge base');
      }
    } catch (error) {
      this.logger.error('Feedback processing failed', error);
    }
  }

  /**
   * Get relevant knowledge from RAG
   */
  private async getRelevantKnowledge(
    description: string,
    taskType: string
  ): Promise<KnowledgeContext> {
    const query = `${taskType}: ${description}`;
    const results = await this.ragEngine.query(query, 5);

    // Filter by relevance threshold
    const relevantResults = results.filter(
      r => r.score >= this.config.knowledgeThreshold
    );

    const summary = relevantResults.length > 0
      ? relevantResults.map(r => r.content).join(' | ')
      : 'No relevant knowledge found';

    const avgRelevance = relevantResults.length > 0
      ? relevantResults.reduce((sum, r) => sum + r.score, 0) / relevantResults.length
      : 0;

    return {
      query,
      results: relevantResults,
      summary,
      relevance: avgRelevance,
    };
  }

  /**
   * Convert Orchestrator context to RL state
   */
  private contextToState(
    context: OrchestratorContext,
    knowledge: KnowledgeContext
  ): State {
    return {
      task: context.task.type,
      complexity: this.estimateComplexity(context),
      resources: {
        orchestratorAvailable: true,
        openclawAvailable: false,
        externalAPIsAvailable: context.resources.available,
      },
      history: {
        recentActions: [],
        recentRewards: [],
        successRate: 0,
      },
      userContext: {
        preferredMode: this.mapPriorityToMode(context.task.priority),
        timeConstraint: context.constraints.timeLimit,
        qualityThreshold: context.constraints.qualityThreshold || 0.8,
      },
      metrics: {
        cpuUsage: 50,  // would be from system metrics
        memoryUsage: 60,
        queueLength: 5,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Estimate task complexity
   */
  private estimateComplexity(context: OrchestratorContext): number {
    let complexity = 0.5;  // base

    // Increase complexity based on constraints
    if (context.constraints.timeLimit && context.constraints.timeLimit < 60000) {
      complexity += 0.2;  // tight deadline
    }

    if (context.task.priority === 'critical') {
      complexity += 0.1;
    }

    return Math.min(1.0, complexity);
  }

  /**
   * Map priority to preferred mode
   */
  private mapPriorityToMode(
    priority: string
  ): 'fast' | 'balanced' | 'thorough' {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'fast';
      case 'medium':
        return 'balanced';
      case 'low':
      default:
        return 'thorough';
    }
  }

  /**
   * Generate alternative actions
   */
  private async generateAlternatives(
    state: State,
    primaryAction: Action
  ): Promise<Array<{ type: string; confidence: number; tradeoffs: string }>> {
    // Simple heuristic: suggest 2-3 alternative action types
    const alternatives: Array<{ type: string; confidence: number; tradeoffs: string }> = [];

    if (primaryAction.type === ActionType.EXECUTE_DIRECTLY) {
      alternatives.push({
        type: ActionType.USE_ORCHESTRATOR,
        confidence: 0.7,
        tradeoffs: 'Higher quality but slower execution',
      });
    } else if (primaryAction.type === ActionType.USE_ORCHESTRATOR) {
      alternatives.push({
        type: ActionType.EXECUTE_DIRECTLY,
        confidence: 0.6,
        tradeoffs: 'Faster but potentially lower quality',
      });
    }

    return alternatives;
  }

  /**
   * Estimate impact of action
   */
  private estimateImpact(
    action: Action,
    context: OrchestratorContext,
    knowledge: KnowledgeContext
  ) {
    // Heuristic estimation based on action type and knowledge
    const baseTime = 5000;  // 5 seconds base
    const complexity = this.estimateComplexity(context);

    return {
      timeToComplete: baseTime * (1 + complexity),
      resourcesNeeded: context.resources.available.slice(0, 2),
      successProbability: action.confidence * (1 + knowledge.relevance * 0.2),
    };
  }

  /**
   * Generate reasoning for action
   */
  private generateReasoning(
    action: Action,
    knowledge: KnowledgeContext
  ): string {
    const parts: string[] = [];

    parts.push(`Selected ${action.type} with ${(action.confidence * 100).toFixed(1)}% confidence.`);

    if (knowledge.relevance > 0.7) {
      parts.push(`Based on ${knowledge.results.length} relevant past cases.`);
    }

    if (action.parameters) {
      parts.push(`Using optimized parameters from learning.`);
    }

    return parts.join(' ');
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(
    action: Action,
    context: OrchestratorContext,
    knowledge: KnowledgeContext
  ): string[] {
    const steps: string[] = [];

    steps.push(`Execute ${action.type} action`);

    if (context.task.priority === 'critical') {
      steps.push('Monitor execution closely');
      steps.push('Prepare fallback strategy');
    }

    steps.push('Collect execution metrics');
    steps.push('Provide feedback for learning');

    return steps;
  }

  /**
   * Assess task complexity using RL value function
   */
  private async assessComplexity(task: { type: string; description: string; complexity: number }): Promise<number> {
    // Use provided complexity or estimate
    return task.complexity;
  }

  /**
   * Recommend agents based on capabilities
   */
  private recommendAgents(
    availableAgents: any[],
    task: any,
    similarCases: any[]
  ) {
    const recommendations = availableAgents
      .filter(agent => {
        // Check if agent has required capabilities
        return agent.capabilities.some((cap: string) =>
          task.type.toLowerCase().includes(cap.toLowerCase())
        );
      })
      .map(agent => ({
        agentId: agent.id,
        confidence: agent.performance * (1 - agent.currentLoad / 100),
        reasoning: `Agent has ${agent.capabilities.length} relevant capabilities and ${(agent.performance * 100).toFixed(0)}% performance rating`,
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return recommendations;
  }

  /**
   * Suggest task decomposition
   */
  private suggestDecomposition(task: any, complexity: number, similarCases: any[]) {
    const shouldDecompose = complexity > 0.7;

    if (!shouldDecompose) {
      return {
        shouldDecompose: false,
        suggestedSubtasks: [],
        executionMode: 'sequential' as const,
      };
    }

    // Heuristic decomposition
    return {
      shouldDecompose: true,
      suggestedSubtasks: [
        {
          name: `Analyze ${task.type}`,
          description: 'Initial analysis phase',
          estimatedComplexity: complexity * 0.3,
          requiredCapabilities: ['analysis'],
        },
        {
          name: `Execute ${task.type}`,
          description: 'Main execution phase',
          estimatedComplexity: complexity * 0.5,
          requiredCapabilities: ['execution'],
        },
        {
          name: `Validate ${task.type}`,
          description: 'Validation phase',
          estimatedComplexity: complexity * 0.2,
          requiredCapabilities: ['validation'],
        },
      ],
      executionMode: 'sequential' as const,
    };
  }

  /**
   * Calculate priority score
   */
  private calculatePriority(task: any, complexity: number): number {
    const priorityMap = {
      critical: 1.0,
      high: 0.75,
      medium: 0.5,
      low: 0.25,
    };

    const basePriority = priorityMap[task.priority as keyof typeof priorityMap] || 0.5;
    return basePriority * (1 + complexity * 0.2);
  }

  /**
   * Recommend routing strategy
   */
  private recommendRoutingStrategy(availableAgents: any[], decomposition: any) {
    if (decomposition?.shouldDecompose) {
      return {
        strategy: 'capability-based' as const,
        reasoning: 'Complex task requires specialized agents for different subtasks',
      };
    }

    if (availableAgents.some((a: any) => a.currentLoad > 80)) {
      return {
        strategy: 'least-loaded' as const,
        reasoning: 'Some agents are heavily loaded, balance workload',
      };
    }

    return {
      strategy: 'round-robin' as const,
      reasoning: 'Simple task, distribute evenly',
    };
  }

  /**
   * Update statistics
   */
  private updateStats(systemType: SystemType, success: boolean, timer: any) {
    this.stats.totalRequests++;

    if (success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }

    // Update by system type
    if (!this.stats.bySystemType.has(systemType)) {
      this.stats.bySystemType.set(systemType, {
        requests: 0,
        successRate: 0,
        avgResponseTime: 0,
      });
    }

    const typeStats = this.stats.bySystemType.get(systemType)!;
    typeStats.requests++;
    typeStats.successRate = typeStats.requests > 0
      ? (success ? 1 : 0) / typeStats.requests
      : 0;
  }

  /**
   * Get bridge statistics
   */
  getStatistics(): BridgeStatistics {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.metrics.export();
  }
}
