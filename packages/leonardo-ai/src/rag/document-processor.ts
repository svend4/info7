/**
 * Leonardo AI - Document Processor
 *
 * Processes and chunks documents for vector storage
 */

import { Document, DocumentChunk, ProcessingOptions } from './types';

/**
 * Default processing options
 */
const DEFAULT_OPTIONS: ProcessingOptions = {
  chunkSize: 1000,
  chunkOverlap: 200,
  chunkingStrategy: 'sentence',
  extractMetadata: true,
  cleanText: true,
};

/**
 * Document processor for chunking and preprocessing
 */
export class DocumentProcessor {
  constructor(private options: ProcessingOptions = DEFAULT_OPTIONS) {}

  /**
   * Process document and split into chunks
   */
  processDocument(document: Document): DocumentChunk[] {
    let content = document.content;

    // Clean text if enabled
    if (this.options.cleanText) {
      content = this.cleanText(content);
    }

    // Extract metadata if enabled
    const metadata = this.options.extractMetadata
      ? this.extractMetadata(content, document.metadata)
      : document.metadata;

    // Split into chunks
    const chunks = this.splitIntoChunks(content);

    // Create chunk objects
    return chunks.map((chunkContent, index) => ({
      documentId: document.id,
      chunkId: `${document.id}_chunk_${index}`,
      content: chunkContent,
      index,
      totalChunks: chunks.length,
      metadata,
      charRange: this.getCharRange(content, chunkContent, index),
    }));
  }

  /**
   * Process multiple documents
   */
  processDocuments(documents: Document[]): DocumentChunk[] {
    const allChunks: DocumentChunk[] = [];

    for (const doc of documents) {
      const chunks = this.processDocument(doc);
      allChunks.push(...chunks);
    }

    return allChunks;
  }

  /**
   * Split text into chunks
   */
  private splitIntoChunks(text: string): string[] {
    const strategy = this.options.chunkingStrategy ?? 'sentence';

    switch (strategy) {
      case 'fixed':
        return this.fixedSizeChunking(text);

      case 'sentence':
        return this.sentenceChunking(text);

      case 'paragraph':
        return this.paragraphChunking(text);

      case 'semantic':
        return this.semanticChunking(text);

      default:
        return this.sentenceChunking(text);
    }
  }

  /**
   * Fixed-size chunking
   */
  private fixedSizeChunking(text: string): string[] {
    const chunkSize = this.options.chunkSize ?? 1000;
    const overlap = this.options.chunkOverlap ?? 200;
    const chunks: string[] = [];

    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunk = text.slice(i, i + chunkSize);
      if (chunk.trim().length > 0) {
        chunks.push(chunk);
      }
    }

    return chunks;
  }

  /**
   * Sentence-based chunking
   */
  private sentenceChunking(text: string): string[] {
    const chunkSize = this.options.chunkSize ?? 1000;
    const overlap = this.options.chunkOverlap ?? 200;

    // Split into sentences
    const sentences = this.splitIntoSentences(text);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= chunkSize) {
        currentChunk += sentence + ' ';
      } else {
        if (currentChunk.trim().length > 0) {
          chunks.push(currentChunk.trim());
        }

        // Start new chunk with overlap
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 5)); // Approximate
        currentChunk = overlapWords.join(' ') + ' ' + sentence + ' ';
      }
    }

    // Add last chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Paragraph-based chunking
   */
  private paragraphChunking(text: string): string[] {
    const chunkSize = this.options.chunkSize ?? 1000;
    const overlap = this.options.chunkOverlap ?? 200;

    // Split into paragraphs
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length <= chunkSize) {
        currentChunk += paragraph + '\n\n';
      } else {
        if (currentChunk.trim().length > 0) {
          chunks.push(currentChunk.trim());
        }

        // Start new chunk with overlap
        const sentences = this.splitIntoSentences(currentChunk);
        const overlapSentences = sentences.slice(-2); // Last 2 sentences
        currentChunk = overlapSentences.join(' ') + '\n\n' + paragraph + '\n\n';
      }
    }

    // Add last chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Semantic chunking (simplified version)
   */
  private semanticChunking(text: string): string[] {
    // For now, use sentence chunking
    // In production, you'd use embeddings to find semantic boundaries
    return this.sentenceChunking(text);
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting (can be improved with NLP)
    return text
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);
  }

  /**
   * Clean text
   */
  private cleanText(text: string): string {
    let cleaned = text;

    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Remove special characters (keep basic punctuation)
    cleaned = cleaned.replace(/[^\w\s.,!?;:()\-'"]/g, '');

    // Trim
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Extract metadata from content
   */
  private extractMetadata(
    content: string,
    existingMetadata: Document['metadata']
  ): Document['metadata'] {
    const metadata = { ...existingMetadata };

    // Extract title if not present (use first line or heading)
    if (!metadata.title) {
      const firstLine = content.split('\n')[0];
      if (firstLine.length < 100) {
        metadata.title = firstLine.trim();
      }
    }

    // Extract dates (simplified)
    const datePattern = /\b(\d{4}-\d{2}-\d{2})\b/;
    const dateMatch = content.match(datePattern);
    if (dateMatch && !metadata.createdAt) {
      metadata.createdAt = new Date(dateMatch[1]).getTime();
    }

    // Extract tags from hashtags
    const hashtagPattern = /#(\w+)/g;
    const hashtags = content.match(hashtagPattern);
    if (hashtags && !metadata.tags) {
      metadata.tags = hashtags.map((tag) => tag.slice(1));
    }

    return metadata;
  }

  /**
   * Get character range for chunk in original text
   */
  private getCharRange(
    originalText: string,
    chunkText: string,
    chunkIndex: number
  ): { start: number; end: number } {
    const start = originalText.indexOf(chunkText);
    const end = start + chunkText.length;

    return { start: Math.max(0, start), end };
  }

  /**
   * Merge small chunks if they're too small
   */
  mergeSmallChunks(chunks: DocumentChunk[]): DocumentChunk[] {
    const minSize = Math.floor((this.options.chunkSize ?? 1000) * 0.3); // 30% of chunk size
    const merged: DocumentChunk[] = [];
    let currentChunk: DocumentChunk | null = null;

    for (const chunk of chunks) {
      if (chunk.content.length < minSize && currentChunk) {
        // Merge with previous chunk
        currentChunk.content += '\n\n' + chunk.content;
        currentChunk.totalChunks--;
      } else {
        if (currentChunk) {
          merged.push(currentChunk);
        }
        currentChunk = { ...chunk };
      }
    }

    // Add last chunk
    if (currentChunk) {
      merged.push(currentChunk);
    }

    return merged;
  }

  /**
   * Get text statistics
   */
  getTextStats(text: string): {
    characters: number;
    words: number;
    sentences: number;
    paragraphs: number;
  } {
    return {
      characters: text.length,
      words: text.split(/\s+/).filter((w) => w.length > 0).length,
      sentences: this.splitIntoSentences(text).length,
      paragraphs: text.split(/\n\n+/).filter((p) => p.trim().length > 0).length,
    };
  }
}
