/**
 * Corpus Callosum Types
 *
 * Integration layer between Leonardo AI (RAG/RL) and Info7 Knowledge Base.
 * Named after the brain structure that connects left and right hemispheres,
 * this module connects reasoning (Leonardo) with knowledge (Info7).
 */

import { KnowledgeNode, KnowledgeEdge, NodeType, RelationType } from '@info7/info7';
import { Document } from '../rag/types';
import { State, Action } from '../rl/types';

/**
 * Sync direction
 */
export enum SyncDirection {
  RAG_TO_GRAPH = 'rag-to-graph',      // RAG documents → Knowledge Graph
  GRAPH_TO_RAG = 'graph-to-rag',      // Knowledge Graph → RAG documents
  BIDIRECTIONAL = 'bidirectional',    // Continuous sync both ways
}

/**
 * Knowledge sync configuration
 */
export interface KnowledgeSyncConfig {
  enabled: boolean;
  direction: SyncDirection;
  autoSync: boolean;
  syncInterval?: number;  // milliseconds
  conflictResolution: 'newer' | 'higher-confidence' | 'manual';
  filters?: {
    nodeTypes?: NodeType[];
    documentTypes?: string[];
    minConfidence?: number;
  };
}

/**
 * Sync result
 */
export interface SyncResult {
  timestamp: number;
  direction: SyncDirection;
  statistics: {
    documentsProcessed: number;
    nodesCreated: number;
    nodesUpdated: number;
    edgesCreated: number;
    conflicts: number;
  };
  errors: Array<{
    item: string;
    error: string;
  }>;
  duration: number;
}

/**
 * Knowledge mapping - how RAG documents map to graph nodes
 */
export interface KnowledgeMapping {
  documentId: string;
  nodeId: string;
  nodeType: NodeType;
  confidence: number;
  metadata: {
    createdAt: number;
    lastSynced: number;
    syncCount: number;
  };
}

/**
 * Enriched document - RAG document enhanced with graph knowledge
 */
export interface EnrichedDocument extends Document {
  graphContext?: {
    relatedNodes: Array<{
      nodeId: string;
      label: string;
      type: NodeType;
      relevance: number;
    }>;
    relatedConcepts: string[];
    semanticCluster: string;
  };
}

/**
 * Enriched state - RL state enhanced with graph knowledge
 */
export interface EnrichedState extends State {
  graphContext?: {
    contextNodes: KnowledgeNode[];
    relevantPatterns: Array<{
      pattern: string;
      confidence: number;
      applicability: number;
    }>;
    historicalActions: Array<{
      action: Action;
      outcome: number;
      similarity: number;
    }>;
  };
}

/**
 * Knowledge extraction from RL experience
 */
export interface RLKnowledgeExtraction {
  state: State;
  action: Action;
  reward: number;
  insights: Array<{
    type: 'pattern' | 'strategy' | 'causal-relation';
    description: string;
    confidence: number;
  }>;
  suggestedNodes: KnowledgeNode[];
  suggestedEdges: KnowledgeEdge[];
}

/**
 * Graph query from AI context
 */
export interface AIContextQuery {
  queryType: 'semantic' | 'structural' | 'analytical';
  context: {
    currentState?: State;
    recentActions?: Action[];
    goal?: string;
    constraints?: Record<string, any>;
  };
  parameters: {
    maxNodes?: number;
    maxDepth?: number;
    minRelevance?: number;
    includeRelated?: boolean;
  };
}

/**
 * Graph query result for AI
 */
export interface AIContextResult {
  nodes: Array<{
    node: KnowledgeNode;
    relevance: number;
    reasoning: string;
  }>;
  edges: KnowledgeEdge[];
  insights: Array<{
    type: string;
    description: string;
    confidence: number;
    actionable: boolean;
  }>;
  recommendations: Array<{
    action: string;
    reasoning: string;
    expectedOutcome: number;
  }>;
}

/**
 * Learning feedback to graph
 */
export interface LearningFeedback {
  source: 'rl-engine' | 'rag-engine' | 'meta-learner' | 'consciousness';
  timestamp: number;
  feedback: {
    successfulPatterns: Array<{
      pattern: string;
      context: string;
      successRate: number;
    }>;
    failedPatterns: Array<{
      pattern: string;
      context: string;
      failureRate: number;
    }>;
    newInsights: Array<{
      insight: string;
      evidence: any[];
      confidence: number;
    }>;
  };
  suggestedUpdates: Array<{
    targetId: string;
    targetType: 'node' | 'edge';
    updateType: 'confidence' | 'properties' | 'new';
    value: any;
  }>;
}

/**
 * Corpus Callosum statistics
 */
export interface CorpusCallosumStatistics {
  sync: {
    totalSyncs: number;
    successfulSyncs: number;
    lastSync: number;
    avgSyncDuration: number;
  };
  mappings: {
    totalMappings: number;
    documentsToNodes: number;
    statesToNodes: number;
    avgConfidence: number;
  };
  enrichment: {
    documentsEnriched: number;
    statesEnriched: number;
    avgEnrichmentValue: number;
  };
  learning: {
    feedbacksProcessed: number;
    nodesUpdatedFromLearning: number;
    edgesCreatedFromLearning: number;
    insightsGenerated: number;
  };
  performance: {
    avgEnrichmentTime: number;
    avgQueryTime: number;
    cacheHitRate: number;
  };
}

/**
 * Corpus Callosum configuration
 */
export interface CorpusCallosumConfig {
  sync: KnowledgeSyncConfig;
  enrichment: {
    enabled: boolean;
    enrichDocuments: boolean;
    enrichStates: boolean;
    maxContextNodes: number;
    minRelevanceThreshold: number;
  };
  learning: {
    enabled: boolean;
    feedbackToGraph: boolean;
    autoUpdateFromFeedback: boolean;
    minConfidenceThreshold: number;
  };
  cache: {
    enabled: boolean;
    ttl: number;  // milliseconds
    maxSize: number;
  };
}
