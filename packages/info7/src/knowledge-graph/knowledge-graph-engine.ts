/**
 * Knowledge Graph Engine
 *
 * Core engine for semantic knowledge representation and intelligent querying.
 */

import { Logger, MetricsCollector, AppError } from '@info7/common';
import {
  KnowledgeGraphConfig,
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeEdge,
  NodeType,
  RelationType,
  GraphQuery,
  GraphQueryResult,
  SemanticSearchQuery,
  SemanticSearchResult,
  GraphAnalytics,
  UpdateEvent,
  GraphStatistics,
  KnowledgeExtraction,
} from './types';

/**
 * Knowledge Graph Engine - manages semantic knowledge graph
 */
export class KnowledgeGraphEngine {
  private logger: Logger;
  private metrics: MetricsCollector;
  private config: KnowledgeGraphConfig;

  private graph: KnowledgeGraph;
  private updateEvents: UpdateEvent[] = [];
  private queryCache = new Map<string, GraphQueryResult>();

  // Statistics
  private stats = {
    totalQueries: 0,
    totalSearches: 0,
    totalUpdates: 0,
    queryTimes: [] as number[],
  };

  constructor(config: Partial<KnowledgeGraphConfig> = {}) {
    this.logger = new Logger('knowledge-graph');
    this.metrics = new MetricsCollector('knowledge-graph');

    this.config = {
      enableEmbeddings: true,
      embeddingDimension: 384,
      enableAutoUpdate: false,
      cacheEnabled: true,
      cacheSize: 100,
      persistenceEnabled: false,
      ...config,
    };

    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      indexes: {
        byType: new Map(),
        byTag: new Map(),
        byLabel: new Map(),
      },
      statistics: {
        nodeCount: 0,
        edgeCount: 0,
        avgDegree: 0,
        density: 0,
      },
    };

    this.logger.info('Knowledge Graph Engine initialized', { config: this.config });
  }

  /**
   * Add node to graph
   */
  addNode(node: KnowledgeNode): void {
    try {
      // Check if node exists
      if (this.graph.nodes.has(node.id)) {
        throw new AppError('Node already exists', 'NODE_EXISTS');
      }

      // Add to main storage
      this.graph.nodes.set(node.id, node);

      // Update indexes
      this.updateIndexesForNode(node, 'add');

      // Update statistics
      this.graph.statistics.nodeCount++;
      this.updateGraphStatistics();

      // Emit event
      this.emitUpdateEvent({
        id: `event-${Date.now()}`,
        timestamp: Date.now(),
        type: 'node-added',
        nodeIds: [node.id],
        source: node.metadata.source,
        metadata: {},
      });

      this.logger.debug(`Node added: ${node.id}`);
    } catch (error) {
      this.logger.error('Failed to add node', error);
      throw new AppError('Failed to add node', 'ADD_NODE_ERROR', error);
    }
  }

  /**
   * Update node in graph
   */
  updateNode(nodeId: string, updates: Partial<KnowledgeNode>): void {
    try {
      const node = this.graph.nodes.get(nodeId);
      if (!node) {
        throw new AppError('Node not found', 'NODE_NOT_FOUND');
      }

      // Remove from old indexes
      this.updateIndexesForNode(node, 'remove');

      // Apply updates
      const updatedNode = {
        ...node,
        ...updates,
        metadata: {
          ...node.metadata,
          updatedAt: Date.now(),
        },
      };

      // Update main storage
      this.graph.nodes.set(nodeId, updatedNode);

      // Update new indexes
      this.updateIndexesForNode(updatedNode, 'add');

      // Emit event
      this.emitUpdateEvent({
        id: `event-${Date.now()}`,
        timestamp: Date.now(),
        type: 'node-updated',
        nodeIds: [nodeId],
        source: 'manual',
        metadata: { updates },
      });

      this.stats.totalUpdates++;
      this.logger.debug(`Node updated: ${nodeId}`);
    } catch (error) {
      this.logger.error('Failed to update node', error);
      throw new AppError('Failed to update node', 'UPDATE_NODE_ERROR', error);
    }
  }

  /**
   * Remove node from graph
   */
  removeNode(nodeId: string): void {
    try {
      const node = this.graph.nodes.get(nodeId);
      if (!node) {
        throw new AppError('Node not found', 'NODE_NOT_FOUND');
      }

      // Remove from indexes
      this.updateIndexesForNode(node, 'remove');

      // Remove associated edges
      const edgesToRemove: string[] = [];
      for (const [edgeId, edge] of this.graph.edges) {
        if (edge.sourceId === nodeId || edge.targetId === nodeId) {
          edgesToRemove.push(edgeId);
        }
      }

      for (const edgeId of edgesToRemove) {
        this.removeEdge(edgeId);
      }

      // Remove from main storage
      this.graph.nodes.delete(nodeId);

      // Update statistics
      this.graph.statistics.nodeCount--;
      this.updateGraphStatistics();

      // Emit event
      this.emitUpdateEvent({
        id: `event-${Date.now()}`,
        timestamp: Date.now(),
        type: 'node-removed',
        nodeIds: [nodeId],
        source: 'manual',
        metadata: {},
      });

      this.logger.debug(`Node removed: ${nodeId}`);
    } catch (error) {
      this.logger.error('Failed to remove node', error);
      throw new AppError('Failed to remove node', 'REMOVE_NODE_ERROR', error);
    }
  }

  /**
   * Add edge to graph
   */
  addEdge(edge: KnowledgeEdge): void {
    try {
      // Validate nodes exist
      if (!this.graph.nodes.has(edge.sourceId)) {
        throw new AppError('Source node not found', 'SOURCE_NOT_FOUND');
      }
      if (!this.graph.nodes.has(edge.targetId)) {
        throw new AppError('Target node not found', 'TARGET_NOT_FOUND');
      }

      // Add to main storage
      this.graph.edges.set(edge.id, edge);

      // Update statistics
      this.graph.statistics.edgeCount++;
      this.updateGraphStatistics();

      // Emit event
      this.emitUpdateEvent({
        id: `event-${Date.now()}`,
        timestamp: Date.now(),
        type: 'edge-added',
        edgeIds: [edge.id],
        source: edge.metadata.source,
        metadata: {},
      });

      this.logger.debug(`Edge added: ${edge.id}`);
    } catch (error) {
      this.logger.error('Failed to add edge', error);
      throw new AppError('Failed to add edge', 'ADD_EDGE_ERROR', error);
    }
  }

  /**
   * Remove edge from graph
   */
  removeEdge(edgeId: string): void {
    try {
      const edge = this.graph.edges.get(edgeId);
      if (!edge) {
        throw new AppError('Edge not found', 'EDGE_NOT_FOUND');
      }

      this.graph.edges.delete(edgeId);

      // Update statistics
      this.graph.statistics.edgeCount--;
      this.updateGraphStatistics();

      // Emit event
      this.emitUpdateEvent({
        id: `event-${Date.now()}`,
        timestamp: Date.now(),
        type: 'edge-removed',
        edgeIds: [edgeId],
        source: 'manual',
        metadata: {},
      });

      this.logger.debug(`Edge removed: ${edgeId}`);
    } catch (error) {
      this.logger.error('Failed to remove edge', error);
      throw new AppError('Failed to remove edge', 'REMOVE_EDGE_ERROR', error);
    }
  }

  /**
   * Query graph
   */
  async query(query: GraphQuery): Promise<GraphQueryResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Executing graph query');

      // Check cache
      const cacheKey = JSON.stringify(query);
      if (this.config.cacheEnabled && this.queryCache.has(cacheKey)) {
        this.logger.debug('Query result found in cache');
        return this.queryCache.get(cacheKey)!;
      }

      // Find starting nodes
      let candidateNodes = new Set<string>();

      if (query.startNodes) {
        candidateNodes = new Set(query.startNodes);
      } else {
        // Start from all nodes matching filters
        candidateNodes = new Set(this.graph.nodes.keys());
      }

      // Apply node type filter
      if (query.nodeTypes) {
        const typeNodes = new Set<string>();
        for (const type of query.nodeTypes) {
          const nodesOfType = this.graph.indexes.byType.get(type) || new Set();
          for (const nodeId of nodesOfType) {
            typeNodes.add(nodeId);
          }
        }
        candidateNodes = new Set([...candidateNodes].filter(id => typeNodes.has(id)));
      }

      // Apply node filters
      if (query.filters?.nodeFilters) {
        candidateNodes = this.applyNodeFilters(candidateNodes, query.filters.nodeFilters);
      }

      // Perform traversal if requested
      let resultNodes = new Set(candidateNodes);
      let resultEdges = new Set<string>();
      let paths: GraphQueryResult['paths'] = [];

      if (query.traversal) {
        const traversalResult = this.traverse(
          candidateNodes,
          query.traversal.maxDepth || 1,
          query.traversal.direction || 'both',
          query.edgeTypes,
          query.filters?.edgeFilters
        );

        resultNodes = traversalResult.nodes;
        resultEdges = traversalResult.edges;

        if (query.traversal.pathType) {
          paths = this.findPaths(
            candidateNodes,
            resultNodes,
            query.traversal.pathType
          );
        }
      }

      // Apply pagination
      const nodeArray = Array.from(resultNodes)
        .slice(query.offset || 0, (query.offset || 0) + (query.limit || Infinity))
        .map(id => this.graph.nodes.get(id)!)
        .filter(n => n !== undefined);

      const edgeArray = Array.from(resultEdges)
        .map(id => this.graph.edges.get(id)!)
        .filter(e => e !== undefined);

      const result: GraphQueryResult = {
        nodes: nodeArray,
        edges: edgeArray,
        paths: paths.length > 0 ? paths : undefined,
        statistics: {
          nodesFound: nodeArray.length,
          edgesFound: edgeArray.length,
          pathsFound: paths.length,
          queryTime: Date.now() - startTime,
        },
      };

      // Cache result
      if (this.config.cacheEnabled) {
        this.queryCache.set(cacheKey, result);
        if (this.queryCache.size > this.config.cacheSize) {
          const firstKey = this.queryCache.keys().next().value;
          this.queryCache.delete(firstKey);
        }
      }

      this.stats.totalQueries++;
      this.stats.queryTimes.push(result.statistics.queryTime);

      const duration = Date.now() - startTime;
      this.metrics.recordValue('query_time', duration);
      this.logger.info('Query completed', {
        nodesFound: result.nodes.length,
        edgesFound: result.edges.length,
        duration
      });

      return result;
    } catch (error) {
      this.logger.error('Query failed', error);
      throw new AppError('Graph query failed', 'QUERY_ERROR', error);
    }
  }

  /**
   * Semantic search
   */
  async semanticSearch(query: SemanticSearchQuery): Promise<SemanticSearchResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Executing semantic search', { query: query.query });

      // Generate query embedding
      const queryEmbedding = this.generateEmbedding(query.query);

      // Find candidate nodes
      let candidateNodes = Array.from(this.graph.nodes.values());

      // Filter by type
      if (query.nodeTypes) {
        candidateNodes = candidateNodes.filter(node =>
          query.nodeTypes!.includes(node.type)
        );
      }

      // Apply additional filters
      if (query.filters?.nodeFilters) {
        const candidateSet = new Set(candidateNodes.map(n => n.id));
        const filtered = this.applyNodeFilters(candidateSet, query.filters.nodeFilters);
        candidateNodes = candidateNodes.filter(n => filtered.has(n.id));
      }

      // Calculate similarity scores
      const results = candidateNodes
        .map(node => {
          const similarity = this.calculateSimilarity(queryEmbedding, node);
          const relevanceScore = this.calculateRelevance(query.query, node);
          const matchedProperties = this.getMatchedProperties(query.query, node);

          return {
            node,
            similarity,
            relevanceScore,
            matchedProperties,
          };
        })
        .filter(result => result.similarity >= (query.minSimilarity || 0))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, query.topK || 10);

      // Include related nodes if requested
      let relatedNodes: KnowledgeNode[] = [];
      if (query.includeRelated && results.length > 0) {
        const depth = query.relatedDepth || 1;
        const topResultIds = new Set(results.slice(0, 3).map(r => r.node.id));
        const traversal = this.traverse(topResultIds, depth, 'both');
        relatedNodes = Array.from(traversal.nodes)
          .filter(id => !topResultIds.has(id))
          .map(id => this.graph.nodes.get(id)!)
          .filter(n => n !== undefined)
          .slice(0, 5);
      }

      // Generate suggestions
      const suggestions = this.generateSearchSuggestions(query.query, results);

      const avgSimilarity = results.length > 0
        ? results.reduce((sum, r) => sum + r.similarity, 0) / results.length
        : 0;

      const result: SemanticSearchResult = {
        nodes: results,
        relatedNodes: relatedNodes.length > 0 ? relatedNodes : undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        statistics: {
          totalResults: results.length,
          searchTime: Date.now() - startTime,
          avgSimilarity,
        },
      };

      this.stats.totalSearches++;

      const duration = Date.now() - startTime;
      this.metrics.recordValue('search_time', duration);
      this.logger.info('Semantic search completed', {
        resultsFound: results.length,
        avgSimilarity: avgSimilarity.toFixed(3),
        duration
      });

      return result;
    } catch (error) {
      this.logger.error('Semantic search failed', error);
      throw new AppError('Semantic search failed', 'SEARCH_ERROR', error);
    }
  }

  /**
   * Extract knowledge from text
   */
  async extractKnowledge(text: string, source: string): Promise<KnowledgeExtraction> {
    try {
      this.logger.info('Extracting knowledge from text');

      const nodes: KnowledgeNode[] = [];
      const edges: KnowledgeEdge[] = [];

      // Simple extraction logic - identify concepts, entities, patterns
      const sentences = text.split(/[.!?]+/).filter(s => s.trim());

      for (const sentence of sentences) {
        const words = sentence.trim().split(/\s+/);

        // Extract potential concepts (capitalized words, technical terms)
        const concepts = words.filter(w => /^[A-Z]/.test(w) || w.length > 8);

        for (const concept of concepts) {
          const nodeId = `concept-${concept.toLowerCase().replace(/\W/g, '-')}`;

          if (!nodes.find(n => n.id === nodeId)) {
            nodes.push({
              id: nodeId,
              type: NodeType.CONCEPT,
              label: concept,
              properties: {
                description: sentence,
                frequency: 1,
              },
              embedding: this.generateEmbedding(concept),
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                source,
                confidence: 0.7,
                accessCount: 0,
                lastAccessed: Date.now(),
              },
              tags: ['extracted'],
            });
          }
        }
      }

      // Create relationships between co-occurring concepts
      for (let i = 0; i < nodes.length - 1; i++) {
        for (let j = i + 1; j < Math.min(i + 3, nodes.length); j++) {
          edges.push({
            id: `edge-${nodes[i].id}-${nodes[j].id}`,
            sourceId: nodes[i].id,
            targetId: nodes[j].id,
            type: RelationType.RELATED_TO,
            weight: 0.5,
            properties: {},
            metadata: {
              createdAt: Date.now(),
              source,
              confidence: 0.6,
            },
            bidirectional: true,
          });
        }
      }

      this.logger.info('Knowledge extraction completed', {
        nodes: nodes.length,
        edges: edges.length
      });

      return {
        nodes,
        edges,
        confidence: 0.7,
        source,
        extractedAt: Date.now(),
      };
    } catch (error) {
      this.logger.error('Knowledge extraction failed', error);
      throw new AppError('Knowledge extraction failed', 'EXTRACTION_ERROR', error);
    }
  }

  /**
   * Analyze graph
   */
  async analyzeGraph(): Promise<GraphAnalytics> {
    try {
      this.logger.info('Analyzing graph structure');

      // Calculate centrality metrics
      const centrality = this.calculateCentrality();

      // Detect communities
      const communities = this.detectCommunities();

      // Detect patterns
      const patterns = this.detectPatterns();

      return {
        centrality,
        communities,
        patterns,
      };
    } catch (error) {
      this.logger.error('Graph analysis failed', error);
      throw new AppError('Graph analysis failed', 'ANALYSIS_ERROR', error);
    }
  }

  /**
   * Get graph statistics
   */
  getStatistics(): GraphStatistics {
    const nodesByType = new Map<NodeType, number>();
    let totalProperties = 0;
    let withEmbeddings = 0;

    for (const node of this.graph.nodes.values()) {
      nodesByType.set(node.type, (nodesByType.get(node.type) || 0) + 1);
      totalProperties += Object.keys(node.properties).length;
      if (node.embedding) withEmbeddings++;
    }

    const edgesByType = new Map<RelationType, number>();
    let totalWeight = 0;
    let bidirectionalCount = 0;

    for (const edge of this.graph.edges.values()) {
      edgesByType.set(edge.type, (edgesByType.get(edge.type) || 0) + 1);
      totalWeight += edge.weight;
      if (edge.bidirectional) bidirectionalCount++;
    }

    const mostAccessed = Array.from(this.graph.nodes.values())
      .sort((a, b) => b.metadata.accessCount - a.metadata.accessCount)
      .slice(0, 10)
      .map(node => ({
        nodeId: node.id,
        accessCount: node.metadata.accessCount,
      }));

    const avgQueryTime = this.stats.queryTimes.length > 0
      ? this.stats.queryTimes.reduce((sum, t) => sum + t, 0) / this.stats.queryTimes.length
      : 0;

    return {
      nodes: {
        total: this.graph.nodes.size,
        byType: nodesByType,
        avgPropertiesPerNode: this.graph.nodes.size > 0 ? totalProperties / this.graph.nodes.size : 0,
        withEmbeddings,
      },
      edges: {
        total: this.graph.edges.size,
        byType: edgesByType,
        avgWeight: this.graph.edges.size > 0 ? totalWeight / this.graph.edges.size : 0,
        bidirectional: bidirectionalCount,
      },
      graph: {
        avgDegree: this.graph.statistics.avgDegree,
        density: this.graph.statistics.density,
        connectedComponents: this.calculateConnectedComponents(),
        diameter: this.calculateDiameter(),
        avgPathLength: this.calculateAveragePathLength(),
      },
      usage: {
        totalQueries: this.stats.totalQueries,
        totalSearches: this.stats.totalSearches,
        avgQueryTime,
        mostAccessedNodes: mostAccessed,
      },
    };
  }

  // ===== Private Helper Methods =====

  private updateIndexesForNode(node: KnowledgeNode, operation: 'add' | 'remove'): void {
    // Type index
    const typeSet = this.graph.indexes.byType.get(node.type) || new Set();
    if (operation === 'add') {
      typeSet.add(node.id);
    } else {
      typeSet.delete(node.id);
    }
    this.graph.indexes.byType.set(node.type, typeSet);

    // Tag index
    for (const tag of node.tags) {
      const tagSet = this.graph.indexes.byTag.get(tag) || new Set();
      if (operation === 'add') {
        tagSet.add(node.id);
      } else {
        tagSet.delete(node.id);
      }
      this.graph.indexes.byTag.set(tag, tagSet);
    }

    // Label index
    const labelSet = this.graph.indexes.byLabel.get(node.label.toLowerCase()) || new Set();
    if (operation === 'add') {
      labelSet.add(node.id);
    } else {
      labelSet.delete(node.id);
    }
    this.graph.indexes.byLabel.set(node.label.toLowerCase(), labelSet);
  }

  private updateGraphStatistics(): void {
    const nodeCount = this.graph.nodes.size;
    const edgeCount = this.graph.edges.size;

    // Calculate average degree
    const degrees = new Map<string, number>();
    for (const edge of this.graph.edges.values()) {
      degrees.set(edge.sourceId, (degrees.get(edge.sourceId) || 0) + 1);
      degrees.set(edge.targetId, (degrees.get(edge.targetId) || 0) + 1);
    }

    const totalDegree = Array.from(degrees.values()).reduce((sum, d) => sum + d, 0);
    const avgDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;

    // Calculate density
    const maxEdges = nodeCount * (nodeCount - 1) / 2;
    const density = maxEdges > 0 ? edgeCount / maxEdges : 0;

    this.graph.statistics = {
      nodeCount,
      edgeCount,
      avgDegree,
      density,
    };
  }

  private applyNodeFilters(
    nodeIds: Set<string>,
    filters: NonNullable<GraphQuery['filters']>['nodeFilters']
  ): Set<string> {
    const result = new Set<string>();

    for (const nodeId of nodeIds) {
      const node = this.graph.nodes.get(nodeId);
      if (!node) continue;

      let matches = true;
      for (const filter of filters!) {
        const value = node.properties[filter.property];

        if (!this.evaluateFilter(value, filter.operator, filter.value)) {
          matches = false;
          break;
        }
      }

      if (matches) {
        result.add(nodeId);
      }
    }

    return result;
  }

  private evaluateFilter(
    value: any,
    operator: string,
    filterValue: any
  ): boolean {
    switch (operator) {
      case 'eq': return value === filterValue;
      case 'ne': return value !== filterValue;
      case 'gt': return value > filterValue;
      case 'lt': return value < filterValue;
      case 'gte': return value >= filterValue;
      case 'lte': return value <= filterValue;
      case 'contains': return String(value).includes(String(filterValue));
      case 'matches': return new RegExp(filterValue).test(String(value));
      default: return false;
    }
  }

  private traverse(
    startNodes: Set<string>,
    maxDepth: number,
    direction: 'outgoing' | 'incoming' | 'both',
    edgeTypes?: RelationType[],
    edgeFilters?: NonNullable<GraphQuery['filters']>['edgeFilters']
  ): { nodes: Set<string>; edges: Set<string> } {
    const visitedNodes = new Set<string>(startNodes);
    const visitedEdges = new Set<string>();
    const queue: Array<{ nodeId: string; depth: number }> =
      Array.from(startNodes).map(id => ({ nodeId: id, depth: 0 }));

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;

      if (depth >= maxDepth) continue;

      for (const edge of this.graph.edges.values()) {
        // Check direction
        const isOutgoing = edge.sourceId === nodeId;
        const isIncoming = edge.targetId === nodeId;

        if (
          (direction === 'outgoing' && !isOutgoing) ||
          (direction === 'incoming' && !isIncoming) ||
          (direction === 'both' && !isOutgoing && !isIncoming)
        ) {
          continue;
        }

        // Check edge type
        if (edgeTypes && !edgeTypes.includes(edge.type)) {
          continue;
        }

        // Check edge filters
        if (edgeFilters) {
          let matches = true;
          for (const filter of edgeFilters) {
            const value = edge.properties[filter.property];
            if (!this.evaluateFilter(value, filter.operator, filter.value)) {
              matches = false;
              break;
            }
          }
          if (!matches) continue;
        }

        visitedEdges.add(edge.id);

        const nextNodeId = isOutgoing ? edge.targetId : edge.sourceId;
        if (!visitedNodes.has(nextNodeId)) {
          visitedNodes.add(nextNodeId);
          queue.push({ nodeId: nextNodeId, depth: depth + 1 });
        }
      }
    }

    return {
      nodes: visitedNodes,
      edges: visitedEdges,
    };
  }

  private findPaths(
    startNodes: Set<string>,
    endNodes: Set<string>,
    pathType: 'shortest' | 'all' | 'simple'
  ): GraphQueryResult['paths'] {
    // Simplified path finding - just return direct connections
    const paths: GraphQueryResult['paths'] = [];

    for (const startId of startNodes) {
      for (const endId of endNodes) {
        if (startId === endId) continue;

        // Find direct edges
        for (const edge of this.graph.edges.values()) {
          if (edge.sourceId === startId && edge.targetId === endId) {
            paths.push({
              nodes: [startId, endId],
              edges: [edge.id],
              length: 1,
            });
          }
        }
      }
    }

    return paths;
  }

  private generateEmbedding(text: string): number[] {
    // Simple embedding generation - in production would use actual embedding model
    const embedding = new Array(this.config.embeddingDimension).fill(0);

    for (let i = 0; i < text.length; i++) {
      const idx = i % this.config.embeddingDimension;
      embedding[idx] += text.charCodeAt(i) / 1000;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => v / magnitude);
  }

  private calculateSimilarity(embedding1: number[], node: KnowledgeNode): number {
    if (!node.embedding) return 0;

    // Cosine similarity
    let dotProduct = 0;
    for (let i = 0; i < Math.min(embedding1.length, node.embedding.length); i++) {
      dotProduct += embedding1[i] * node.embedding[i];
    }

    return Math.max(0, Math.min(1, dotProduct));
  }

  private calculateRelevance(query: string, node: KnowledgeNode): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Label match
    if (node.label.toLowerCase().includes(queryLower)) {
      score += 0.5;
    }

    // Property match
    for (const value of Object.values(node.properties)) {
      if (String(value).toLowerCase().includes(queryLower)) {
        score += 0.2;
      }
    }

    // Tag match
    for (const tag of node.tags) {
      if (tag.toLowerCase().includes(queryLower)) {
        score += 0.1;
      }
    }

    // Boost by confidence and access count
    score *= node.metadata.confidence;
    score += Math.log10(node.metadata.accessCount + 1) * 0.05;

    return Math.min(1, score);
  }

  private getMatchedProperties(query: string, node: KnowledgeNode): string[] {
    const queryLower = query.toLowerCase();
    const matched: string[] = [];

    if (node.label.toLowerCase().includes(queryLower)) {
      matched.push('label');
    }

    for (const [key, value] of Object.entries(node.properties)) {
      if (String(value).toLowerCase().includes(queryLower)) {
        matched.push(key);
      }
    }

    return matched;
  }

  private generateSearchSuggestions(
    query: string,
    results: SemanticSearchResult['nodes']
  ): string[] {
    const suggestions: string[] = [];

    // Suggest related labels
    for (const result of results.slice(0, 5)) {
      if (!suggestions.includes(result.node.label)) {
        suggestions.push(result.node.label);
      }
    }

    return suggestions.slice(0, 5);
  }

  private calculateCentrality(): GraphAnalytics['centrality'] {
    const nodes: GraphAnalytics['centrality']['nodes'] = [];

    for (const node of this.graph.nodes.values()) {
      // Calculate degree
      let degree = 0;
      for (const edge of this.graph.edges.values()) {
        if (edge.sourceId === node.id || edge.targetId === node.id) {
          degree++;
        }
      }

      nodes.push({
        nodeId: node.id,
        degree,
        betweenness: 0.5,  // Simplified
        closeness: 0.5,    // Simplified
        pageRank: 0.5,     // Simplified
      });
    }

    return {
      nodes: nodes.sort((a, b) => b.degree - a.degree).slice(0, 10),
    };
  }

  private detectCommunities(): GraphAnalytics['communities'] {
    // Simplified community detection
    return [];
  }

  private detectPatterns(): GraphAnalytics['patterns'] {
    const patterns: GraphAnalytics['patterns'] = [];

    // Detect hub nodes (high degree)
    for (const node of this.graph.nodes.values()) {
      let degree = 0;
      for (const edge of this.graph.edges.values()) {
        if (edge.sourceId === node.id || edge.targetId === node.id) {
          degree++;
        }
      }

      if (degree > 5) {
        patterns.push({
          type: 'hub',
          nodeIds: [node.id],
          significance: degree / this.graph.nodes.size,
        });
      }
    }

    return patterns.slice(0, 5);
  }

  private calculateConnectedComponents(): number {
    // Simplified - assume all connected
    return this.graph.nodes.size > 0 ? 1 : 0;
  }

  private calculateDiameter(): number {
    // Simplified
    return Math.ceil(Math.log2(this.graph.nodes.size + 1));
  }

  private calculateAveragePathLength(): number {
    // Simplified
    return Math.log2(this.graph.nodes.size + 1);
  }

  private emitUpdateEvent(event: UpdateEvent): void {
    this.updateEvents.push(event);

    // Keep only recent events
    if (this.updateEvents.length > 1000) {
      this.updateEvents.shift();
    }
  }
}
