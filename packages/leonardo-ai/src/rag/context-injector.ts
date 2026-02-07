/**
 * Leonardo AI - Context Injector
 *
 * Injects retrieved context into prompts for LLM
 */

import { SearchResult, ContextConfig } from './types';

/**
 * Default context configuration
 */
const DEFAULT_CONFIG: ContextConfig = {
  maxContextLength: 4000,
  template: `Context information:
---
{context}
---

Based on the context above, please answer the following question:
{query}`,
  separator: '\n\n---\n\n',
  includeMetadata: true,
  metadataFields: ['title', 'source'],
  truncation: 'end',
};

/**
 * Context injector for RAG
 */
export class ContextInjector {
  constructor(private config: ContextConfig = DEFAULT_CONFIG) {}

  /**
   * Inject context into prompt
   */
  injectContext(query: string, results: SearchResult[]): string {
    // Format context from results
    const context = this.formatContext(results);

    // Apply template
    const template = this.config.template ?? DEFAULT_CONFIG.template!;
    const prompt = template
      .replace('{context}', context)
      .replace('{query}', query);

    return prompt;
  }

  /**
   * Format search results into context string
   */
  private formatContext(results: SearchResult[]): string {
    const separator = this.config.separator ?? '\n\n---\n\n';
    const chunks: string[] = [];
    let totalLength = 0;

    for (const result of results) {
      const chunk = this.formatSingleResult(result);
      const chunkLength = chunk.length;

      // Check if adding this chunk exceeds max length
      if (totalLength + chunkLength > this.config.maxContextLength) {
        // Apply truncation strategy
        if (this.config.truncation === 'start') {
          // Skip early results
          continue;
        } else if (this.config.truncation === 'end') {
          // Stop adding more results
          break;
        } else if (this.config.truncation === 'middle') {
          // Skip middle results (keep first and last)
          if (chunks.length > 0 && results.indexOf(result) < results.length - 1) {
            continue;
          }
        }
      }

      chunks.push(chunk);
      totalLength += chunkLength;
    }

    return chunks.join(separator);
  }

  /**
   * Format single search result
   */
  private formatSingleResult(result: SearchResult): string {
    const parts: string[] = [];

    // Add metadata if enabled
    if (this.config.includeMetadata) {
      const metadata = this.formatMetadata(result);
      if (metadata) {
        parts.push(metadata);
      }
    }

    // Add content
    parts.push(result.document.content);

    // Add relevance score
    parts.push(`[Relevance: ${(result.score * 100).toFixed(1)}%]`);

    return parts.join('\n');
  }

  /**
   * Format metadata
   */
  private formatMetadata(result: SearchResult): string {
    const fields = this.config.metadataFields ?? ['title', 'source'];
    const metadataParts: string[] = [];

    for (const field of fields) {
      const value = result.document.metadata[field];
      if (value) {
        metadataParts.push(`${field}: ${value}`);
      }
    }

    return metadataParts.length > 0
      ? `[${metadataParts.join(', ')}]`
      : '';
  }

  /**
   * Create context-aware messages for chat
   */
  createChatMessages(
    query: string,
    results: SearchResult[]
  ): Array<{ role: 'system' | 'user'; content: string }> {
    const context = this.formatContext(results);

    return [
      {
        role: 'system',
        content: `You are a helpful assistant. Use the following context to answer the user's question:

${context}`,
      },
      {
        role: 'user',
        content: query,
      },
    ];
  }

  /**
   * Get context summary
   */
  getContextSummary(results: SearchResult[]): {
    totalResults: number;
    totalLength: number;
    averageRelevance: number;
    sources: string[];
  } {
    const context = this.formatContext(results);
    const totalLength = context.length;
    const totalResults = results.length;
    const averageRelevance =
      results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const sources = [
      ...new Set(
        results
          .map((r) => r.document.metadata.source)
          .filter((s): s is string => s !== undefined)
      ),
    ];

    return {
      totalResults,
      totalLength,
      averageRelevance,
      sources,
    };
  }

  /**
   * Estimate token count (rough approximation)
   */
  estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Truncate context to fit token limit
   */
  truncateToTokenLimit(
    results: SearchResult[],
    maxTokens: number
  ): SearchResult[] {
    const truncated: SearchResult[] = [];
    let currentTokens = 0;

    for (const result of results) {
      const resultTokens = this.estimateTokens(result.document.content);

      if (currentTokens + resultTokens <= maxTokens) {
        truncated.push(result);
        currentTokens += resultTokens;
      } else {
        break;
      }
    }

    return truncated;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ContextConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ContextConfig {
    return { ...this.config };
  }
}
