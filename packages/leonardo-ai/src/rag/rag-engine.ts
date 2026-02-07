/**
 * Leonardo AI - RAG Engine
 *
 * Main Retrieval-Augmented Generation engine
 */

import { EmbeddingService } from './embedding-service';
import { VectorStore } from './vector-store';
import { DocumentProcessor } from './document-processor';
import { ContextInjector } from './context-injector';
import {
  RAGConfig,
  Document,
  SearchQuery,
  SearchResult,
  RetrievalStats,
} from './types';

/**
 * Default RAG configuration
 */
export const DEFAULT_RAG_CONFIG: RAGConfig = {
  vectorDB: {
    provider: 'pinecone',
    connection: {
      apiKey: process.env.PINECONE_API_KEY,
      indexName: 'leonardo-ai-kb',
    },
    dimension: 1536, // OpenAI ada-002
    metric: 'cosine',
  },
  embedding: {
    provider: 'openai',
    model: 'text-embedding-ada-002',
    apiKey: process.env.OPENAI_API_KEY,
    batchSize: 20,
  },
  context: {
    maxContextLength: 4000,
    includeMetadata: true,
    metadataFields: ['title', 'source'],
    truncation: 'end',
  },
  search: {
    topK: 5,
    minScore: 0.7,
    mode: 'semantic',
  },
  cache: {
    enabled: true,
    ttl: 3600,
    maxSize: 1000,
  },
};

/**
 * Main RAG Engine
 */
export class RAGEngine {
  private embeddingService: EmbeddingService;
  private vectorStore: VectorStore;
  private documentProcessor: DocumentProcessor;
  private contextInjector: ContextInjector;

  private queryCache: Map<string, SearchResult[]> = new Map();
  private stats: RetrievalStats = {
    totalDocuments: 0,
    totalQueries: 0,
    avgRetrievalTime: 0,
    avgResultsReturned: 0,
    cacheHitRate: 0,
    lastUpdated: Date.now(),
  };

  constructor(private config: RAGConfig = DEFAULT_RAG_CONFIG) {
    this.embeddingService = new EmbeddingService(config.embedding);
    this.vectorStore = new VectorStore(config.vectorDB);
    this.documentProcessor = new DocumentProcessor({
      chunkSize: 1000,
      chunkOverlap: 200,
      chunkingStrategy: 'sentence',
      extractMetadata: true,
      cleanText: true,
    });
    this.contextInjector = new ContextInjector(config.context);
  }

  /**
   * Initialize RAG engine (create index if needed)
   */
  async initialize(): Promise<void> {
    await this.vectorStore.createIndex();
  }

  /**
   * Add document to knowledge base
   */
  async addDocument(document: Document): Promise<void> {
    const startTime = Date.now();

    // Process document into chunks
    const chunks = this.documentProcessor.processDocument(document);

    // Generate embeddings for chunks
    const texts = chunks.map((chunk) => chunk.content);
    const embeddings = await this.embeddingService.embedBatch(texts);

    // Add embeddings to chunks
    const chunksWithEmbeddings = chunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i].vector,
    }));

    // Store in vector database
    await this.vectorStore.storeChunks(chunksWithEmbeddings);

    // Update stats
    this.stats.totalDocuments++;
    this.stats.lastUpdated = Date.now();

    console.log(`Document ${document.id} added in ${Date.now() - startTime}ms`);
  }

  /**
   * Add multiple documents
   */
  async addDocuments(documents: Document[]): Promise<void> {
    for (const doc of documents) {
      await this.addDocument(doc);
    }
  }

  /**
   * Search knowledge base
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    const startTime = Date.now();

    // Check cache
    const cacheKey = this.getCacheKey(query);
    if (this.config.cache?.enabled && this.queryCache.has(cacheKey)) {
      this.updateCacheStats(true);
      return this.queryCache.get(cacheKey)!;
    }

    // Generate query embedding
    const queryEmbedding = await this.embeddingService.embed(query.text);

    // Search vector store
    const results = await this.vectorStore.search(
      queryEmbedding.vector,
      {
        ...this.config.search,
        ...query,
      }
    );

    // Cache results
    if (this.config.cache?.enabled) {
      this.cacheResults(cacheKey, results);
    }

    // Update stats
    this.updateSearchStats(results.length, Date.now() - startTime);
    this.updateCacheStats(false);

    return results;
  }

  /**
   * Retrieve context for query
   */
  async retrieve(queryText: string, topK?: number): Promise<SearchResult[]> {
    return this.search({
      text: queryText,
      topK: topK ?? this.config.search?.topK,
      mode: 'semantic',
    });
  }

  /**
   * Generate RAG-augmented prompt
   */
  async generatePrompt(query: string, topK?: number): Promise<string> {
    const results = await this.retrieve(query, topK);
    return this.contextInjector.injectContext(query, results);
  }

  /**
   * Generate chat messages with context
   */
  async generateChatMessages(
    query: string,
    topK?: number
  ): Promise<Array<{ role: 'system' | 'user'; content: string }>> {
    const results = await this.retrieve(query, topK);
    return this.contextInjector.createChatMessages(query, results);
  }

  /**
   * Query with full RAG pipeline (retrieve + generate)
   */
  async query(
    queryText: string,
    options?: {
      topK?: number;
      includeContext?: boolean;
      includeSources?: boolean;
    }
  ): Promise<{
    results: SearchResult[];
    prompt?: string;
    contextSummary: ReturnType<typeof this.contextInjector.getContextSummary>;
  }> {
    const results = await this.retrieve(queryText, options?.topK);
    const contextSummary = this.contextInjector.getContextSummary(results);

    let prompt: string | undefined;
    if (options?.includeContext) {
      prompt = this.contextInjector.injectContext(queryText, results);
    }

    return {
      results,
      prompt,
      contextSummary,
    };
  }

  /**
   * Update document in knowledge base
   */
  async updateDocument(document: Document): Promise<void> {
    // Process new chunks
    const chunks = this.documentProcessor.processDocument(document);

    // Generate embeddings
    const texts = chunks.map((chunk) => chunk.content);
    const embeddings = await this.embeddingService.embedBatch(texts);

    const chunksWithEmbeddings = chunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i].vector,
    }));

    // Update in vector store
    await this.vectorStore.updateDocument(document.id, chunksWithEmbeddings);

    // Clear relevant cache entries
    this.clearCache();

    this.stats.lastUpdated = Date.now();
  }

  /**
   * Delete document from knowledge base
   */
  async deleteDocument(documentId: string): Promise<void> {
    await this.vectorStore.deleteDocument(documentId);
    this.stats.totalDocuments = Math.max(0, this.stats.totalDocuments - 1);
    this.stats.lastUpdated = Date.now();

    // Clear cache
    this.clearCache();
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<Document | null> {
    return this.vectorStore.getDocument(documentId);
  }

  /**
   * Get retrieval statistics
   */
  getStats(): RetrievalStats {
    return { ...this.stats };
  }

  /**
   * Get knowledge base statistics
   */
  async getKnowledgeBaseStats(): Promise<{
    totalDocuments: number;
    totalVectors: number;
    dimension: number;
  }> {
    const vectorStats = await this.vectorStore.getStats();

    return {
      totalDocuments: this.stats.totalDocuments,
      totalVectors: vectorStats.totalVectors,
      dimension: vectorStats.dimension,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.queryCache.clear();
  }

  /**
   * Clear entire knowledge base
   */
  async clearKnowledgeBase(): Promise<void> {
    await this.vectorStore.clear();
    this.stats.totalDocuments = 0;
    this.stats.lastUpdated = Date.now();
    this.clearCache();
  }

  /**
   * Generate cache key for query
   */
  private getCacheKey(query: SearchQuery): string {
    return JSON.stringify({
      text: query.text,
      topK: query.topK,
      mode: query.mode,
      filter: query.filter,
    });
  }

  /**
   * Cache search results
   */
  private cacheResults(key: string, results: SearchResult[]): void {
    this.queryCache.set(key, results);

    // Enforce max cache size
    if (
      this.config.cache?.maxSize &&
      this.queryCache.size > this.config.cache.maxSize
    ) {
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }
  }

  /**
   * Update search statistics
   */
  private updateSearchStats(resultsCount: number, retrievalTime: number): void {
    const n = this.stats.totalQueries;

    // Update running averages
    this.stats.avgRetrievalTime =
      (this.stats.avgRetrievalTime * n + retrievalTime) / (n + 1);
    this.stats.avgResultsReturned =
      (this.stats.avgResultsReturned * n + resultsCount) / (n + 1);

    this.stats.totalQueries++;
  }

  /**
   * Update cache statistics
   */
  private updateCacheStats(cacheHit: boolean): void {
    const n = this.stats.totalQueries;
    const hits = this.stats.cacheHitRate * n + (cacheHit ? 1 : 0);
    this.stats.cacheHitRate = hits / (n + 1);
  }

  /**
   * Export knowledge base (for backup)
   */
  async exportKnowledgeBase(): Promise<Document[]> {
    // This would require querying all documents
    // Implementation depends on vector store capabilities
    throw new Error('Export not yet implemented');
  }

  /**
   * Import knowledge base (from backup)
   */
  async importKnowledgeBase(documents: Document[]): Promise<void> {
    await this.addDocuments(documents);
  }
}
