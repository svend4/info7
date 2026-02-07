/**
 * Orchestrator Kit Enterprise
 *
 * Enterprise features for multi-tenant SaaS deployment
 */

// Types
export * from './types';

// Multi-tenancy
export { TenantManager } from './multi-tenancy/tenant-manager';
export { UserManager } from './multi-tenancy/user-manager';

// RBAC
export { AccessControl, RequirePermission, RequireRole } from './rbac/access-control';
export type { AccessResult } from './rbac/access-control';

// Audit
export { AuditLogger, AuditAction } from './audit/audit-logger';
export type { AuditLogQuery } from './audit/audit-logger';

// Examples
export { runEnterpriseExample } from './example';
export { runIntegrationExample } from './integration-example';
