/**
 * Orchestrator Kit Enterprise - Common Utilities Integration Example
 *
 * Demonstrates integration of @info7/common utilities:
 * - Logger: Structured logging for tenant operations and user management
 * - MetricsCollector: Usage tracking and performance metrics
 * - AppError: Standardized error handling for enterprise features
 * - Validator: Schema validation for tenant and user data
 * - HealthCheckManager: Multi-tenant system health monitoring
 */

import {
  Logger,
  MetricsCollector,
  AppError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ConfigManager,
  Validator,
  HealthCheckManager,
  HealthStatus,
  commonSchemas,
} from '@info7/common';

import { TenantManager } from './multi-tenancy/tenant-manager';
import { UserManager } from './multi-tenancy/user-manager';
import { AccessControl } from './rbac/access-control';
import { AuditLogger, AuditAction } from './audit/audit-logger';
import { PlanLevel, UserRole, Permission } from './types';
import { z } from 'zod';

/**
 * Orchestrator Kit Enterprise Service with Common Utilities Integration
 */
export class OrchestratorEnterpriseService {
  private logger: Logger;
  private metrics: MetricsCollector;
  private config: ConfigManager;
  private validator: Validator;
  private health: HealthCheckManager;
  private tenantManager: TenantManager;
  private userManager: UserManager;
  private accessControl: AccessControl;
  private auditLogger: AuditLogger;

  // Validation schemas
  private tenantCreateSchema = z.object({
    name: z.string().min(1).max(100),
    subdomain: z.string().regex(/^[a-z0-9-]+$/),
    plan: z.nativeEnum(PlanLevel),
    ownerId: commonSchemas.uuid,
    contactEmail: commonSchemas.email,
  });

  private userCreateSchema = z.object({
    email: commonSchemas.email,
    name: z.string().min(1).max(100),
    password: commonSchemas.strongPassword,
    tenantId: commonSchemas.uuid,
    role: z.nativeEnum(UserRole),
  });

  constructor() {
    // Initialize common utilities
    this.logger = new Logger({
      level: 'info',
      context: { service: 'orchestrator-enterprise' },
    });

    this.metrics = new MetricsCollector();
    this.config = new ConfigManager();
    this.validator = new Validator();
    this.health = new HealthCheckManager({ version: '1.0.0' });

    this.logger.info('Orchestrator Kit Enterprise Service initializing');

    // Initialize enterprise components
    this.tenantManager = new TenantManager();
    this.userManager = new UserManager();
    this.accessControl = new AccessControl(this.userManager);
    this.auditLogger = new AuditLogger();

    // Register health checks
    this.registerHealthChecks();

    this.logger.info('Orchestrator Kit Enterprise Service initialized successfully');
  }

  /**
   * Register health checks for enterprise components
   */
  private registerHealthChecks(): void {
    // Tenant Manager health check
    this.health.registerCheck('tenant-manager', async () => {
      try {
        const stats = this.tenantManager.getStatistics();
        const isHealthy = stats.total > 0;

        return {
          status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
          message: isHealthy ? 'Tenant manager operational' : 'No tenants registered',
          metadata: {
            totalTenants: stats.total,
            freePlan: stats.byPlan.free,
            proPlan: stats.byPlan.pro,
            enterprisePlan: stats.byPlan.enterprise,
          },
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'Tenant manager check failed',
        };
      }
    });

    // User Manager health check
    this.health.registerCheck('user-manager', async () => {
      try {
        const users = this.userManager.getAllUsers();
        const isHealthy = users.length > 0;

        return {
          status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
          message: isHealthy ? 'User manager operational' : 'No users registered',
          metadata: {
            totalUsers: users.length,
            verifiedUsers: users.filter(u => u.emailVerified).length,
            mfaEnabled: users.filter(u => u.mfaEnabled).length,
          },
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'User manager check failed',
        };
      }
    });

    // Audit Logger health check
    this.health.registerCheck('audit-logger', async () => {
      try {
        const allLogs = this.auditLogger.query({});
        const recentLogs = this.auditLogger.query({
          startDate: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
        });

        return {
          status: HealthStatus.HEALTHY,
          message: 'Audit logger operational',
          metadata: {
            totalLogs: allLogs.length,
            last24Hours: recentLogs.length,
          },
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'Audit logger check failed',
        };
      }
    });

    this.logger.info('Health checks registered');
  }

  /**
   * Create tenant with validation and logging
   */
  async createTenant(params: {
    name: string;
    subdomain: string;
    plan: PlanLevel;
    ownerId: string;
    contactEmail: string;
  }) {
    // Validate input
    const validatedData = this.validator.validate(this.tenantCreateSchema, params);

    const tenantCounter = this.metrics.counter('enterprise.tenants.created', {
      plan: params.plan,
    });

    this.logger.info('Creating tenant', {
      name: params.name,
      subdomain: params.subdomain,
      plan: params.plan,
    });

    try {
      const tenant = await this.metrics.timeExecution(
        'enterprise.tenant.creation.duration',
        async () => {
          return this.tenantManager.createTenant(validatedData);
        },
        { plan: params.plan }
      );

      tenantCounter.inc();

      // Log audit event
      this.auditLogger.logSuccess({
        tenantId: tenant.id,
        userId: params.ownerId,
        action: AuditAction.TENANT_CREATED,
        resourceType: 'tenant',
        resourceId: tenant.id,
        changes: {
          before: null,
          after: { name: tenant.name, plan: tenant.plan },
        },
      });

      this.logger.info('Tenant created successfully', {
        tenantId: tenant.id,
        name: tenant.name,
      });

      return tenant;
    } catch (error) {
      this.logger.error('Failed to create tenant', error);

      // Log audit failure
      this.auditLogger.logFailure({
        tenantId: '',
        userId: params.ownerId,
        action: AuditAction.TENANT_CREATED,
        resourceType: 'tenant',
        resourceId: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new AppError(
        'Tenant creation failed',
        'TENANT_CREATE_FAILED',
        500,
        'high',
        { name: params.name }
      );
    }
  }

  /**
   * Create user with validation and logging
   */
  async createUser(params: {
    email: string;
    name: string;
    password: string;
    tenantId: string;
    role: UserRole;
  }) {
    // Validate input
    const validatedData = this.validator.validate(this.userCreateSchema, params);

    const userCounter = this.metrics.counter('enterprise.users.created', {
      role: params.role,
    });

    this.logger.info('Creating user', {
      email: params.email,
      tenantId: params.tenantId,
      role: params.role,
    });

    try {
      const user = await this.metrics.timeExecution(
        'enterprise.user.creation.duration',
        async () => {
          return await this.userManager.createUser(validatedData);
        },
        { role: params.role }
      );

      userCounter.inc();

      // Log audit event
      this.auditLogger.logSuccess({
        tenantId: params.tenantId,
        userId: user.id,
        action: AuditAction.USER_CREATED,
        resourceType: 'user',
        resourceId: user.id,
        changes: {
          before: null,
          after: { email: user.email, role: params.role },
        },
      });

      this.logger.info('User created successfully', {
        userId: user.id,
        email: user.email,
      });

      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error);

      // Log audit failure
      this.auditLogger.logFailure({
        tenantId: params.tenantId,
        userId: '',
        action: AuditAction.USER_CREATED,
        resourceType: 'user',
        resourceId: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new AppError(
        'User creation failed',
        'USER_CREATE_FAILED',
        500,
        'high',
        { email: params.email }
      );
    }
  }

  /**
   * Check access with logging and metrics
   */
  checkAccess(userId: string, tenantId: string, permission: Permission) {
    const accessCounter = this.metrics.counter('enterprise.access.checks', {
      permission,
    });
    accessCounter.inc();

    this.logger.debug('Checking access', {
      userId,
      tenantId,
      permission,
    });

    try {
      const result = this.accessControl.checkAccess(userId, tenantId, permission);

      // Track access result
      const resultCounter = this.metrics.counter('enterprise.access.results', {
        permission,
        granted: result.granted.toString(),
      });
      resultCounter.inc();

      // Log audit event
      if (result.granted) {
        this.auditLogger.logSuccess({
          tenantId,
          userId,
          action: AuditAction.ACCESS_GRANTED,
          resourceType: 'permission',
          resourceId: permission,
        });
      } else {
        this.auditLogger.logFailure({
          tenantId,
          userId,
          action: AuditAction.ACCESS_DENIED,
          resourceType: 'permission',
          resourceId: permission,
          error: result.reason || 'Permission denied',
        });
      }

      this.logger.debug('Access check completed', {
        userId,
        permission,
        granted: result.granted,
      });

      return result;
    } catch (error) {
      this.logger.error('Access check failed', error);
      throw new AuthorizationError('Access check failed');
    }
  }

  /**
   * Track tenant usage with metrics
   */
  trackTenantUsage(
    tenantId: string,
    usage: {
      apiCallsThisMonth?: number;
      currentUsers?: number;
      currentAgents?: number;
      storageUsedMB?: number;
    }
  ) {
    this.logger.debug('Tracking tenant usage', { tenantId, usage });

    try {
      this.tenantManager.trackUsage(tenantId, usage);

      // Record usage metrics
      if (usage.apiCallsThisMonth !== undefined) {
        this.metrics
          .gauge('enterprise.tenant.api_calls', { tenantId })
          .set(usage.apiCallsThisMonth);
      }
      if (usage.storageUsedMB !== undefined) {
        this.metrics
          .gauge('enterprise.tenant.storage_mb', { tenantId })
          .set(usage.storageUsedMB);
      }
      if (usage.currentUsers !== undefined) {
        this.metrics
          .gauge('enterprise.tenant.users', { tenantId })
          .set(usage.currentUsers);
      }

      this.logger.debug('Tenant usage tracked', { tenantId });
    } catch (error) {
      this.logger.error('Failed to track usage', error, { tenantId });
    }
  }

  /**
   * Check tenant limits with logging
   */
  checkTenantLimits(tenantId: string) {
    this.logger.debug('Checking tenant limits', { tenantId });

    const limitsCheck = this.tenantManager.checkLimits(tenantId);

    if (limitsCheck.exceeded) {
      this.logger.warn('Tenant exceeded limits', {
        tenantId,
        violations: limitsCheck.violations,
      });

      // Log audit event
      this.auditLogger.logFailure({
        tenantId,
        userId: '',
        action: 'tenant.limit_exceeded' as any,
        resourceType: 'tenant',
        resourceId: tenantId,
        error: `Limits exceeded: ${limitsCheck.violations.join(', ')}`,
      });
    }

    return limitsCheck;
  }

  /**
   * Get system health status
   */
  async getHealthStatus() {
    return await this.health.check();
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.metrics.export();
  }

  /**
   * Get comprehensive statistics
   */
  getStatistics() {
    const tenantStats = this.tenantManager.getStatistics();
    const userStats = { total: this.userManager.getAllUsers().length };
    const auditStats = this.auditLogger.getStatistics();
    const metrics = this.metrics.export();

    return {
      tenants: tenantStats,
      users: userStats,
      audit: auditStats,
      metrics: {
        tenantsCreated:
          metrics.find(m => m.name === 'enterprise.tenants.created')?.value || 0,
        usersCreated:
          metrics.find(m => m.name === 'enterprise.users.created')?.value || 0,
        accessChecks:
          metrics.find(m => m.name === 'enterprise.access.checks')?.value || 0,
      },
    };
  }
}

/**
 * Example usage
 */
async function runIntegrationExample() {
  console.log('🏢 Orchestrator Kit Enterprise - Common Utilities Integration Example\n');
  console.log('━'.repeat(60));
  console.log();

  // Initialize service
  const enterprise = new OrchestratorEnterpriseService();

  console.log('✅ Service initialized with common utilities\n');

  // Example 1: Create Tenant with Validation
  console.log('Example 1: Creating Tenant with Validation & Logging\n');

  const tenant = await enterprise.createTenant({
    name: 'Acme Corporation',
    subdomain: 'acme',
    plan: PlanLevel.ENTERPRISE,
    ownerId: 'user-001',
    contactEmail: 'admin@acme.com',
  });
  console.log(`Created tenant: ${tenant.name} (${tenant.id})`);
  console.log(`Plan: ${tenant.plan}`);
  console.log(`Limits: ${tenant.limits.maxUsers} users, ${tenant.limits.apiCallsPerMonth} API calls/month\n`);

  // Example 2: Create Users with Validation
  console.log('Example 2: Creating Users with Strong Password Validation\n');

  const owner = await enterprise.createUser({
    email: 'admin@acme.com',
    name: 'John Doe',
    password: 'SecurePass123!@#',
    tenantId: tenant.id,
    role: UserRole.OWNER,
  });
  console.log(`Created owner: ${owner.email} (${owner.id})`);

  const admin = await enterprise.createUser({
    email: 'alice@acme.com',
    name: 'Alice Smith',
    password: 'AnotherSecurePass456!@#',
    tenantId: tenant.id,
    role: UserRole.ADMIN,
  });
  console.log(`Created admin: ${admin.email} (${admin.id})\n`);

  // Example 3: Access Control with Logging
  console.log('Example 3: Access Control with Audit Logging\n');

  const ownerAccess = enterprise.checkAccess(
    owner.id,
    tenant.id,
    Permission.TENANT_DELETE
  );
  console.log(`Owner can delete tenant: ${ownerAccess.granted}`);

  const adminAccess = enterprise.checkAccess(
    admin.id,
    tenant.id,
    Permission.TENANT_DELETE
  );
  console.log(`Admin can delete tenant: ${adminAccess.granted}`);
  if (!adminAccess.granted) {
    console.log(`Reason: ${adminAccess.reason}\n`);
  }

  // Example 4: Usage Tracking
  console.log('Example 4: Tenant Usage Tracking with Metrics\n');

  enterprise.trackTenantUsage(tenant.id, {
    apiCallsThisMonth: 50000,
    currentUsers: 2,
    currentAgents: 10,
    storageUsedMB: 500,
  });
  console.log('Usage tracked for tenant');

  const limitsCheck = enterprise.checkTenantLimits(tenant.id);
  console.log(`Limits exceeded: ${limitsCheck.exceeded}`);
  if (limitsCheck.exceeded) {
    console.log(`Violations: ${limitsCheck.violations.join(', ')}`);
  }
  console.log();

  // Example 5: Health Check
  console.log('Example 5: System Health Check\n');

  const health = await enterprise.getHealthStatus();
  console.log(`Overall Status: ${health.status}`);
  console.log(`Uptime: ${(health.uptime / 1000).toFixed(2)}s`);
  console.log('\nComponent Health:');
  for (const [name, component] of Object.entries(health.components)) {
    console.log(`  • ${name}: ${component.status} - ${component.message}`);
  }
  console.log();

  // Example 6: Comprehensive Statistics
  console.log('Example 6: Performance Metrics & Statistics\n');

  const stats = enterprise.getStatistics();
  console.log('Tenant Statistics:');
  console.log(`  Total: ${stats.tenants.total}`);
  console.log(`  Free: ${stats.tenants.byPlan.free}`);
  console.log(`  Pro: ${stats.tenants.byPlan.pro}`);
  console.log(`  Enterprise: ${stats.tenants.byPlan.enterprise}`);
  console.log();

  console.log('User Statistics:');
  console.log(`  Total: ${stats.users.total}`);
  console.log();

  console.log('Audit Statistics:');
  console.log(`  Total Logs: ${stats.audit.totalLogs}`);
  console.log(`  Success: ${stats.audit.successCount}`);
  console.log(`  Failures: ${stats.audit.failureCount}`);
  console.log();

  console.log('Service Metrics:');
  console.log(`  Tenants Created: ${stats.metrics.tenantsCreated}`);
  console.log(`  Users Created: ${stats.metrics.usersCreated}`);
  console.log(`  Access Checks: ${stats.metrics.accessChecks}`);
  console.log();

  console.log('━'.repeat(60));
  console.log('✅ Integration example completed!\n');
}

// Run example if executed directly
if (require.main === module) {
  runIntegrationExample().catch(console.error);
}

export { runIntegrationExample };
