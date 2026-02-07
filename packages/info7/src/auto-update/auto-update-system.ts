/**
 * Auto-Update System
 *
 * Automatic knowledge base synchronization and update management.
 */

import { Logger, MetricsCollector, AppError } from '@info7/common';
import { KnowledgeGraphEngine } from '../knowledge-graph';
import {
  AutoUpdateConfig,
  UpdateSource,
  UpdateBatch,
  UpdateChange,
  Conflict,
  SyncStatus,
  UpdateNotification,
  UpdateStrategy,
  ConflictResolution,
  SourceType,
  AutoUpdateStatistics,
} from './types';

/**
 * Auto-Update System - manages automatic knowledge base updates
 */
export class AutoUpdateSystem {
  private logger: Logger;
  private metrics: MetricsCollector;
  private config: AutoUpdateConfig;
  private graphEngine: KnowledgeGraphEngine;

  private syncStatuses = new Map<string, SyncStatus>();
  private batches: UpdateBatch[] = [];
  private conflicts: Conflict[] = [];
  private notifications: UpdateNotification[] = [];
  private syncTimers = new Map<string, NodeJS.Timeout>();

  // Statistics
  private stats = {
    totalBatches: 0,
    totalChanges: 0,
    totalConflicts: 0,
    processingTimes: [] as number[],
  };

  constructor(
    graphEngine: KnowledgeGraphEngine,
    config: Partial<AutoUpdateConfig> = {}
  ) {
    this.logger = new Logger('auto-update');
    this.metrics = new MetricsCollector('auto-update');
    this.graphEngine = graphEngine;

    this.config = {
      enabled: true,
      sources: [],
      strategy: UpdateStrategy.MERGE,
      conflictResolution: ConflictResolution.NEWER,
      notifications: {
        enabled: true,
        channels: ['log'],
      },
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
      },
      validation: {
        enabled: true,
        strictMode: false,
      },
      ...config,
    };

    this.logger.info('Auto-Update System initialized', { config: this.config });
  }

  /**
   * Start auto-update system
   */
  start(): void {
    if (!this.config.enabled) {
      this.logger.warn('Auto-update is disabled');
      return;
    }

    this.logger.info('Starting auto-update system');

    for (const source of this.config.sources) {
      if (source.enabled) {
        this.startSourceSync(source);
      }
    }
  }

  /**
   * Stop auto-update system
   */
  stop(): void {
    this.logger.info('Stopping auto-update system');

    for (const [sourceId, timer] of this.syncTimers) {
      clearTimeout(timer);
      this.syncTimers.delete(sourceId);
      this.logger.debug(`Stopped sync timer for source: ${sourceId}`);
    }
  }

  /**
   * Add update source
   */
  addSource(source: UpdateSource): void {
    // Check if source already exists
    if (this.config.sources.find(s => s.id === source.id)) {
      throw new AppError('Source already exists', 'SOURCE_EXISTS');
    }

    this.config.sources.push(source);

    // Initialize sync status
    this.syncStatuses.set(source.id, {
      sourceId: source.id,
      lastSync: 0,
      status: 'idle',
      consecutiveErrors: 0,
      statistics: {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        totalChangesApplied: 0,
        avgSyncDuration: 0,
      },
    });

    // Start sync if enabled
    if (this.config.enabled && source.enabled) {
      this.startSourceSync(source);
    }

    this.logger.info(`Source added: ${source.id}`);
  }

  /**
   * Remove update source
   */
  removeSource(sourceId: string): void {
    const index = this.config.sources.findIndex(s => s.id === sourceId);
    if (index === -1) {
      throw new AppError('Source not found', 'SOURCE_NOT_FOUND');
    }

    // Stop sync timer
    const timer = this.syncTimers.get(sourceId);
    if (timer) {
      clearTimeout(timer);
      this.syncTimers.delete(sourceId);
    }

    this.config.sources.splice(index, 1);
    this.syncStatuses.delete(sourceId);

    this.logger.info(`Source removed: ${sourceId}`);
  }

  /**
   * Manually trigger sync for a source
   */
  async syncSource(sourceId: string): Promise<UpdateBatch> {
    const source = this.config.sources.find(s => s.id === sourceId);
    if (!source) {
      throw new AppError('Source not found', 'SOURCE_NOT_FOUND');
    }

    this.logger.info(`Manual sync triggered for source: ${sourceId}`);
    return await this.performSync(source);
  }

  /**
   * Get sync status for a source
   */
  getSyncStatus(sourceId: string): SyncStatus | undefined {
    return this.syncStatuses.get(sourceId);
  }

  /**
   * Get all sync statuses
   */
  getAllSyncStatuses(): SyncStatus[] {
    return Array.from(this.syncStatuses.values());
  }

  /**
   * Get unresolved conflicts
   */
  getUnresolvedConflicts(): Conflict[] {
    return this.conflicts.filter(c => !c.resolution);
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(
    conflictId: string,
    resolution: ConflictResolution,
    resolvedValue?: any
  ): Promise<void> {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) {
      throw new AppError('Conflict not found', 'CONFLICT_NOT_FOUND');
    }

    conflict.resolution = resolution;
    conflict.resolvedAt = Date.now();

    if (resolvedValue !== undefined) {
      conflict.resolvedValue = resolvedValue;
    } else {
      // Apply automatic resolution
      conflict.resolvedValue = this.autoResolveConflict(conflict, resolution);
    }

    // Apply resolved value to graph
    await this.applyConflictResolution(conflict);

    this.logger.info(`Conflict resolved: ${conflictId} using ${resolution}`);
  }

  /**
   * Get recent notifications
   */
  getNotifications(limit: number = 10): UpdateNotification[] {
    return this.notifications.slice(-limit);
  }

  /**
   * Get statistics
   */
  getStatistics(): AutoUpdateStatistics {
    const sourceStats = new Map();

    for (const [sourceId, status] of this.syncStatuses) {
      sourceStats.set(sourceId, {
        totalSyncs: status.statistics.totalSyncs,
        successRate: status.statistics.totalSyncs > 0
          ? status.statistics.successfulSyncs / status.statistics.totalSyncs
          : 0,
        avgDuration: status.statistics.avgSyncDuration,
        lastSync: status.lastSync,
        totalChanges: status.statistics.totalChangesApplied,
      });
    }

    const resolvedConflicts = this.conflicts.filter(c => c.resolution).length;
    const unresolvedConflicts = this.conflicts.length - resolvedConflicts;

    const avgBatchSize = this.batches.length > 0
      ? this.batches.reduce((sum, b) => sum + b.changes.length, 0) / this.batches.length
      : 0;

    const avgProcessingTime = this.stats.processingTimes.length > 0
      ? this.stats.processingTimes.reduce((sum, t) => sum + t, 0) / this.stats.processingTimes.length
      : 0;

    const peakProcessingTime = this.stats.processingTimes.length > 0
      ? Math.max(...this.stats.processingTimes)
      : 0;

    const throughput = avgProcessingTime > 0
      ? (avgBatchSize / avgProcessingTime) * 1000
      : 0;

    return {
      sources: sourceStats,
      overall: {
        totalBatches: this.stats.totalBatches,
        totalChanges: this.stats.totalChanges,
        totalConflicts: this.stats.totalConflicts,
        resolvedConflicts,
        unresolvedConflicts,
        avgBatchSize,
      },
      performance: {
        avgProcessingTime,
        peakProcessingTime,
        throughput,
      },
    };
  }

  // ===== Private Methods =====

  private startSourceSync(source: UpdateSource): void {
    if (!source.pollInterval || source.pollInterval === 0) {
      this.logger.debug(`Source ${source.id} is manual-only`);
      return;
    }

    const sync = async () => {
      try {
        await this.performSync(source);
      } catch (error) {
        this.logger.error(`Sync failed for source ${source.id}:`, error);
      }

      // Schedule next sync
      if (source.enabled && this.config.enabled) {
        const timer = setTimeout(sync, source.pollInterval);
        this.syncTimers.set(source.id, timer);
      }
    };

    // Start initial sync
    sync();
    this.logger.info(`Started sync for source: ${source.id} (interval: ${source.pollInterval}ms)`);
  }

  private async performSync(source: UpdateSource): Promise<UpdateBatch> {
    const startTime = Date.now();
    const status = this.syncStatuses.get(source.id);

    if (!status) {
      throw new AppError('Sync status not found', 'STATUS_NOT_FOUND');
    }

    try {
      status.status = 'syncing';
      this.notifyUpdate({
        id: `notify-${Date.now()}`,
        timestamp: Date.now(),
        type: 'sync-started',
        sourceId: source.id,
        message: `Sync started for ${source.name}`,
        metadata: {},
      });

      // Fetch changes from source
      const changes = await this.fetchChanges(source);

      if (changes.length === 0) {
        this.logger.debug(`No changes from source: ${source.id}`);
        status.status = 'idle';
        status.lastSync = Date.now();
        return this.createEmptyBatch(source.id);
      }

      // Create update batch
      const batch: UpdateBatch = {
        id: `batch-${Date.now()}`,
        sourceId: source.id,
        timestamp: Date.now(),
        changes,
        statistics: {
          nodesAdded: 0,
          nodesUpdated: 0,
          nodesDeleted: 0,
          edgesAdded: 0,
          edgesUpdated: 0,
          edgesDeleted: 0,
          conflicts: 0,
        },
        status: 'processing',
      };

      // Apply changes
      await this.applyBatch(batch);

      // Update status
      status.status = 'idle';
      status.lastSync = Date.now();
      status.lastBatchId = batch.id;
      status.consecutiveErrors = 0;
      status.statistics.totalSyncs++;
      status.statistics.successfulSyncs++;
      status.statistics.totalChangesApplied += changes.length;

      const duration = Date.now() - startTime;
      status.statistics.avgSyncDuration =
        (status.statistics.avgSyncDuration * (status.statistics.totalSyncs - 1) + duration) /
        status.statistics.totalSyncs;

      // Update statistics
      this.stats.totalBatches++;
      this.stats.totalChanges += changes.length;
      this.stats.processingTimes.push(duration);

      this.batches.push(batch);
      this.metrics.recordValue('sync_duration', duration);

      this.notifyUpdate({
        id: `notify-${Date.now()}`,
        timestamp: Date.now(),
        type: 'sync-completed',
        sourceId: source.id,
        batchId: batch.id,
        message: `Sync completed: ${changes.length} changes applied`,
        metadata: { duration, changes: changes.length },
      });

      this.logger.info(`Sync completed for ${source.id}`, {
        changes: changes.length,
        duration,
      });

      return batch;
    } catch (error) {
      status.status = 'error';
      status.consecutiveErrors++;
      status.statistics.failedSyncs++;

      this.notifyUpdate({
        id: `notify-${Date.now()}`,
        timestamp: Date.now(),
        type: 'sync-failed',
        sourceId: source.id,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error },
      });

      this.logger.error(`Sync failed for ${source.id}:`, error);
      throw new AppError('Sync failed', 'SYNC_ERROR', error);
    }
  }

  private async fetchChanges(source: UpdateSource): Promise<UpdateChange[]> {
    const changes: UpdateChange[] = [];

    switch (source.type) {
      case SourceType.FILE_SYSTEM:
        // Simulated file system fetch
        this.logger.debug(`Fetching from file system: ${source.config.path}`);
        break;

      case SourceType.API:
        // Simulated API fetch
        this.logger.debug(`Fetching from API: ${source.config.url}`);
        break;

      case SourceType.DATABASE:
        // Simulated database fetch
        this.logger.debug(`Fetching from database`);
        break;

      case SourceType.GIT:
        // Simulated Git fetch
        this.logger.debug(`Fetching from Git: ${source.config.repository}`);
        break;

      default:
        this.logger.warn(`Unsupported source type: ${source.type}`);
    }

    // For demo purposes, return empty array
    // In production, would fetch real changes from source
    return changes;
  }

  private async applyBatch(batch: UpdateBatch): Promise<void> {
    const errors: UpdateBatch['errors'] = [];

    for (const change of batch.changes) {
      try {
        await this.applyChange(change, batch);
      } catch (error) {
        errors.push({
          changeId: change.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        this.logger.error(`Failed to apply change ${change.id}:`, error);
      }
    }

    if (errors.length > 0) {
      batch.errors = errors;
      batch.status = errors.length === batch.changes.length ? 'failed' : 'partial';
    } else {
      batch.status = 'completed';
    }

    this.notifyUpdate({
      id: `notify-${Date.now()}`,
      timestamp: Date.now(),
      type: 'batch-applied',
      sourceId: batch.sourceId,
      batchId: batch.id,
      message: `Batch applied: ${batch.changes.length - errors.length}/${batch.changes.length} changes successful`,
      metadata: { batch },
    });
  }

  private async applyChange(change: UpdateChange, batch: UpdateBatch): Promise<void> {
    switch (change.changeType) {
      case 'node-add':
        if (change.after) {
          // Check for conflicts
          const existing = this.checkNodeExists(change.target.id);
          if (existing) {
            await this.handleConflict(change, batch, existing);
          } else {
            this.graphEngine.addNode(change.after as any);
            batch.statistics.nodesAdded++;
          }
        }
        break;

      case 'node-update':
        if (change.after) {
          const existing = this.checkNodeExists(change.target.id);
          if (existing) {
            this.graphEngine.updateNode(change.target.id, change.after as any);
            batch.statistics.nodesUpdated++;
          }
        }
        break;

      case 'node-delete':
        this.graphEngine.removeNode(change.target.id);
        batch.statistics.nodesDeleted++;
        break;

      case 'edge-add':
        if (change.after) {
          this.graphEngine.addEdge(change.after as any);
          batch.statistics.edgesAdded++;
        }
        break;

      case 'edge-update':
        // Edge update would require custom logic
        batch.statistics.edgesUpdated++;
        break;

      case 'edge-delete':
        this.graphEngine.removeEdge(change.target.id);
        batch.statistics.edgesDeleted++;
        break;
    }
  }

  private checkNodeExists(nodeId: string): any {
    // Would check if node exists in graph engine
    return null;
  }

  private async handleConflict(
    change: UpdateChange,
    batch: UpdateBatch,
    existing: any
  ): Promise<void> {
    const conflict: Conflict = {
      id: `conflict-${Date.now()}`,
      timestamp: Date.now(),
      targetId: change.target.id,
      targetType: change.target.type,
      sourceId: batch.sourceId,
      existingValue: existing,
      newValue: change.after,
    };

    batch.statistics.conflicts++;
    this.stats.totalConflicts++;
    this.conflicts.push(conflict);

    this.notifyUpdate({
      id: `notify-${Date.now()}`,
      timestamp: Date.now(),
      type: 'conflict-detected',
      sourceId: batch.sourceId,
      message: `Conflict detected for ${change.target.type} ${change.target.id}`,
      metadata: { conflict },
    });

    // Auto-resolve if configured
    if (this.config.conflictResolution !== ConflictResolution.MANUAL) {
      await this.resolveConflict(conflict.id, this.config.conflictResolution);
    }
  }

  private autoResolveConflict(conflict: Conflict, resolution: ConflictResolution): any {
    switch (resolution) {
      case ConflictResolution.NEWER:
        // Prefer newer timestamp
        const existingTime = conflict.existingValue?.metadata?.updatedAt || 0;
        const newTime = conflict.newValue?.metadata?.updatedAt || 0;
        return newTime > existingTime ? conflict.newValue : conflict.existingValue;

      case ConflictResolution.HIGHER_CONFIDENCE:
        // Prefer higher confidence
        const existingConf = conflict.existingValue?.metadata?.confidence || 0;
        const newConf = conflict.newValue?.metadata?.confidence || 0;
        return newConf > existingConf ? conflict.newValue : conflict.existingValue;

      case ConflictResolution.SOURCE_PRIORITY:
        // Based on source priority
        if (this.config.sourcePriority) {
          const priority = this.config.sourcePriority.indexOf(conflict.sourceId);
          return priority >= 0 ? conflict.newValue : conflict.existingValue;
        }
        return conflict.existingValue;

      default:
        return conflict.existingValue;
    }
  }

  private async applyConflictResolution(conflict: Conflict): Promise<void> {
    if (conflict.targetType === 'node') {
      this.graphEngine.updateNode(conflict.targetId, conflict.resolvedValue);
    }
    // Edge resolution would be handled similarly
  }

  private createEmptyBatch(sourceId: string): UpdateBatch {
    return {
      id: `batch-${Date.now()}`,
      sourceId,
      timestamp: Date.now(),
      changes: [],
      statistics: {
        nodesAdded: 0,
        nodesUpdated: 0,
        nodesDeleted: 0,
        edgesAdded: 0,
        edgesUpdated: 0,
        edgesDeleted: 0,
        conflicts: 0,
      },
      status: 'completed',
    };
  }

  private notifyUpdate(notification: UpdateNotification): void {
    this.notifications.push(notification);

    // Keep only recent notifications
    if (this.notifications.length > 1000) {
      this.notifications.shift();
    }

    // Send notifications based on configuration
    if (this.config.notifications.enabled) {
      for (const channel of this.config.notifications.channels) {
        switch (channel) {
          case 'log':
            this.logger.info(`[NOTIFICATION] ${notification.message}`);
            break;
          case 'webhook':
            // Would send to webhook
            break;
          case 'email':
            // Would send email
            break;
        }
      }
    }
  }
}
