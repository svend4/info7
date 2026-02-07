/**
 * Leonardo AI - Common Utilities Integration Example
 *
 * Demonstrates integration of @info7/common utilities:
 * - Logger: Structured logging for RL and RAG operations
 * - MetricsCollector: Performance tracking for training and inference
 * - AppError: Standardized error handling
 * - ConfigManager: Configuration management
 * - HealthCheckManager: System health monitoring
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

import { LeonardoRLEngine } from './rl/leonardo-rl-engine';
import { RAGEngine } from './rag/rag-engine';
import { State, Action, ActionType } from './rl/types';
import { Document } from './rag/types';

/**
 * Leonardo AI Service with Common Utilities Integration
 */
export class LeonardoAIService {
  private logger: Logger;
  private metrics: MetricsCollector;
  private config: ConfigManager;
  private health: HealthCheckManager;
  private rlEngine: LeonardoRLEngine;
  private ragEngine: RAGEngine;

  constructor() {
    // Initialize common utilities
    this.logger = new Logger({
      level: 'info',
      context: { service: 'leonardo-ai' },
    });

    this.metrics = new MetricsCollector();
    this.config = new ConfigManager();
    this.health = new HealthCheckManager({ version: '2.0.0' });

    this.logger.info('Leonardo AI Service initializing');

    // Initialize RL and RAG engines (simplified for demo)
    this.rlEngine = new LeonardoRLEngine({
      learningRate: this.config.getNumber('RL_LEARNING_RATE', 0.001),
      discountFactor: this.config.getNumber('RL_DISCOUNT_FACTOR', 0.99),
      batchSize: this.config.getNumber('RL_BATCH_SIZE', 32),
      memorySize: this.config.getNumber('RL_MEMORY_SIZE', 10000),
      updateFrequency: this.config.getNumber('RL_UPDATE_FREQUENCY', 4),
      targetUpdateFrequency: this.config.getNumber('RL_TARGET_UPDATE_FREQUENCY', 100),
      explorationStrategy: 'epsilon-greedy',
      initialExploration: 1.0,
      minExploration: 0.1,
      explorationDecay: 0.995,
    });

    this.ragEngine = new RAGEngine({
      pineconeApiKey: this.config.get('PINECONE_API_KEY'),
      pineconeEnvironment: this.config.get('PINECONE_ENVIRONMENT'),
      indexName: this.config.get('PINECONE_INDEX_NAME', 'leonardo-knowledge'),
      embeddingModel: this.config.get('EMBEDDING_MODEL', 'text-embedding-ada-002'),
      chunkSize: this.config.getNumber('CHUNK_SIZE', 500),
      chunkOverlap: this.config.getNumber('CHUNK_OVERLAP', 50),
      topK: this.config.getNumber('RAG_TOP_K', 5),
      minRelevanceScore: this.config.getNumber('RAG_MIN_RELEVANCE', 0.7),
    });

    // Register health checks
    this.registerHealthChecks();

    this.logger.info('Leonardo AI Service initialized successfully');
  }

  /**
   * Register health checks for RL and RAG engines
   */
  private registerHealthChecks(): void {
    // RL Engine health check
    this.health.registerCheck('rl-engine', async () => {
      try {
        const stats = this.rlEngine.getStatistics();
        const isHealthy = stats.totalSteps >= 0 && stats.averageReward !== null;

        return {
          status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
          message: isHealthy ? 'RL engine operational' : 'RL engine degraded',
          metadata: {
            totalSteps: stats.totalSteps,
            averageReward: stats.averageReward,
            explorationRate: stats.explorationRate,
          },
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'RL engine check failed',
        };
      }
    });

    // RAG Engine health check
    this.health.registerCheck('rag-engine', async () => {
      try {
        const stats = this.ragEngine.getStatistics();
        const isHealthy = stats.totalDocuments >= 0;

        return {
          status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
          message: isHealthy ? 'RAG engine operational' : 'RAG engine degraded',
          metadata: {
            totalDocuments: stats.totalDocuments,
            totalChunks: stats.totalChunks,
            totalQueries: stats.totalQueries,
            avgRelevanceScore: stats.avgRelevanceScore,
          },
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'RAG engine check failed',
        };
      }
    });

    this.logger.info('Health checks registered');
  }

  /**
   * Select action using RL with logging and metrics
   */
  async selectAction(state: State): Promise<Action> {
    const actionCounter = this.metrics.counter('leonardo.actions.total', {
      task_type: state.task,
    });
    const actionTimer = this.metrics.timer('leonardo.action_selection.duration');

    this.logger.debug('Selecting action', {
      taskComplexity: state.complexity,
      historyLength: state.history.recentActions.length,
    });

    try {
      // Track execution time
      const action = await actionTimer.time(async () => {
        return await this.rlEngine.selectAction(state);
      });

      actionCounter.inc();

      this.logger.info('Action selected', {
        actionType: action.type,
        confidence: action.confidence,
      });

      return action;
    } catch (error) {
      this.logger.error('Failed to select action', error);
      throw new AppError(
        'Action selection failed',
        'RL_ACTION_SELECTION_FAILED',
        500,
        'high',
        { state }
      );
    }
  }

  /**
   * Learn from experience with logging and metrics
   */
  async learn(
    state: State,
    action: Action,
    reward: number,
    nextState: State,
    done: boolean
  ): Promise<void> {
    const learnCounter = this.metrics.counter('leonardo.learning.steps', {
      done: done.toString(),
    });
    const rewardGauge = this.metrics.gauge('leonardo.learning.reward');

    this.logger.debug('Learning from experience', {
      reward,
      done,
      actionType: action.type,
    });

    try {
      await this.metrics.timeExecution(
        'leonardo.learning.duration',
        async () => {
          await this.rlEngine.learn(state, action, reward, nextState, done);
        },
        { action_type: action.type }
      );

      learnCounter.inc();
      rewardGauge.set(reward);

      this.logger.info('Learning step completed', {
        reward,
        explorationRate: this.rlEngine.getStatistics().explorationRate,
      });
    } catch (error) {
      this.logger.error('Learning failed', error);
      throw new AppError(
        'Learning step failed',
        'RL_LEARNING_FAILED',
        500,
        'high',
        { reward, done }
      );
    }
  }

  /**
   * Add document to RAG knowledge base with logging and metrics
   */
  async addDocument(document: Document): Promise<void> {
    if (!document.id || !document.content) {
      throw new ValidationError('Invalid document', {
        id: document.id ? [] : ['Document ID is required'],
        content: document.content ? [] : ['Document content is required'],
      });
    }

    const docCounter = this.metrics.counter('leonardo.rag.documents.added', {
      type: document.metadata?.type || 'unknown',
    });

    this.logger.info('Adding document to knowledge base', {
      documentId: document.id,
      contentLength: document.content.length,
      metadataKeys: document.metadata ? Object.keys(document.metadata).length : 0,
    });

    try {
      await this.metrics.timeExecution(
        'leonardo.rag.document_processing.duration',
        async () => {
          await this.ragEngine.addDocument(document);
        },
        { document_id: document.id }
      );

      docCounter.inc();

      this.logger.info('Document added successfully', {
        documentId: document.id,
      });
    } catch (error) {
      this.logger.error('Failed to add document', error, {
        documentId: document.id,
      });
      throw new AppError(
        'Document addition failed',
        'RAG_DOCUMENT_ADD_FAILED',
        500,
        'medium',
        { documentId: document.id }
      );
    }
  }

  /**
   * Query RAG knowledge base with logging and metrics
   */
  async query(queryText: string, topK: number = 5): Promise<any[]> {
    if (!queryText || queryText.trim().length === 0) {
      throw new ValidationError('Invalid query', {
        queryText: ['Query text cannot be empty'],
      });
    }

    const queryCounter = this.metrics.counter('leonardo.rag.queries.total');
    const resultsHistogram = this.metrics.histogram('leonardo.rag.results.count');

    this.logger.debug('Querying knowledge base', {
      queryLength: queryText.length,
      topK,
    });

    try {
      const results = await this.metrics.timeExecution(
        'leonardo.rag.query.duration',
        async () => {
          return await this.ragEngine.query(queryText, topK);
        }
      );

      queryCounter.inc();
      resultsHistogram.observe(results.length);

      this.logger.info('Query completed', {
        resultsCount: results.length,
        avgRelevance: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      });

      return results;
    } catch (error) {
      this.logger.error('Query failed', error, { queryText });
      throw new AppError(
        'RAG query failed',
        'RAG_QUERY_FAILED',
        500,
        'medium',
        { queryText }
      );
    }
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
   * Get service statistics with both RL and RAG stats
   */
  getStatistics() {
    const rlStats = this.rlEngine.getStatistics();
    const ragStats = this.ragEngine.getStatistics();
    const metrics = this.metrics.export();

    return {
      rl: rlStats,
      rag: ragStats,
      metrics: {
        totalActions: metrics.find(m => m.name === 'leonardo.actions.total')?.value || 0,
        totalLearningSteps: metrics.find(m => m.name === 'leonardo.learning.steps')?.value || 0,
        totalDocuments: metrics.find(m => m.name === 'leonardo.rag.documents.added')?.value || 0,
        totalQueries: metrics.find(m => m.name === 'leonardo.rag.queries.total')?.value || 0,
      },
    };
  }
}

/**
 * Example usage
 */
async function runIntegrationExample() {
  console.log('🤖 Leonardo AI - Common Utilities Integration Example\n');
  console.log('━'.repeat(60));
  console.log();

  // Initialize service
  const leonardoAI = new LeonardoAIService();

  console.log('✅ Service initialized with common utilities\n');

  // Example 1: Action Selection with Metrics
  console.log('Example 1: Action Selection with Logging & Metrics\n');

  const state: State = {
    task: 'legal-contract-analysis',
    complexity: 0.7,
    resources: {
      orchestratorAvailable: true,
      openclawAvailable: true,
      externalAPIsAvailable: ['openai', 'pinecone'],
    },
    history: {
      recentActions: [],
      recentRewards: [],
      successRate: 0,
    },
    userContext: {
      preferredMode: 'thorough',
      timeConstraint: 60000,
      qualityThreshold: 0.9,
    },
    metrics: {
      cpuUsage: 45,
      memoryUsage: 60,
      queueLength: 3,
    },
    timestamp: Date.now(),
  };

  const action = await leonardoAI.selectAction(state);
  console.log(`Selected action: ${action.type}`);
  console.log(`Confidence: ${action.confidence.toFixed(2)}\n`);

  // Example 2: Learning with Metrics
  console.log('Example 2: Learning from Experience\n');

  await leonardoAI.learn(state, action, 0.85, state, false);
  console.log('Learning step completed\n');

  // Example 3: RAG Operations
  console.log('Example 3: RAG Knowledge Base Operations\n');

  const document: Document = {
    id: 'doc-legal-001',
    content: 'This is a sample legal contract for demonstration purposes. It includes clauses about confidentiality, payment terms, and termination conditions.',
    metadata: {
      type: 'legal-contract',
      category: 'NDA',
      source: 'template-library',
      createdAt: Date.now(),
    },
  };

  await leonardoAI.addDocument(document);
  console.log('Document added to knowledge base\n');

  const queryResults = await leonardoAI.query('confidentiality clause', 3);
  console.log(`Query returned ${queryResults.length} results\n`);

  // Example 4: Health Check
  console.log('Example 4: System Health Check\n');

  const health = await leonardoAI.getHealthStatus();
  console.log(`Overall Status: ${health.status}`);
  console.log(`Uptime: ${(health.uptime / 1000).toFixed(2)}s`);
  console.log('\nComponent Health:');
  for (const [name, component] of Object.entries(health.components)) {
    console.log(`  • ${name}: ${component.status} - ${component.message}`);
  }
  console.log();

  // Example 5: Performance Metrics
  console.log('Example 5: Performance Metrics\n');

  const stats = leonardoAI.getStatistics();
  console.log('RL Engine:');
  console.log(`  Total Steps: ${stats.rl.totalSteps}`);
  console.log(`  Average Reward: ${stats.rl.averageReward?.toFixed(3) || 'N/A'}`);
  console.log(`  Exploration Rate: ${stats.rl.explorationRate.toFixed(3)}`);
  console.log();

  console.log('RAG Engine:');
  console.log(`  Total Documents: ${stats.rag.totalDocuments}`);
  console.log(`  Total Chunks: ${stats.rag.totalChunks}`);
  console.log(`  Total Queries: ${stats.rag.totalQueries}`);
  console.log();

  console.log('Service Metrics:');
  console.log(`  Total Actions: ${stats.metrics.totalActions}`);
  console.log(`  Learning Steps: ${stats.metrics.totalLearningSteps}`);
  console.log(`  Documents Added: ${stats.metrics.totalDocuments}`);
  console.log(`  Queries Executed: ${stats.metrics.totalQueries}`);
  console.log();

  console.log('━'.repeat(60));
  console.log('✅ Integration example completed!\n');
}

// Run example if executed directly
if (require.main === module) {
  runIntegrationExample().catch(console.error);
}

export { runIntegrationExample };
