/**
 * Leonardo AI - Embedding Service
 *
 * Generates embeddings for text using various providers
 */

import OpenAI from 'openai';
import { Embedding, EmbeddingConfig } from './types';

/**
 * Embedding service for converting text to vectors
 */
export class EmbeddingService {
  private openaiClient?: OpenAI;
  private cache: Map<string, Embedding> = new Map();

  constructor(private config: EmbeddingConfig) {
    if (config.provider === 'openai') {
      this.openaiClient = new OpenAI({
        apiKey: config.apiKey,
      });
    }
  }

  /**
   * Generate embedding for single text
   */
  async embed(text: string): Promise<Embedding> {
    // Check cache
    const cacheKey = this.getCacheKey(text);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    let embedding: Embedding;

    switch (this.config.provider) {
      case 'openai':
        embedding = await this.embedOpenAI(text);
        break;

      case 'cohere':
        embedding = await this.embedCohere(text);
        break;

      case 'huggingface':
        embedding = await this.embedHuggingFace(text);
        break;

      case 'sentence-transformers':
        embedding = await this.embedSentenceTransformers(text);
        break;

      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }

    // Cache result
    this.cache.set(cacheKey, embedding);

    // Limit cache size
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    return embedding;
  }

  /**
   * Generate embeddings for multiple texts (batched)
   */
  async embedBatch(texts: string[]): Promise<Embedding[]> {
    const batchSize = this.config.batchSize ?? 20;
    const embeddings: Embedding[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchEmbeddings = await Promise.all(
        batch.map((text) => this.embed(text))
      );
      embeddings.push(...batchEmbeddings);
    }

    return embeddings;
  }

  /**
   * Generate embedding using OpenAI
   */
  private async embedOpenAI(text: string): Promise<Embedding> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openaiClient.embeddings.create({
      model: this.config.model,
      input: text,
    });

    return {
      vector: response.data[0].embedding,
      dimension: response.data[0].embedding.length,
      model: this.config.model,
    };
  }

  /**
   * Generate embedding using Cohere
   */
  private async embedCohere(text: string): Promise<Embedding> {
    // Placeholder for Cohere implementation
    const response = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: [text],
        model: this.config.model,
      }),
    });

    const data = await response.json();

    return {
      vector: data.embeddings[0],
      dimension: data.embeddings[0].length,
      model: this.config.model,
    };
  }

  /**
   * Generate embedding using HuggingFace
   */
  private async embedHuggingFace(text: string): Promise<Embedding> {
    // Placeholder for HuggingFace implementation
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${this.config.model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    const embedding = await response.json();

    return {
      vector: embedding,
      dimension: embedding.length,
      model: this.config.model,
    };
  }

  /**
   * Generate embedding using Sentence Transformers
   */
  private async embedSentenceTransformers(text: string): Promise<Embedding> {
    // This would typically use a local Python service or ONNX model
    // For now, fallback to OpenAI
    return this.embedOpenAI(text);
  }

  /**
   * Generate cache key for text
   */
  private getCacheKey(text: string): string {
    return `${this.config.provider}:${this.config.model}:${text}`;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have same dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate Euclidean distance between two embeddings
   */
  static euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have same dimension');
    }

    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}
