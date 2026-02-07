/**
 * Orchestrator Kit Enterprise - Audit Logger
 *
 * Comprehensive audit logging for compliance (GDPR, HIPAA, SOC 2)
 */

import { v4 as uuidv4 } from 'uuid';
import { AuditLog } from '../types';

/**
 * Audit action types
 */
export enum AuditAction {
  // User actions
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_ROLE_CHANGED = 'user.role_changed',
  USER_PASSWORD_CHANGED = 'user.password_changed',
  USER_MFA_ENABLED = 'user.mfa_enabled',
  USER_MFA_DISABLED = 'user.mfa_disabled',

  // Tenant actions
  TENANT_CREATED = 'tenant.created',
  TENANT_UPDATED = 'tenant.updated',
  TENANT_DELETED = 'tenant.deleted',
  TENANT_PLAN_CHANGED = 'tenant.plan_changed',
  TENANT_SUSPENDED = 'tenant.suspended',
  TENANT_ACTIVATED = 'tenant.activated',

  // Agent actions
  AGENT_CREATED = 'agent.created',
  AGENT_UPDATED = 'agent.updated',
  AGENT_DELETED = 'agent.deleted',
  AGENT_EXECUTED = 'agent.executed',

  // Settings actions
  SETTINGS_UPDATED = 'settings.updated',
  SSO_CONFIGURED = 'sso.configured',

  // Data actions
  DATA_EXPORTED = 'data.exported',
  DATA_IMPORTED = 'data.imported',
  DATA_DELETED = 'data.deleted',

  // Access actions
  ACCESS_GRANTED = 'access.granted',
  ACCESS_DENIED = 'access.denied',
}

/**
 * Audit log query options
 */
export interface AuditLogQuery {
  tenantId?: string;
  userId?: string;
  action?: AuditAction | string;
  resourceType?: string;
  resourceId?: string;
  startDate?: number;
  endDate?: number;
  status?: 'success' | 'failure';
  limit?: number;
  offset?: number;
}

/**
 * Audit Logger
 */
export class AuditLogger {
  private logs: Map<string, AuditLog> = new Map();
  private logsByTenant: Map<string, string[]> = new Map();

  /**
   * Log an action
   */
  log(params: {
    tenantId: string;
    userId: string;
    action: AuditAction | string;
    resourceType: string;
    resourceId?: string;
    changes?: AuditLog['changes'];
    ipAddress?: string;
    userAgent?: string;
    status?: 'success' | 'failure';
    error?: string;
  }): AuditLog {
    const log: AuditLog = {
      id: uuidv4(),
      tenantId: params.tenantId,
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      changes: params.changes,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: Date.now(),
      status: params.status ?? 'success',
      error: params.error,
    };

    this.logs.set(log.id, log);

    // Index by tenant
    const tenantLogs = this.logsByTenant.get(params.tenantId) ?? [];
    tenantLogs.push(log.id);
    this.logsByTenant.set(params.tenantId, tenantLogs);

    return log;
  }

  /**
   * Log successful action
   */
  logSuccess(params: {
    tenantId: string;
    userId: string;
    action: AuditAction | string;
    resourceType: string;
    resourceId?: string;
    changes?: AuditLog['changes'];
    ipAddress?: string;
    userAgent?: string;
  }): AuditLog {
    return this.log({
      ...params,
      status: 'success',
    });
  }

  /**
   * Log failed action
   */
  logFailure(params: {
    tenantId: string;
    userId: string;
    action: AuditAction | string;
    resourceType: string;
    resourceId?: string;
    error: string;
    ipAddress?: string;
    userAgent?: string;
  }): AuditLog {
    return this.log({
      ...params,
      status: 'failure',
    });
  }

  /**
   * Query audit logs
   */
  query(query: AuditLogQuery): AuditLog[] {
    let logs = Array.from(this.logs.values());

    // Filter by tenant
    if (query.tenantId) {
      logs = logs.filter((log) => log.tenantId === query.tenantId);
    }

    // Filter by user
    if (query.userId) {
      logs = logs.filter((log) => log.userId === query.userId);
    }

    // Filter by action
    if (query.action) {
      logs = logs.filter((log) => log.action === query.action);
    }

    // Filter by resource type
    if (query.resourceType) {
      logs = logs.filter((log) => log.resourceType === query.resourceType);
    }

    // Filter by resource ID
    if (query.resourceId) {
      logs = logs.filter((log) => log.resourceId === query.resourceId);
    }

    // Filter by date range
    if (query.startDate) {
      logs = logs.filter((log) => log.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      logs = logs.filter((log) => log.timestamp <= query.endDate!);
    }

    // Filter by status
    if (query.status) {
      logs = logs.filter((log) => log.status === query.status);
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => b.timestamp - a.timestamp);

    // Apply pagination
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 100;
    logs = logs.slice(offset, offset + limit);

    return logs;
  }

  /**
   * Get logs for tenant
   */
  getTenantLogs(tenantId: string, limit: number = 100): AuditLog[] {
    return this.query({ tenantId, limit });
  }

  /**
   * Get logs for user
   */
  getUserLogs(userId: string, limit: number = 100): AuditLog[] {
    return this.query({ userId, limit });
  }

  /**
   * Get logs for resource
   */
  getResourceLogs(
    resourceType: string,
    resourceId: string,
    limit: number = 100
  ): AuditLog[] {
    return this.query({ resourceType, resourceId, limit });
  }

  /**
   * Get failed actions
   */
  getFailedActions(tenantId: string, limit: number = 100): AuditLog[] {
    return this.query({ tenantId, status: 'failure', limit });
  }

  /**
   * Get logs by action type
   */
  getActionLogs(
    tenantId: string,
    action: AuditAction | string,
    limit: number = 100
  ): AuditLog[] {
    return this.query({ tenantId, action, limit });
  }

  /**
   * Export logs (for compliance)
   */
  export(query: AuditLogQuery): string {
    const logs = this.query(query);

    // Export as CSV
    const headers = [
      'ID',
      'Timestamp',
      'Tenant ID',
      'User ID',
      'Action',
      'Resource Type',
      'Resource ID',
      'Status',
      'IP Address',
      'Error',
    ];

    const rows = logs.map((log) => [
      log.id,
      new Date(log.timestamp).toISOString(),
      log.tenantId,
      log.userId,
      log.action,
      log.resourceType,
      log.resourceId ?? '',
      log.status,
      log.ipAddress ?? '',
      log.error ?? '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  }

  /**
   * Delete old logs (for data retention compliance)
   */
  deleteOldLogs(olderThan: number): number {
    let deletedCount = 0;
    const cutoffDate = Date.now() - olderThan;

    for (const [logId, log] of this.logs.entries()) {
      if (log.timestamp < cutoffDate) {
        this.logs.delete(logId);

        // Remove from tenant index
        const tenantLogs = this.logsByTenant.get(log.tenantId) ?? [];
        const index = tenantLogs.indexOf(logId);
        if (index !== -1) {
          tenantLogs.splice(index, 1);
          this.logsByTenant.set(log.tenantId, tenantLogs);
        }

        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get statistics
   */
  getStatistics(tenantId?: string): {
    totalLogs: number;
    successCount: number;
    failureCount: number;
    topActions: Array<{ action: string; count: number }>;
    topUsers: Array<{ userId: string; count: number }>;
  } {
    let logs = Array.from(this.logs.values());

    if (tenantId) {
      logs = logs.filter((log) => log.tenantId === tenantId);
    }

    const successCount = logs.filter((log) => log.status === 'success').length;
    const failureCount = logs.filter((log) => log.status === 'failure').length;

    // Count actions
    const actionCounts = new Map<string, number>();
    for (const log of logs) {
      actionCounts.set(log.action, (actionCounts.get(log.action) ?? 0) + 1);
    }

    const topActions = Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Count users
    const userCounts = new Map<string, number>();
    for (const log of logs) {
      userCounts.set(log.userId, (userCounts.get(log.userId) ?? 0) + 1);
    }

    const topUsers = Array.from(userCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalLogs: logs.length,
      successCount,
      failureCount,
      topActions,
      topUsers,
    };
  }

  /**
   * Clear all logs (use with caution!)
   */
  clear(): void {
    this.logs.clear();
    this.logsByTenant.clear();
  }
}
