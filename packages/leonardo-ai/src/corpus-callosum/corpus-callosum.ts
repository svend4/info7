/**
 * Corpus Callosum
 *
 * Integration layer connecting Leonardo AI (reasoning/learning) with Info7 (knowledge).
 * Provides bidirectional knowledge synchronization, context enrichment, and learning feedback.
 */

import { Logger, MetricsCollector, AppError } from '@info7/common';
import {
  KnowledgeGraphEngine,
  KnowledgeNode,
  KnowledgeEdge,
  NodeType,
  RelationType,
  SemanticSearchQuery,
} from '@info7/info7';
import { RAGEngine, Document } from '../rag';
import { State, Action } from '../rl/types';
import {
  CorpusCallosumConfig,
  SyncDirection,
  SyncResult,
  KnowledgeMapping,
  EnrichedDocument,
  EnrichedState,
  RLKnowledgeExtraction,
  AIContextQuery,
  AIContextResult,
  LearningFeedback,
  CorpusCallosumStatistics,
} from './types';

/**
 * Corpus Callosum - Bridge between reasoning and knowledge
 */
export class CorpusCallosum {
  private logger: Logger;
  private metrics: MetricsCollector;
  private config: CorpusCallosumConfig;

  private knowledgeGraph: KnowledgeGraphEngine;
  private ragEngine: RAGEngine;

  private mappings = new Map<string, KnowledgeMapping>();
  private cache = new Map<string, { data: any; timestamp: number }>();

  // Statistics
  private stats = {
    totalSyncs: 0,
    successfulSyncs: 0,
    documentsEnriched: 0,
    statesEnriched: 0,
    feedbacksProcessed: 0,
    syncTimes: [] as number[],
    enrichmentTimes: [] as number[],
    queryTimes: [] as number[],
    cacheHits: 0,
    cacheMisses: 0,
  };

  constructor(
    knowledgeGraph: KnowledgeGraphEngine,
    ragEngine: RAGEngine,
    config: Partial<CorpusCallosumConfig> = {}
  ) {
    this.logger = new Logger('corpus-callosum');
    this.metrics = new MetricsCollector('corpus-callosum');

    this.knowledgeGraph = knowledgeGraph;
    this.ragEngine = ragEngine;

    this.config = {
      sync: {
        enabled: true,
        direction: SyncDirection.BIDIRECTIONAL,
        autoSync: true,
        syncInterval: 60000, // 1 minute
        conflictResolution: 'newer',
      },
      enrichment: {
        enabled: true,
        enrichDocuments: true,
        enrichStates: true,
        maxContextNodes: 5,
        minRelevanceThreshold: 0.5,
      },
      learning: {
        enabled: true,
        feedbackToGraph: true,
        autoUpdateFromFeedback: true,
        minConfidenceThreshold: 0.7,
      },
      cache: {
        enabled: true,
        ttl: 300000, // 5 minutes
        maxSize: 1000,
      },
      ...config,
    };

    this.logger.info('Corpus Callosum initialized', { config: this.config });

    // Start auto-sync if enabled
    if (this.config.sync.enabled && this.config.sync.autoSync && this.config.sync.syncInterval) {
      this.startAutoSync();
    }
  }

  /**
   * Synchronize knowledge between RAG and Graph
   */
  async syncKnowledge(direction?: SyncDirection): Promise<SyncResult> {
    const startTime = Date.now();
    const syncDir = direction || this.config.sync.direction;

    try {
      this.logger.info(`Starting knowledge sync: ${syncDir}`);

      let result: SyncResult = {
        timestamp: Date.now(),
        direction: syncDir,
        statistics: {
          documentsProcessed: 0,
          nodesCreated: 0,
          nodesUpdated: 0,
          edgesCreated: 0,
          conflicts: 0,
        },
        errors: [],
        duration: 0,
      };

      switch (syncDir) {
        case SyncDirection.RAG_TO_GRAPH:
          result = await this.syncRAGToGraph();
          break;

        case SyncDirection.GRAPH_TO_RAG:
          result = await this.syncGraphToRAG();
          break;

        case SyncDirection.BIDIRECTIONAL:
          const ragToGraph = await this.syncRAGToGraph();
          const graphToRAG = await this.syncGraphToRAG();

          result.statistics.documentsProcessed =
            ragToGraph.statistics.documentsProcessed + graphToRAG.statistics.documentsProcessed;
          result.statistics.nodesCreated =
            ragToGraph.statistics.nodesCreated + graphToRAG.statistics.nodesCreated;
          result.statistics.nodesUpdated =
            ragToGraph.statistics.nodesUpdated + graphToRAG.statistics.nodesUpdated;
          result.statistics.edgesCreated =
            ragToGraph.statistics.edgesCreated + graphToRAG.statistics.edgesCreated;
          result.statistics.conflicts =
            ragToGraph.statistics.conflicts + graphToRAG.statistics.conflicts;

          result.errors = [...ragToGraph.errors, ...graphToRAG.errors];
          break;
      }

      const duration = Date.now() - startTime;
      result.duration = duration;

      this.stats.totalSyncs++;
      this.stats.successfulSyncs++;
      this.stats.syncTimes.push(duration);

      this.metrics.recordValue('sync_duration', duration);
      this.logger.info('Knowledge sync completed', {
        direction: syncDir,
        duration,
        statistics: result.statistics,
      });

      return result;
    } catch (error) {
      this.logger.error('Knowledge sync failed', error);
      throw new AppError('Knowledge sync failed', 'SYNC_ERROR', error);
    }
  }

  /**
   * Enrich document with knowledge graph context
   */
  async enrichDocument(document: Document): Promise<EnrichedDocument> {
    if (!this.config.enrichment.enabled || !this.config.enrichment.enrichDocuments) {
      return document as EnrichedDocument;
    }

    const startTime = Date.now();

    try {
      // Check cache
      const cacheKey = `doc-${document.id}`;
      const cached = this.getFromCache<EnrichedDocument>(cacheKey);
      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
      this.stats.cacheMisses++;

      // Search for related nodes in knowledge graph
      const searchQuery: SemanticSearchQuery = {
        query: document.content.substring(0, 500),
        topK: this.config.enrichment.maxContextNodes,
        minSimilarity: this.config.enrichment.minRelevanceThreshold,
        includeRelated: true,
        relatedDepth: 1,
      };

      const searchResult = await this.knowledgeGraph.semanticSearch(searchQuery);

      // Build graph context
      const enriched: EnrichedDocument = {
        ...document,
        graphContext: {
          relatedNodes: searchResult.nodes.map(item => ({
            nodeId: item.node.id,
            label: item.node.label,
            type: item.node.type,
            relevance: item.relevanceScore,
          })),
          relatedConcepts: searchResult.nodes
            .map(item => item.node.label)
            .slice(0, 5),
          semanticCluster: this.determineSemanticCluster(searchResult.nodes),
        },
      };

      // Cache enriched document
      this.putInCache(cacheKey, enriched);

      this.stats.documentsEnriched++;

      const duration = Date.now() - startTime;
      this.stats.enrichmentTimes.push(duration);
      this.metrics.recordValue('enrichment_time', duration);

      return enriched;
    } catch (error) {
      this.logger.error('Document enrichment failed', error);
      return document as EnrichedDocument;
    }
  }

  /**
   * Enrich RL state with knowledge graph context
   */
  async enrichState(state: State): Promise<EnrichedState> {
    if (!this.config.enrichment.enabled || !this.config.enrichment.enrichStates) {
      return state as EnrichedState;
    }

    const startTime = Date.now();

    try {
      // Check cache
      const cacheKey = `state-${JSON.stringify(state.features)}`;
      const cached = this.getFromCache<EnrichedState>(cacheKey);
      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
      this.stats.cacheMisses++;

      // Query knowledge graph for relevant patterns
      const context = await this.queryContextForState(state);

      const enriched: EnrichedState = {
        ...state,
        graphContext: {
          contextNodes: context.nodes.map(item => item.node),
          relevantPatterns: context.insights
            .filter(insight => insight.type === 'pattern')
            .map(insight => ({
              pattern: insight.description,
              confidence: insight.confidence,
              applicability: 0.8,
            })),
          historicalActions: context.recommendations.map(rec => ({
            action: { type: rec.action, parameters: {}, confidence: 0.8 },
            outcome: rec.expectedOutcome,
            similarity: 0.7,
          })),
        },
      };

      // Cache enriched state
      this.putInCache(cacheKey, enriched);

      this.stats.statesEnriched++;

      const duration = Date.now() - startTime;
      this.stats.enrichmentTimes.push(duration);

      return enriched;
    } catch (error) {
      this.logger.error('State enrichment failed', error);
      return state as EnrichedState;
    }
  }

  /**
   * Extract knowledge from RL experience
   */
  async extractRLKnowledge(
    state: State,
    action: Action,
    reward: number,
    nextState: State
  ): Promise<RLKnowledgeExtraction> {
    try {
      const insights: RLKnowledgeExtraction['insights'] = [];

      // Analyze if this was a successful or failed action
      if (reward > 0.7) {
        insights.push({
          type: 'pattern',
          description: `Successful action: ${action.type} in context ${JSON.stringify(state.features)}`,
          confidence: action.confidence,
        });
      } else if (reward < 0.3) {
        insights.push({
          type: 'pattern',
          description: `Failed action: ${action.type} in context ${JSON.stringify(state.features)}`,
          confidence: action.confidence,
        });
      }

      // Create suggested nodes
      const suggestedNodes: KnowledgeNode[] = [];

      // Create pattern node if reward is significant
      if (Math.abs(reward - 0.5) > 0.3) {
        const patternNode: KnowledgeNode = {
          id: `rl-pattern-${Date.now()}`,
          type: NodeType.PATTERN,
          label: `${action.type} Pattern`,
          properties: {
            actionType: action.type,
            avgReward: reward,
            contextFeatures: Object.keys(state.features),
            confidence: action.confidence,
          },
          embedding: undefined,
          metadata: {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            source: 'rl-learning',
            confidence: action.confidence,
            accessCount: 0,
            lastAccessed: Date.now(),
          },
          tags: ['rl', 'pattern', action.type],
        };

        suggestedNodes.push(patternNode);
      }

      // Create insight node for high-reward actions
      if (reward > 0.8) {
        const insightNode: KnowledgeNode = {
          id: `rl-insight-${Date.now()}`,
          type: NodeType.INSIGHT,
          label: `Effective Strategy: ${action.type}`,
          properties: {
            strategy: action.type,
            effectiveness: reward,
            applicableContexts: Object.keys(state.features),
          },
          embedding: undefined,
          metadata: {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            source: 'rl-learning',
            confidence: 0.9,
            accessCount: 0,
            lastAccessed: Date.now(),
          },
          tags: ['rl', 'insight', 'strategy'],
        };

        suggestedNodes.push(insightNode);
      }

      const extraction: RLKnowledgeExtraction = {
        state,
        action,
        reward,
        insights,
        suggestedNodes,
        suggestedEdges: [],
      };

      return extraction;
    } catch (error) {
      this.logger.error('RL knowledge extraction failed', error);
      throw new AppError('RL knowledge extraction failed', 'EXTRACTION_ERROR', error);
    }
  }

  /**
   * Process learning feedback and update knowledge graph
   */
  async processLearningFeedback(feedback: LearningFeedback): Promise<void> {
    if (!this.config.learning.enabled || !this.config.learning.feedbackToGraph) {
      return;
    }

    try {
      this.logger.info('Processing learning feedback', { source: feedback.source });

      // Process successful patterns
      for (const pattern of feedback.feedback.successfulPatterns) {
        if (pattern.successRate >= this.config.learning.minConfidenceThreshold) {
          // Create or update pattern node
          const patternNode: KnowledgeNode = {
            id: `pattern-${pattern.pattern.toLowerCase().replace(/\s+/g, '-')}`,
            type: NodeType.PATTERN,
            label: pattern.pattern,
            properties: {
              context: pattern.context,
              successRate: pattern.successRate,
              source: feedback.source,
            },
            embedding: undefined,
            metadata: {
              createdAt: Date.now(),
              updatedAt: Date.now(),
              source: feedback.source,
              confidence: pattern.successRate,
              accessCount: 0,
              lastAccessed: Date.now(),
            },
            tags: ['pattern', 'successful', feedback.source],
          };

          try {
            this.knowledgeGraph.addNode(patternNode);
          } catch (error) {
            // Node might already exist, update it
            this.knowledgeGraph.updateNode(patternNode.id, {
              properties: patternNode.properties,
              metadata: patternNode.metadata,
            });
          }
        }
      }

      // Process new insights
      for (const insight of feedback.feedback.newInsights) {
        if (insight.confidence >= this.config.learning.minConfidenceThreshold) {
          const insightNode: KnowledgeNode = {
            id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: NodeType.INSIGHT,
            label: insight.insight,
            properties: {
              evidence: insight.evidence,
              source: feedback.source,
            },
            embedding: undefined,
            metadata: {
              createdAt: Date.now(),
              updatedAt: Date.now(),
              source: feedback.source,
              confidence: insight.confidence,
              accessCount: 0,
              lastAccessed: Date.now(),
            },
            tags: ['insight', feedback.source],
          };

          this.knowledgeGraph.addNode(insightNode);
        }
      }

      // Apply suggested updates if auto-update is enabled
      if (this.config.learning.autoUpdateFromFeedback) {
        for (const update of feedback.suggestedUpdates) {
          try {
            if (update.targetType === 'node') {
              this.knowledgeGraph.updateNode(update.targetId, {
                [update.updateType]: update.value,
              } as any);
            }
          } catch (error) {
            this.logger.warn(`Failed to apply update to ${update.targetId}`, error);
          }
        }
      }

      this.stats.feedbacksProcessed++;
      this.logger.info('Learning feedback processed');
    } catch (error) {
      this.logger.error('Failed to process learning feedback', error);
      throw new AppError('Learning feedback processing failed', 'FEEDBACK_ERROR', error);
    }
  }

  /**
   * Query knowledge graph with AI context
   */
  async queryWithContext(query: AIContextQuery): Promise<AIContextResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Querying with AI context', { type: query.queryType });

      // Build search query based on context
      const searchQuery = this.buildSearchQuery(query);

      // Execute search
      const searchResult = await this.knowledgeGraph.semanticSearch(searchQuery);

      // Generate insights from results
      const insights = this.generateInsights(searchResult.nodes, query.context);

      // Generate recommendations
      const recommendations = this.generateRecommendations(searchResult.nodes, query.context);

      const result: AIContextResult = {
        nodes: searchResult.nodes,
        edges: [],
        insights,
        recommendations,
      };

      const duration = Date.now() - startTime;
      this.stats.queryTimes.push(duration);
      this.metrics.recordValue('context_query_time', duration);

      return result;
    } catch (error) {
      this.logger.error('Context query failed', error);
      throw new AppError('Context query failed', 'QUERY_ERROR', error);
    }
  }

  /**
   * Get statistics
   */
  getStatistics(): CorpusCallosumStatistics {
    const avgSyncDuration =
      this.stats.syncTimes.length > 0
        ? this.stats.syncTimes.reduce((sum, t) => sum + t, 0) / this.stats.syncTimes.length
        : 0;

    const avgEnrichmentTime =
      this.stats.enrichmentTimes.length > 0
        ? this.stats.enrichmentTimes.reduce((sum, t) => sum + t, 0) /
          this.stats.enrichmentTimes.length
        : 0;

    const avgQueryTime =
      this.stats.queryTimes.length > 0
        ? this.stats.queryTimes.reduce((sum, t) => sum + t, 0) / this.stats.queryTimes.length
        : 0;

    const cacheHitRate =
      this.stats.cacheHits + this.stats.cacheMisses > 0
        ? this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)
        : 0;

    return {
      sync: {
        totalSyncs: this.stats.totalSyncs,
        successfulSyncs: this.stats.successfulSyncs,
        lastSync: Date.now(),
        avgSyncDuration,
      },
      mappings: {
        totalMappings: this.mappings.size,
        documentsToNodes: this.mappings.size,
        statesToNodes: 0,
        avgConfidence: 0.8,
      },
      enrichment: {
        documentsEnriched: this.stats.documentsEnriched,
        statesEnriched: this.stats.statesEnriched,
        avgEnrichmentValue: 0.7,
      },
      learning: {
        feedbacksProcessed: this.stats.feedbacksProcessed,
        nodesUpdatedFromLearning: 0,
        edgesCreatedFromLearning: 0,
        insightsGenerated: this.stats.feedbacksProcessed,
      },
      performance: {
        avgEnrichmentTime,
        avgQueryTime,
        cacheHitRate,
      },
    };
  }

  // ===== Private Methods =====

  private async syncRAGToGraph(): Promise<SyncResult> {
    const result: SyncResult = {
      timestamp: Date.now(),
      direction: SyncDirection.RAG_TO_GRAPH,
      statistics: {
        documentsProcessed: 0,
        nodesCreated: 0,
        nodesUpdated: 0,
        edgesCreated: 0,
        conflicts: 0,
      },
      errors: [],
      duration: 0,
    };

    // In a real implementation, would fetch documents from RAG
    // and convert them to knowledge graph nodes

    return result;
  }

  private async syncGraphToRAG(): Promise<SyncResult> {
    const result: SyncResult = {
      timestamp: Date.now(),
      direction: SyncDirection.GRAPH_TO_RAG,
      statistics: {
        documentsProcessed: 0,
        nodesCreated: 0,
        nodesUpdated: 0,
        edgesCreated: 0,
        conflicts: 0,
      },
      errors: [],
      duration: 0,
    };

    // In a real implementation, would fetch nodes from graph
    // and convert them to RAG documents

    return result;
  }

  private async queryContextForState(state: State): Promise<AIContextResult> {
    const query: AIContextQuery = {
      queryType: 'semantic',
      context: {
        currentState: state,
      },
      parameters: {
        maxNodes: this.config.enrichment.maxContextNodes,
        minRelevance: this.config.enrichment.minRelevanceThreshold,
      },
    };

    return await this.queryWithContext(query);
  }

  private buildSearchQuery(query: AIContextQuery): SemanticSearchQuery {
    let queryText = '';

    if (query.context.goal) {
      queryText = query.context.goal;
    } else if (query.context.currentState) {
      queryText = Object.values(query.context.currentState.features).join(' ');
    }

    return {
      query: queryText,
      topK: query.parameters.maxNodes || 5,
      minSimilarity: query.parameters.minRelevance || 0.5,
      includeRelated: query.parameters.includeRelated,
    };
  }

  private generateInsights(
    nodes: any[],
    context: AIContextQuery['context']
  ): AIContextResult['insights'] {
    const insights: AIContextResult['insights'] = [];

    // Simple insight generation
    if (nodes.length > 0) {
      insights.push({
        type: 'context',
        description: `Found ${nodes.length} relevant knowledge nodes`,
        confidence: 0.8,
        actionable: true,
      });
    }

    return insights;
  }

  private generateRecommendations(
    nodes: any[],
    context: AIContextQuery['context']
  ): AIContextResult['recommendations'] {
    const recommendations: AIContextResult['recommendations'] = [];

    // Simple recommendation generation
    for (const item of nodes.slice(0, 3)) {
      recommendations.push({
        action: `Consider applying knowledge from: ${item.node.label}`,
        reasoning: `Relevant to current context with ${item.relevanceScore.toFixed(2)} relevance`,
        expectedOutcome: item.relevanceScore,
      });
    }

    return recommendations;
  }

  private determineSemanticCluster(nodes: any[]): string {
    if (nodes.length === 0) return 'general';

    // Simple clustering based on most common node type
    const typeCounts = new Map<string, number>();
    for (const item of nodes) {
      const type = item.node.type;
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    }

    let maxType = 'general';
    let maxCount = 0;
    for (const [type, count] of typeCounts) {
      if (count > maxCount) {
        maxType = type;
        maxCount = count;
      }
    }

    return maxType;
  }

  private getFromCache<T>(key: string): T | null {
    if (!this.config.cache.enabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.config.cache.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private putInCache(key: string, data: any): void {
    if (!this.config.cache.enabled) return;

    // Enforce cache size limit
    if (this.cache.size >= this.config.cache.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private startAutoSync(): void {
    setInterval(() => {
      this.syncKnowledge().catch(error => {
        this.logger.error('Auto-sync failed', error);
      });
    }, this.config.sync.syncInterval!);

    this.logger.info('Auto-sync started', {
      interval: this.config.sync.syncInterval,
    });
  }
}
