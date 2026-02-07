/**
 * Leonardo AI - Experience Replay Buffer
 *
 * Stores past experiences for experience replay learning
 */

import { Experience, State, Action } from './types';

/**
 * Priority for prioritized experience replay
 */
interface PrioritizedExperience extends Experience {
  priority: number;
}

/**
 * Experience Replay Buffer with optional prioritization
 */
export class ExperienceReplayBuffer {
  private buffer: PrioritizedExperience[] = [];
  private position = 0;

  constructor(
    private maxSize: number,
    private prioritized: boolean = false
  ) {}

  /**
   * Add experience to buffer
   */
  add(experience: Experience, priority?: number): void {
    const prioritizedExp: PrioritizedExperience = {
      ...experience,
      priority: priority ?? 1.0,
    };

    if (this.buffer.length < this.maxSize) {
      // Buffer not full yet, just append
      this.buffer.push(prioritizedExp);
    } else {
      // Buffer full, overwrite oldest (circular buffer)
      this.buffer[this.position] = prioritizedExp;
    }

    this.position = (this.position + 1) % this.maxSize;
  }

  /**
   * Sample batch of experiences
   */
  sample(batchSize: number): Experience[] {
    if (this.buffer.length === 0) {
      return [];
    }

    const actualBatchSize = Math.min(batchSize, this.buffer.length);

    if (this.prioritized) {
      return this.samplePrioritized(actualBatchSize);
    } else {
      return this.sampleUniform(actualBatchSize);
    }
  }

  /**
   * Uniform random sampling
   */
  private sampleUniform(batchSize: number): Experience[] {
    const batch: Experience[] = [];
    const indices = new Set<number>();

    while (indices.size < batchSize) {
      const idx = Math.floor(Math.random() * this.buffer.length);
      indices.add(idx);
    }

    indices.forEach((idx) => {
      batch.push(this.buffer[idx]);
    });

    return batch;
  }

  /**
   * Prioritized sampling (higher priority = more likely to be sampled)
   */
  private samplePrioritized(batchSize: number): Experience[] {
    // Calculate total priority
    const totalPriority = this.buffer.reduce(
      (sum, exp) => sum + exp.priority,
      0
    );

    const batch: Experience[] = [];
    const sampled = new Set<number>();

    while (batch.length < batchSize && sampled.size < this.buffer.length) {
      // Sample based on priority distribution
      let random = Math.random() * totalPriority;
      let idx = 0;

      for (let i = 0; i < this.buffer.length; i++) {
        if (sampled.has(i)) continue;

        random -= this.buffer[i].priority;
        if (random <= 0) {
          idx = i;
          break;
        }
      }

      if (!sampled.has(idx)) {
        batch.push(this.buffer[idx]);
        sampled.add(idx);
      }
    }

    return batch;
  }

  /**
   * Update priority of experiences (for prioritized replay)
   */
  updatePriorities(indices: number[], priorities: number[]): void {
    if (!this.prioritized) return;

    for (let i = 0; i < indices.length; i++) {
      const idx = indices[i];
      if (idx >= 0 && idx < this.buffer.length) {
        this.buffer[idx].priority = priorities[i];
      }
    }
  }

  /**
   * Get buffer size
   */
  size(): number {
    return this.buffer.length;
  }

  /**
   * Check if buffer is ready for training
   */
  isReady(minSize: number): boolean {
    return this.buffer.length >= minSize;
  }

  /**
   * Clear buffer
   */
  clear(): void {
    this.buffer = [];
    this.position = 0;
  }

  /**
   * Get statistics about buffer
   */
  getStats(): {
    size: number;
    avgReward: number;
    successRate: number;
    avgPriority: number;
  } {
    if (this.buffer.length === 0) {
      return {
        size: 0,
        avgReward: 0,
        successRate: 0,
        avgPriority: 0,
      };
    }

    const totalReward = this.buffer.reduce((sum, exp) => sum + exp.reward, 0);
    const successCount = this.buffer.filter(
      (exp) => exp.reward > 0
    ).length;
    const totalPriority = this.buffer.reduce(
      (sum, exp) => sum + exp.priority,
      0
    );

    return {
      size: this.buffer.length,
      avgReward: totalReward / this.buffer.length,
      successRate: successCount / this.buffer.length,
      avgPriority: totalPriority / this.buffer.length,
    };
  }

  /**
   * Get recent experiences (last N)
   */
  getRecent(n: number): Experience[] {
    const count = Math.min(n, this.buffer.length);
    const startIdx = Math.max(0, this.position - count);

    if (startIdx >= 0 && this.position <= this.buffer.length) {
      return this.buffer.slice(startIdx, this.position);
    }

    // Handle circular buffer wrap-around
    const end = this.buffer.slice(startIdx);
    const start = this.buffer.slice(0, this.position);
    return [...end, ...start];
  }

  /**
   * Save buffer to JSON (for persistence)
   */
  toJSON(): string {
    return JSON.stringify({
      buffer: this.buffer,
      position: this.position,
      maxSize: this.maxSize,
      prioritized: this.prioritized,
    });
  }

  /**
   * Load buffer from JSON
   */
  static fromJSON(json: string): ExperienceReplayBuffer {
    const data = JSON.parse(json);
    const buffer = new ExperienceReplayBuffer(data.maxSize, data.prioritized);
    buffer.buffer = data.buffer;
    buffer.position = data.position;
    return buffer;
  }

  /**
   * Filter experiences by criteria
   */
  filter(
    predicate: (exp: Experience) => boolean
  ): Experience[] {
    return this.buffer.filter(predicate);
  }

  /**
   * Get experiences with high reward (top K%)
   */
  getTopExperiences(percentile: number = 0.1): Experience[] {
    if (this.buffer.length === 0) return [];

    const sorted = [...this.buffer].sort((a, b) => b.reward - a.reward);
    const count = Math.ceil(this.buffer.length * percentile);
    return sorted.slice(0, count);
  }
}
