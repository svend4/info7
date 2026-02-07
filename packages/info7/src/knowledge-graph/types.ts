/**
 * Knowledge Graph Types
 *
 * Types for semantic knowledge representation and intelligent querying.
 */

/**
 * Node types in the knowledge graph
 */
export enum NodeType {
  CONCEPT = 'concept',
  ENTITY = 'entity',
  EVENT = 'event',
  DOCUMENT = 'document',
  CODE = 'code',
  AGENT = 'agent',
  TASK = 'task',
  PATTERN = 'pattern',
  INSIGHT = 'insight',
}

/**
 * Relationship types between nodes
 */
export enum RelationType {
  IS_A = 'is_a',                    // Inheritance/classification
  PART_OF = 'part_of',              // Composition
  RELATED_TO = 'related_to',        // General relationship
  DEPENDS_ON = 'depends_on',        // Dependency
  IMPLEMENTS = 'implements',        // Implementation
  USES = 'uses',                    // Usage
  PRODUCES = 'produces',            // Output/result
  CAUSED_BY = 'caused_by',          // Causation
  SIMILAR_TO = 'similar_to',        // Similarity
  CONTRADICTS = 'contradicts',      // Contradiction
  DERIVED_FROM = 'derived_from',    // Derivation
  REFERENCES = 'references',        // Reference
}

/**
 * Knowledge node
 */
export interface KnowledgeNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, any>;
  embedding?: number[];  // Vector embedding for semantic search
  metadata: {
    createdAt: number;
    updatedAt: number;
    source: string;
    confidence: number;  // 0-1
    accessCount: number;
    lastAccessed: number;
  };
  tags: string[];
}

/**
 * Knowledge edge (relationship)
 */
export interface KnowledgeEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  weight: number;  // 0-1, strength of relationship
  properties: Record<string, any>;
  metadata: {
    createdAt: number;
    source: string;
    confidence: number;
  };
  bidirectional: boolean;
}

/**
 * Knowledge graph
 */
export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  edges: Map<string, KnowledgeEdge>;
  indexes: {
    byType: Map<NodeType, Set<string>>;
    byTag: Map<string, Set<string>>;
    byLabel: Map<string, Set<string>>;
  };
  statistics: {
    nodeCount: number;
    edgeCount: number;
    avgDegree: number;
    density: number;
  };
}

/**
 * Graph query
 */
export interface GraphQuery {
  startNodes?: string[];  // Starting node IDs
  nodeTypes?: NodeType[];
  edgeTypes?: RelationType[];
  filters?: {
    nodeFilters?: Array<{
      property: string;
      operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'matches';
      value: any;
    }>;
    edgeFilters?: Array<{
      property: string;
      operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte';
      value: any;
    }>;
  };
  traversal?: {
    maxDepth?: number;
    direction?: 'outgoing' | 'incoming' | 'both';
    pathType?: 'shortest' | 'all' | 'simple';
  };
  limit?: number;
  offset?: number;
}

/**
 * Graph query result
 */
export interface GraphQueryResult {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  paths?: Array<{
    nodes: string[];
    edges: string[];
    length: number;
  }>;
  statistics: {
    nodesFound: number;
    edgesFound: number;
    pathsFound: number;
    queryTime: number;
  };
}

/**
 * Semantic search query
 */
export interface SemanticSearchQuery {
  query: string;
  nodeTypes?: NodeType[];
  topK?: number;
  minSimilarity?: number;
  filters?: GraphQuery['filters'];
  includeRelated?: boolean;
  relatedDepth?: number;
}

/**
 * Semantic search result
 */
export interface SemanticSearchResult {
  nodes: Array<{
    node: KnowledgeNode;
    similarity: number;
    relevanceScore: number;
    matchedProperties: string[];
  }>;
  relatedNodes?: KnowledgeNode[];
  suggestions?: string[];
  statistics: {
    totalResults: number;
    searchTime: number;
    avgSimilarity: number;
  };
}

/**
 * Knowledge extraction result
 */
export interface KnowledgeExtraction {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  confidence: number;
  source: string;
  extractedAt: number;
}

/**
 * Graph analytics result
 */
export interface GraphAnalytics {
  centrality: {
    nodes: Array<{
      nodeId: string;
      degree: number;
      betweenness: number;
      closeness: number;
      pageRank: number;
    }>;
  };
  communities: Array<{
    id: string;
    nodeIds: string[];
    size: number;
    density: number;
  }>;
  patterns: Array<{
    type: 'cluster' | 'chain' | 'hub' | 'bridge';
    nodeIds: string[];
    significance: number;
  }>;
}

/**
 * Auto-update configuration
 */
export interface AutoUpdateConfig {
  enabled: boolean;
  sources: Array<{
    type: 'file' | 'api' | 'database' | 'stream';
    location: string;
    pollInterval?: number;  // milliseconds
    filters?: string[];
  }>;
  updateStrategy: 'merge' | 'replace' | 'append';
  conflictResolution: 'newer' | 'higher-confidence' | 'manual';
  notifyOnUpdate: boolean;
}

/**
 * Update event
 */
export interface UpdateEvent {
  id: string;
  timestamp: number;
  type: 'node-added' | 'node-updated' | 'node-removed' | 'edge-added' | 'edge-updated' | 'edge-removed';
  nodeIds?: string[];
  edgeIds?: string[];
  source: string;
  metadata: Record<string, any>;
}

/**
 * Knowledge graph statistics
 */
export interface GraphStatistics {
  nodes: {
    total: number;
    byType: Map<NodeType, number>;
    avgPropertiesPerNode: number;
    withEmbeddings: number;
  };
  edges: {
    total: number;
    byType: Map<RelationType, number>;
    avgWeight: number;
    bidirectional: number;
  };
  graph: {
    avgDegree: number;
    density: number;
    connectedComponents: number;
    diameter: number;
    avgPathLength: number;
  };
  usage: {
    totalQueries: number;
    totalSearches: number;
    avgQueryTime: number;
    mostAccessedNodes: Array<{
      nodeId: string;
      accessCount: number;
    }>;
  };
}

/**
 * Knowledge graph configuration
 */
export interface KnowledgeGraphConfig {
  enableEmbeddings: boolean;
  embeddingDimension: number;
  enableAutoUpdate: boolean;
  autoUpdateConfig?: AutoUpdateConfig;
  cacheEnabled: boolean;
  cacheSize: number;
  persistenceEnabled: boolean;
  persistencePath?: string;
}
