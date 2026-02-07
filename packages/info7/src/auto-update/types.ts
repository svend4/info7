/**
 * Auto-Update System Types
 *
 * Types for automatic knowledge base synchronization and updates.
 */

import { KnowledgeNode, KnowledgeEdge } from '../knowledge-graph/types';

/**
 * Update source types
 */
export enum SourceType {
  FILE_SYSTEM = 'file-system',
  DATABASE = 'database',
  API = 'api',
  STREAM = 'stream',
  GIT = 'git',
  WEBHOOK = 'webhook',
}

/**
 * Update source configuration
 */
export interface UpdateSource {
  id: string;
  type: SourceType;
  name: string;
  config: {
    // File system
    path?: string;
    pattern?: string;
    recursive?: boolean;

    // Database
    connectionString?: string;
    query?: string;

    // API
    url?: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    auth?: {
      type: 'bearer' | 'basic' | 'api-key';
      credentials: Record<string, string>;
    };

    // Stream
    topic?: string;
    consumerGroup?: string;

    // Git
    repository?: string;
    branch?: string;
    paths?: string[];

    // Webhook
    endpoint?: string;
    secret?: string;
  };
  pollInterval?: number;  // milliseconds, 0 = manual only
  enabled: boolean;
  filters?: {
    include?: string[];
    exclude?: string[];
  };
  transform?: {
    type: 'json' | 'xml' | 'csv' | 'markdown' | 'custom';
    customParser?: string;
  };
}

/**
 * Update strategy
 */
export enum UpdateStrategy {
  MERGE = 'merge',              // Merge with existing data
  REPLACE = 'replace',          // Replace existing data
  APPEND = 'append',            // Only add new data
  INCREMENTAL = 'incremental',  // Track and apply changes
}

/**
 * Conflict resolution strategy
 */
export enum ConflictResolution {
  NEWER = 'newer',                    // Prefer newer timestamp
  HIGHER_CONFIDENCE = 'higher-confidence',  // Prefer higher confidence
  SOURCE_PRIORITY = 'source-priority',      // Based on source priority
  MANUAL = 'manual',                  // Require manual resolution
}

/**
 * Update change
 */
export interface UpdateChange {
  id: string;
  timestamp: number;
  sourceId: string;
  changeType: 'node-add' | 'node-update' | 'node-delete' | 'edge-add' | 'edge-update' | 'edge-delete';
  target: {
    id: string;
    type: 'node' | 'edge';
  };
  before?: Partial<KnowledgeNode | KnowledgeEdge>;
  after?: Partial<KnowledgeNode | KnowledgeEdge>;
  metadata: {
    sourceVersion?: string;
    checksum?: string;
    author?: string;
  };
}

/**
 * Update batch
 */
export interface UpdateBatch {
  id: string;
  sourceId: string;
  timestamp: number;
  changes: UpdateChange[];
  statistics: {
    nodesAdded: number;
    nodesUpdated: number;
    nodesDeleted: number;
    edgesAdded: number;
    edgesUpdated: number;
    edgesDeleted: number;
    conflicts: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  errors?: Array<{
    changeId: string;
    error: string;
  }>;
}

/**
 * Conflict
 */
export interface Conflict {
  id: string;
  timestamp: number;
  targetId: string;
  targetType: 'node' | 'edge';
  sourceId: string;
  existingValue: any;
  newValue: any;
  resolution?: ConflictResolution;
  resolvedValue?: any;
  resolvedAt?: number;
  resolvedBy?: string;
}

/**
 * Synchronization status
 */
export interface SyncStatus {
  sourceId: string;
  lastSync: number;
  nextSync?: number;
  status: 'idle' | 'syncing' | 'error';
  lastBatchId?: string;
  consecutiveErrors: number;
  statistics: {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    totalChangesApplied: number;
    avgSyncDuration: number;
  };
}

/**
 * Update notification
 */
export interface UpdateNotification {
  id: string;
  timestamp: number;
  type: 'sync-started' | 'sync-completed' | 'sync-failed' | 'conflict-detected' | 'batch-applied';
  sourceId: string;
  batchId?: string;
  message: string;
  metadata: Record<string, any>;
}

/**
 * Auto-update configuration
 */
export interface AutoUpdateConfig {
  enabled: boolean;
  sources: UpdateSource[];
  strategy: UpdateStrategy;
  conflictResolution: ConflictResolution;
  sourcePriority?: string[];  // Source IDs in priority order
  notifications: {
    enabled: boolean;
    channels: Array<'log' | 'webhook' | 'email'>;
    webhookUrl?: string;
    emailRecipients?: string[];
  };
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  validation: {
    enabled: boolean;
    strictMode: boolean;
    customValidators?: string[];
  };
}

/**
 * Auto-update statistics
 */
export interface AutoUpdateStatistics {
  sources: Map<string, {
    totalSyncs: number;
    successRate: number;
    avgDuration: number;
    lastSync: number;
    totalChanges: number;
  }>;
  overall: {
    totalBatches: number;
    totalChanges: number;
    totalConflicts: number;
    resolvedConflicts: number;
    unresolvedConflicts: number;
    avgBatchSize: number;
  };
  performance: {
    avgProcessingTime: number;
    peakProcessingTime: number;
    throughput: number;  // changes per second
  };
}
