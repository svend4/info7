/**
 * Leonardo AI - Vector Store
 *
 * Interface for vector database storage and retrieval
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { Document, DocumentChunk, VectorDBConfig, SearchQuery, SearchResult } from './types';

/**
 * Vector metadata for storage
 */
interface VectorMetadata {
  documentId: string;
  chunkId: string;
  content: string;
  chunkIndex: number;
  totalChunks: number;
  [key: string]: any;
}

/**
 * Vector store for managing embeddings in vector database
 */
export class VectorStore {
  private pineconeClient?: Pinecone;
  private indexName: string;

  constructor(private config: VectorDBConfig) {
    this.indexName = config.connection.indexName;

    if (config.provider === 'pinecone') {
      this.initializePinecone();
    }
  }

  /**
   * Initialize Pinecone client
   */
  private initializePinecone(): void {
    if (!this.config.connection.apiKey) {
      throw new Error('Pinecone API key is required');
    }

    this.pineconeClient = new Pinecone({
      apiKey: this.config.connection.apiKey,
    });
  }

  /**
   * Create index if it doesn't exist
   */
  async createIndex(): Promise<void> {
    if (this.config.provider === 'pinecone' && this.pineconeClient) {
      const existingIndexes = await this.pineconeClient.listIndexes();

      const indexExists = existingIndexes.indexes?.some(
        (index) => index.name === this.indexName
      );

      if (!indexExists) {
        await this.pineconeClient.createIndex({
          name: this.indexName,
          dimension: this.config.dimension,
          metric: this.config.metric ?? 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1',
            },
          },
        });
      }
    }
  }

  /**
   * Store document chunks with embeddings
   */
  async storeChunks(chunks: DocumentChunk[]): Promise<void> {
    if (this.config.provider === 'pinecone') {
      await this.storePinecone(chunks);
    } else {
      throw new Error(`Provider ${this.config.provider} not implemented`);
    }
  }

  /**
   * Store chunks in Pinecone
   */
  private async storePinecone(chunks: DocumentChunk[]): Promise<void> {
    if (!this.pineconeClient) {
      throw new Error('Pinecone client not initialized');
    }

    const index = this.pineconeClient.index(this.indexName);

    // Prepare vectors for upsert
    const vectors = chunks
      .filter((chunk) => chunk.embedding && chunk.embedding.length > 0)
      .map((chunk) => ({
        id: chunk.chunkId,
        values: chunk.embedding!,
        metadata: {
          documentId: chunk.documentId,
          chunkId: chunk.chunkId,
          content: chunk.content,
          chunkIndex: chunk.index,
          totalChunks: chunk.totalChunks,
          ...chunk.metadata,
        } as VectorMetadata,
      }));

    // Upsert in batches
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
    }
  }

  /**
   * Search for similar vectors
   */
  async search(
    queryEmbedding: number[],
    query: SearchQuery
  ): Promise<SearchResult[]> {
    if (this.config.provider === 'pinecone') {
      return this.searchPinecone(queryEmbedding, query);
    } else {
      throw new Error(`Provider ${this.config.provider} not implemented`);
    }
  }

  /**
   * Search in Pinecone
   */
  private async searchPinecone(
    queryEmbedding: number[],
    query: SearchQuery
  ): Promise<SearchResult[]> {
    if (!this.pineconeClient) {
      throw new Error('Pinecone client not initialized');
    }

    const index = this.pineconeClient.index(this.indexName);

    // Query
    const response = await index.query({
      vector: queryEmbedding,
      topK: query.topK ?? 10,
      includeMetadata: true,
      filter: query.filter,
    });

    // Convert to SearchResult
    const results: SearchResult[] = (response.matches ?? [])
      .filter((match) => match.score && match.score >= (query.minScore ?? 0))
      .map((match) => {
        const metadata = match.metadata as VectorMetadata;

        const document: Document = {
          id: metadata.documentId,
          content: metadata.content,
          metadata: {
            title: metadata.title,
            source: metadata.source,
            author: metadata.author,
            createdAt: metadata.createdAt,
            updatedAt: metadata.updatedAt,
            type: metadata.type,
            tags: metadata.tags,
          },
          chunkIndex: metadata.chunkIndex,
          totalChunks: metadata.totalChunks,
        };

        return {
          document,
          score: match.score ?? 0,
        };
      });

    return results;
  }

  /**
   * Delete document and all its chunks
   */
  async deleteDocument(documentId: string): Promise<void> {
    if (this.config.provider === 'pinecone') {
      await this.deletePinecone(documentId);
    } else {
      throw new Error(`Provider ${this.config.provider} not implemented`);
    }
  }

  /**
   * Delete from Pinecone
   */
  private async deletePinecone(documentId: string): Promise<void> {
    if (!this.pineconeClient) {
      throw new Error('Pinecone client not initialized');
    }

    const index = this.pineconeClient.index(this.indexName);

    // Delete by metadata filter
    await index.deleteMany({
      filter: { documentId: { $eq: documentId } },
    });
  }

  /**
   * Update document chunks
   */
  async updateDocument(
    documentId: string,
    newChunks: DocumentChunk[]
  ): Promise<void> {
    // Delete old chunks
    await this.deleteDocument(documentId);

    // Store new chunks
    await this.storeChunks(newChunks);
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<Document | null> {
    if (this.config.provider === 'pinecone') {
      return this.getDocumentPinecone(documentId);
    } else {
      throw new Error(`Provider ${this.config.provider} not implemented`);
    }
  }

  /**
   * Get document from Pinecone
   */
  private async getDocumentPinecone(documentId: string): Promise<Document | null> {
    if (!this.pineconeClient) {
      throw new Error('Pinecone client not initialized');
    }

    const index = this.pineconeClient.index(this.indexName);

    // Query for all chunks of this document
    const response = await index.query({
      vector: new Array(this.config.dimension).fill(0), // Dummy vector
      topK: 1000,
      filter: { documentId: { $eq: documentId } },
      includeMetadata: true,
    });

    if (!response.matches || response.matches.length === 0) {
      return null;
    }

    // Reconstruct document from chunks
    const chunks = response.matches
      .map((match) => match.metadata as VectorMetadata)
      .sort((a, b) => a.chunkIndex - b.chunkIndex);

    const fullContent = chunks.map((chunk) => chunk.content).join('\n\n');

    return {
      id: documentId,
      content: fullContent,
      metadata: {
        title: chunks[0]?.title,
        source: chunks[0]?.source,
        author: chunks[0]?.author,
        createdAt: chunks[0]?.createdAt,
        updatedAt: chunks[0]?.updatedAt,
        type: chunks[0]?.type,
        tags: chunks[0]?.tags,
      },
    };
  }

  /**
   * Get index statistics
   */
  async getStats(): Promise<{
    totalVectors: number;
    dimension: number;
  }> {
    if (this.config.provider === 'pinecone' && this.pineconeClient) {
      const index = this.pineconeClient.index(this.indexName);
      const stats = await index.describeIndexStats();

      return {
        totalVectors: stats.totalRecordCount ?? 0,
        dimension: this.config.dimension,
      };
    }

    return {
      totalVectors: 0,
      dimension: this.config.dimension,
    };
  }

  /**
   * Clear all vectors
   */
  async clear(): Promise<void> {
    if (this.config.provider === 'pinecone' && this.pineconeClient) {
      const index = this.pineconeClient.index(this.indexName);
      await index.deleteAll();
    }
  }
}
