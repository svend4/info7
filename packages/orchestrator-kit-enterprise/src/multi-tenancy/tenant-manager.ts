/**
 * Orchestrator Kit Enterprise - Tenant Manager
 *
 * Manages multi-tenant organizations
 */

import { v4 as uuidv4 } from 'uuid';
import { Tenant, PlanLevel, TenantStatus, ResourceLimits, UsageMetrics } from '../types';

/**
 * Default resource limits by plan
 */
const PLAN_LIMITS: Record<PlanLevel, ResourceLimits> = {
  [PlanLevel.FREE]: {
    maxUsers: 3,
    maxAgents: 5,
    apiCallsPerMonth: 10000,
    storageLimitMB: 100,
    maxConcurrentTasks: 2,
    dataRetentionDays: 7,
    customBranding: false,
    ssoEnabled: false,
    advancedAnalytics: false,
    prioritySupport: false,
  },
  [PlanLevel.PRO]: {
    maxUsers: 25,
    maxAgents: 50,
    apiCallsPerMonth: 100000,
    storageLimitMB: 10000,
    maxConcurrentTasks: 10,
    dataRetentionDays: 90,
    customBranding: true,
    ssoEnabled: false,
    advancedAnalytics: true,
    prioritySupport: false,
  },
  [PlanLevel.ENTERPRISE]: {
    maxUsers: -1, // Unlimited
    maxAgents: -1, // Unlimited
    apiCallsPerMonth: -1, // Unlimited
    storageLimitMB: -1, // Unlimited
    maxConcurrentTasks: 100,
    dataRetentionDays: 365,
    customBranding: true,
    ssoEnabled: true,
    advancedAnalytics: true,
    prioritySupport: true,
  },
};

/**
 * Tenant Manager
 */
export class TenantManager {
  private tenants: Map<string, Tenant> = new Map();
  private tenantsBySubdomain: Map<string, string> = new Map();

  /**
   * Create new tenant
   */
  createTenant(params: {
    name: string;
    subdomain: string;
    plan: PlanLevel;
    ownerId: string;
    contactEmail: string;
  }): Tenant {
    // Validate subdomain uniqueness
    if (this.tenantsBySubdomain.has(params.subdomain)) {
      throw new Error(`Subdomain ${params.subdomain} is already taken`);
    }

    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(params.subdomain)) {
      throw new Error('Subdomain must contain only lowercase letters, numbers, and hyphens');
    }

    const tenant: Tenant = {
      id: uuidv4(),
      name: params.name,
      subdomain: params.subdomain,
      plan: params.plan,
      status: params.plan === PlanLevel.FREE ? TenantStatus.ACTIVE : TenantStatus.TRIAL,
      limits: PLAN_LIMITS[params.plan],
      settings: {
        allowedDomains: [],
        requireEmailVerification: true,
        requireMFA: false,
        sessionTimeout: 480, // 8 hours
        features: {
          sso: PLAN_LIMITS[params.plan].ssoEnabled,
          rbac: true,
          auditLog: params.plan !== PlanLevel.FREE,
          advancedAnalytics: PLAN_LIMITS[params.plan].advancedAnalytics,
        },
      },
      usage: {
        currentUsers: 1, // Owner
        currentAgents: 0,
        apiCallsThisMonth: 0,
        storageUsedMB: 0,
        lastResetAt: Date.now(),
      },
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ownerId: params.ownerId,
        contactEmail: params.contactEmail,
      },
    };

    // Set trial period for paid plans
    if (params.plan !== PlanLevel.FREE) {
      tenant.metadata.trialEndsAt = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days
    }

    this.tenants.set(tenant.id, tenant);
    this.tenantsBySubdomain.set(tenant.subdomain, tenant.id);

    return tenant;
  }

  /**
   * Get tenant by ID
   */
  getTenant(tenantId: string): Tenant | undefined {
    return this.tenants.get(tenantId);
  }

  /**
   * Get tenant by subdomain
   */
  getTenantBySubdomain(subdomain: string): Tenant | undefined {
    const tenantId = this.tenantsBySubdomain.get(subdomain);
    if (!tenantId) return undefined;
    return this.tenants.get(tenantId);
  }

  /**
   * Update tenant
   */
  updateTenant(
    tenantId: string,
    updates: Partial<Pick<Tenant, 'name' | 'settings'>>
  ): Tenant {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const updatedTenant: Tenant = {
      ...tenant,
      ...updates,
      settings: {
        ...tenant.settings,
        ...updates.settings,
      },
      metadata: {
        ...tenant.metadata,
        updatedAt: Date.now(),
      },
    };

    this.tenants.set(tenantId, updatedTenant);
    return updatedTenant;
  }

  /**
   * Upgrade tenant plan
   */
  upgradePlan(tenantId: string, newPlan: PlanLevel): Tenant {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Validate upgrade path
    const planOrder = [PlanLevel.FREE, PlanLevel.PRO, PlanLevel.ENTERPRISE];
    const currentIndex = planOrder.indexOf(tenant.plan);
    const newIndex = planOrder.indexOf(newPlan);

    if (newIndex <= currentIndex) {
      throw new Error('Can only upgrade to higher plan');
    }

    const updatedTenant: Tenant = {
      ...tenant,
      plan: newPlan,
      status: TenantStatus.ACTIVE,
      limits: PLAN_LIMITS[newPlan],
      settings: {
        ...tenant.settings,
        features: {
          ...tenant.settings.features,
          sso: PLAN_LIMITS[newPlan].ssoEnabled,
          advancedAnalytics: PLAN_LIMITS[newPlan].advancedAnalytics,
        },
      },
      metadata: {
        ...tenant.metadata,
        updatedAt: Date.now(),
        trialEndsAt: undefined, // Remove trial period
      },
    };

    this.tenants.set(tenantId, updatedTenant);
    return updatedTenant;
  }

  /**
   * Downgrade tenant plan
   */
  downgradePlan(tenantId: string, newPlan: PlanLevel): Tenant {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const newLimits = PLAN_LIMITS[newPlan];

    // Check if current usage exceeds new limits
    if (
      newLimits.maxUsers !== -1 &&
      tenant.usage.currentUsers > newLimits.maxUsers
    ) {
      throw new Error(
        `Cannot downgrade: current users (${tenant.usage.currentUsers}) exceeds new limit (${newLimits.maxUsers})`
      );
    }

    if (
      newLimits.maxAgents !== -1 &&
      tenant.usage.currentAgents > newLimits.maxAgents
    ) {
      throw new Error(
        `Cannot downgrade: current agents (${tenant.usage.currentAgents}) exceeds new limit (${newLimits.maxAgents})`
      );
    }

    const updatedTenant: Tenant = {
      ...tenant,
      plan: newPlan,
      limits: newLimits,
      settings: {
        ...tenant.settings,
        features: {
          ...tenant.settings.features,
          sso: newLimits.ssoEnabled,
          advancedAnalytics: newLimits.advancedAnalytics,
        },
      },
      metadata: {
        ...tenant.metadata,
        updatedAt: Date.now(),
      },
    };

    this.tenants.set(tenantId, updatedTenant);
    return updatedTenant;
  }

  /**
   * Suspend tenant
   */
  suspendTenant(tenantId: string, reason?: string): Tenant {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const updatedTenant: Tenant = {
      ...tenant,
      status: TenantStatus.SUSPENDED,
      metadata: {
        ...tenant.metadata,
        updatedAt: Date.now(),
        suspensionReason: reason,
      },
    };

    this.tenants.set(tenantId, updatedTenant);
    return updatedTenant;
  }

  /**
   * Activate tenant
   */
  activateTenant(tenantId: string): Tenant {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const updatedTenant: Tenant = {
      ...tenant,
      status: TenantStatus.ACTIVE,
      metadata: {
        ...tenant.metadata,
        updatedAt: Date.now(),
        suspensionReason: undefined,
      },
    };

    this.tenants.set(tenantId, updatedTenant);
    return updatedTenant;
  }

  /**
   * Delete tenant
   */
  deleteTenant(tenantId: string): void {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    this.tenants.delete(tenantId);
    this.tenantsBySubdomain.delete(tenant.subdomain);
  }

  /**
   * Track usage
   */
  trackUsage(tenantId: string, usage: Partial<Tenant['usage']>): Tenant {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const updatedTenant: Tenant = {
      ...tenant,
      usage: {
        ...tenant.usage,
        ...usage,
      },
      metadata: {
        ...tenant.metadata,
        updatedAt: Date.now(),
      },
    };

    this.tenants.set(tenantId, updatedTenant);
    return updatedTenant;
  }

  /**
   * Check if tenant has exceeded limits
   */
  checkLimits(tenantId: string): {
    exceeded: boolean;
    violations: string[];
  } {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const violations: string[] = [];

    // Check users
    if (
      tenant.limits.maxUsers !== -1 &&
      tenant.usage.currentUsers > tenant.limits.maxUsers
    ) {
      violations.push(
        `Users: ${tenant.usage.currentUsers}/${tenant.limits.maxUsers}`
      );
    }

    // Check agents
    if (
      tenant.limits.maxAgents !== -1 &&
      tenant.usage.currentAgents > tenant.limits.maxAgents
    ) {
      violations.push(
        `Agents: ${tenant.usage.currentAgents}/${tenant.limits.maxAgents}`
      );
    }

    // Check API calls
    if (
      tenant.limits.apiCallsPerMonth !== -1 &&
      tenant.usage.apiCallsThisMonth > tenant.limits.apiCallsPerMonth
    ) {
      violations.push(
        `API Calls: ${tenant.usage.apiCallsThisMonth}/${tenant.limits.apiCallsPerMonth}`
      );
    }

    // Check storage
    if (
      tenant.limits.storageLimitMB !== -1 &&
      tenant.usage.storageUsedMB > tenant.limits.storageLimitMB
    ) {
      violations.push(
        `Storage: ${tenant.usage.storageUsedMB}MB/${tenant.limits.storageLimitMB}MB`
      );
    }

    return {
      exceeded: violations.length > 0,
      violations,
    };
  }

  /**
   * Reset monthly usage counters
   */
  resetMonthlyUsage(tenantId: string): Tenant {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const updatedTenant: Tenant = {
      ...tenant,
      usage: {
        ...tenant.usage,
        apiCallsThisMonth: 0,
        lastResetAt: Date.now(),
      },
      metadata: {
        ...tenant.metadata,
        updatedAt: Date.now(),
      },
    };

    this.tenants.set(tenantId, updatedTenant);
    return updatedTenant;
  }

  /**
   * Get all tenants
   */
  getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  /**
   * Get tenants by plan
   */
  getTenantsByPlan(plan: PlanLevel): Tenant[] {
    return this.getAllTenants().filter((t) => t.plan === plan);
  }

  /**
   * Get tenant statistics
   */
  getStatistics(): {
    total: number;
    byPlan: Record<PlanLevel, number>;
    byStatus: Record<TenantStatus, number>;
    totalUsers: number;
    totalAgents: number;
  } {
    const tenants = this.getAllTenants();

    const byPlan: Record<PlanLevel, number> = {
      [PlanLevel.FREE]: 0,
      [PlanLevel.PRO]: 0,
      [PlanLevel.ENTERPRISE]: 0,
    };

    const byStatus: Record<TenantStatus, number> = {
      [TenantStatus.ACTIVE]: 0,
      [TenantStatus.TRIAL]: 0,
      [TenantStatus.SUSPENDED]: 0,
      [TenantStatus.CANCELLED]: 0,
    };

    let totalUsers = 0;
    let totalAgents = 0;

    for (const tenant of tenants) {
      byPlan[tenant.plan]++;
      byStatus[tenant.status]++;
      totalUsers += tenant.usage.currentUsers;
      totalAgents += tenant.usage.currentAgents;
    }

    return {
      total: tenants.length,
      byPlan,
      byStatus,
      totalUsers,
      totalAgents,
    };
  }
}
