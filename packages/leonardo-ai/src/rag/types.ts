/**
 * Leonardo AI - RAG Types
 *
 * Type definitions for Retrieval-Augmented Generation module
 */

/**
 * Document to be stored in knowledge base
 */
export interface Document {
  /** Unique identifier */
  id: string;

  /** Document content (text) */
  content: string;

  /** Document metadata */
  metadata: {
    /** Document title */
    title?: string;

    /** Source URL or file path */
    source?: string;

    /** Author */
    author?: string;

    /** Creation timestamp */
    createdAt?: number;

    /** Last update timestamp */
    updatedAt?: number;

    /** Document type */
    type?: string;

    /** Tags */
    tags?: string[];

    /** Custom metadata */
    [key: string]: any;
  };

  /** Pre-computed embedding (optional) */
  embedding?: number[];

  /** Chunk index (if document is split) */
  chunkIndex?: number;

  /** Total chunks (if document is split) */
  totalChunks?: number;
}

/**
 * Search query
 */
export interface SearchQuery {
  /** Query text */
  text: string;

  /** Number of results to return */
  topK?: number;

  /** Filter by metadata */
  filter?: {
    [key: string]: any;
  };

  /** Minimum similarity score (0-1) */
  minScore?: number;

  /** Search mode */
  mode?: 'semantic' | 'keyword' | 'hybrid';

  /** Hybrid search weights (semantic vs keyword) */
  hybridWeights?: {
    semantic: number;
    keyword: number;
  };
}

/**
 * Search result
 */
export interface SearchResult {
  /** Matched document */
  document: Document;

  /** Similarity score (0-1) */
  score: number;

  /** Highlights (matched text snippets) */
  highlights?: string[];

  /** Explanation of why this was matched */
  explanation?: string;
}

/**
 * Embedding vector
 */
export interface Embedding {
  /** Vector values */
  vector: number[];

  /** Dimension */
  dimension: number;

  /** Model used to generate embedding */
  model: string;
}

/**
 * Vector database configuration
 */
export interface VectorDBConfig {
  /** Database provider */
  provider: 'pinecone' | 'weaviate' | 'qdrant' | 'chroma' | 'milvus';

  /** Connection details */
  connection: {
    /** API key (for cloud providers) */
    apiKey?: string;

    /** Environment (for Pinecone) */
    environment?: string;

    /** Host URL (for self-hosted) */
    host?: string;

    /** Port */
    port?: number;

    /** Index/Collection name */
    indexName: string;
  };

  /** Vector dimension */
  dimension: number;

  /** Distance metric */
  metric?: 'cosine' | 'euclidean' | 'dot_product';
}

/**
 * Embedding service configuration
 */
export interface EmbeddingConfig {
  /** Provider */
  provider: 'openai' | 'cohere' | 'huggingface' | 'sentence-transformers';

  /** Model name */
  model: string;

  /** API key (if needed) */
  apiKey?: string;

  /** Batch size for processing multiple texts */
  batchSize?: number;

  /** Max tokens per text */
  maxTokens?: number;
}

/**
 * Context injection configuration
 */
export interface ContextConfig {
  /** Max context length (tokens) */
  maxContextLength: number;

  /** Context template */
  template?: string;

  /** Separator between documents */
  separator?: string;

  /** Include metadata in context? */
  includeMetadata?: boolean;

  /** Metadata fields to include */
  metadataFields?: string[];

  /** Truncation strategy */
  truncation?: 'start' | 'end' | 'middle';
}

/**
 * RAG Engine configuration
 */
export interface RAGConfig {
  /** Vector database config */
  vectorDB: VectorDBConfig;

  /** Embedding service config */
  embedding: EmbeddingConfig;

  /** Context injection config */
  context: ContextConfig;

  /** Default search settings */
  search?: {
    topK?: number;
    minScore?: number;
    mode?: SearchQuery['mode'];
  };

  /** Caching */
  cache?: {
    enabled: boolean;
    ttl?: number; // seconds
    maxSize?: number;
  };

  /** Auto-update */
  autoUpdate?: {
    enabled: boolean;
    interval?: number; // seconds
    sources?: string[];
  };
}

/**
 * Document processing options
 */
export interface ProcessingOptions {
  /** Chunk size (characters) */
  chunkSize?: number;

  /** Chunk overlap (characters) */
  chunkOverlap?: number;

  /** Chunking strategy */
  chunkingStrategy?: 'fixed' | 'sentence' | 'paragraph' | 'semantic';

  /** Extract metadata automatically? */
  extractMetadata?: boolean;

  /** Clean text before processing? */
  cleanText?: boolean;
}

/**
 * Retrieval statistics
 */
export interface RetrievalStats {
  /** Total documents in knowledge base */
  totalDocuments: number;

  /** Total queries processed */
  totalQueries: number;

  /** Average retrieval time (ms) */
  avgRetrievalTime: number;

  /** Average number of results returned */
  avgResultsReturned: number;

  /** Cache hit rate */
  cacheHitRate?: number;

  /** Last updated */
  lastUpdated: number;
}

/**
 * Knowledge base update event
 */
export interface UpdateEvent {
  /** Event type */
  type: 'document_added' | 'document_updated' | 'document_deleted' | 'index_rebuilt';

  /** Affected document IDs */
  documentIds: string[];

  /** Timestamp */
  timestamp: number;

  /** Additional info */
  metadata?: any;
}

/**
 * Reranking configuration
 */
export interface RerankingConfig {
  /** Enable reranking? */
  enabled: boolean;

  /** Reranking model */
  model?: 'cross-encoder' | 'cohere-rerank' | 'custom';

  /** Model name (if using custom) */
  modelName?: string;

  /** API key (if needed) */
  apiKey?: string;

  /** Top K to rerank */
  topK?: number;
}

/**
 * Document chunk
 */
export interface DocumentChunk {
  /** Original document ID */
  documentId: string;

  /** Chunk ID */
  chunkId: string;

  /** Chunk content */
  content: string;

  /** Chunk index */
  index: number;

  /** Total chunks in document */
  totalChunks: number;

  /** Metadata */
  metadata: Document['metadata'];

  /** Embedding */
  embedding?: number[];

  /** Character range in original document */
  charRange: {
    start: number;
    end: number;
  };
}

/**
 * Hybrid search configuration
 */
export interface HybridSearchConfig {
  /** Semantic search weight (0-1) */
  semanticWeight: number;

  /** Keyword search weight (0-1) */
  keywordWeight: number;

  /** Normalization method */
  normalization?: 'min-max' | 'z-score' | 'reciprocal-rank';

  /** Fusion method */
  fusion?: 'linear' | 'rrf' | 'dbsf';
}

/**
 * Query expansion configuration
 */
export interface QueryExpansionConfig {
  /** Enable query expansion? */
  enabled: boolean;

  /** Expansion method */
  method?: 'synonyms' | 'llm' | 'wordnet';

  /** Max expansions */
  maxExpansions?: number;

  /** LLM config (if using LLM method) */
  llmConfig?: {
    model: string;
    apiKey?: string;
  };
}
