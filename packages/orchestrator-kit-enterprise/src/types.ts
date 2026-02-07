/**
 * Orchestrator Kit Enterprise - Types
 *
 * Type definitions for enterprise features
 */

/**
 * Subscription plan levels
 */
export enum PlanLevel {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

/**
 * Tenant status
 */
export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  CANCELLED = 'cancelled',
}

/**
 * User role
 */
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

/**
 * Permission
 */
export enum Permission {
  // Tenant management
  TENANT_READ = 'tenant:read',
  TENANT_WRITE = 'tenant:write',
  TENANT_DELETE = 'tenant:delete',

  // User management
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',
  USER_INVITE = 'user:invite',

  // Agent management
  AGENT_READ = 'agent:read',
  AGENT_WRITE = 'agent:write',
  AGENT_DELETE = 'agent:delete',
  AGENT_EXECUTE = 'agent:execute',

  // Analytics
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_EXPORT = 'analytics:export',

  // Settings
  SETTINGS_READ = 'settings:read',
  SETTINGS_WRITE = 'settings:write',

  // Billing
  BILLING_READ = 'billing:read',
  BILLING_WRITE = 'billing:write',
}

/**
 * Resource limits for different plan levels
 */
export interface ResourceLimits {
  /** Maximum number of users */
  maxUsers: number;

  /** Maximum number of agents */
  maxAgents: number;

  /** API calls per month */
  apiCallsPerMonth: number;

  /** Storage limit (MB) */
  storageLimitMB: number;

  /** Maximum concurrent tasks */
  maxConcurrentTasks: number;

  /** Data retention (days) */
  dataRetentionDays: number;

  /** Custom branding allowed */
  customBranding: boolean;

  /** SSO allowed */
  ssoEnabled: boolean;

  /** Advanced analytics */
  advancedAnalytics: boolean;

  /** Priority support */
  prioritySupport: boolean;
}

/**
 * Tenant configuration
 */
export interface Tenant {
  /** Unique tenant ID */
  id: string;

  /** Tenant name */
  name: string;

  /** Subdomain (e.g., acme.orchestrator.ai) */
  subdomain: string;

  /** Subscription plan */
  plan: PlanLevel;

  /** Tenant status */
  status: TenantStatus;

  /** Resource limits */
  limits: ResourceLimits;

  /** Settings */
  settings: {
    /** Allowed email domains */
    allowedDomains: string[];

    /** Require email verification */
    requireEmailVerification: boolean;

    /** Require MFA */
    requireMFA: boolean;

    /** Session timeout (minutes) */
    sessionTimeout: number;

    /** Custom branding */
    branding?: {
      logoUrl?: string;
      primaryColor?: string;
      companyName?: string;
    };

    /** Feature flags */
    features: {
      sso: boolean;
      rbac: boolean;
      auditLog: boolean;
      advancedAnalytics: boolean;
    };
  };

  /** Usage statistics */
  usage: {
    /** Current number of users */
    currentUsers: number;

    /** Current number of agents */
    currentAgents: number;

    /** API calls this month */
    apiCallsThisMonth: number;

    /** Storage used (MB) */
    storageUsedMB: number;

    /** Last reset date */
    lastResetAt: number;
  };

  /** Metadata */
  metadata: {
    /** Creation timestamp */
    createdAt: number;

    /** Last updated timestamp */
    updatedAt: number;

    /** Trial end date (if applicable) */
    trialEndsAt?: number;

    /** Owner user ID */
    ownerId: string;

    /** Contact email */
    contactEmail: string;

    /** Billing email */
    billingEmail?: string;

    /** Custom fields */
    [key: string]: any;
  };
}

/**
 * User in multi-tenant system
 */
export interface User {
  /** Unique user ID */
  id: string;

  /** Email address */
  email: string;

  /** Display name */
  name: string;

  /** Password hash (if using local auth) */
  passwordHash?: string;

  /** Email verified */
  emailVerified: boolean;

  /** MFA enabled */
  mfaEnabled: boolean;

  /** MFA secret (encrypted) */
  mfaSecret?: string;

  /** Tenant memberships */
  tenants: Array<{
    tenantId: string;
    role: UserRole;
    permissions: Permission[];
    joinedAt: number;
  }>;

  /** SSO profiles */
  ssoProfiles?: Array<{
    provider: string;
    providerId: string;
    email: string;
  }>;

  /** Metadata */
  metadata: {
    createdAt: number;
    updatedAt: number;
    lastLoginAt?: number;
    lastActiveAt?: number;
    profilePictureUrl?: string;
  };
}

/**
 * Invitation to join tenant
 */
export interface Invitation {
  /** Invitation ID */
  id: string;

  /** Tenant ID */
  tenantId: string;

  /** Email address */
  email: string;

  /** Assigned role */
  role: UserRole;

  /** Invitation token */
  token: string;

  /** Invited by user ID */
  invitedBy: string;

  /** Created at */
  createdAt: number;

  /** Expires at */
  expiresAt: number;

  /** Accepted */
  accepted: boolean;

  /** Accepted at */
  acceptedAt?: number;
}

/**
 * SSO configuration
 */
export interface SSOConfig {
  /** SSO provider */
  provider: 'saml' | 'oauth2' | 'oidc';

  /** Provider name (e.g., "Okta", "Auth0") */
  providerName: string;

  /** Enabled */
  enabled: boolean;

  /** SAML configuration */
  saml?: {
    entryPoint: string;
    issuer: string;
    cert: string;
    callbackUrl: string;
  };

  /** OAuth2 configuration */
  oauth2?: {
    authorizationURL: string;
    tokenURL: string;
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope: string[];
  };

  /** OIDC configuration */
  oidc?: {
    issuer: string;
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope: string[];
  };

  /** Attribute mapping */
  attributeMapping: {
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
  };
}

/**
 * Audit log entry
 */
export interface AuditLog {
  /** Log ID */
  id: string;

  /** Tenant ID */
  tenantId: string;

  /** User ID */
  userId: string;

  /** Action performed */
  action: string;

  /** Resource type */
  resourceType: string;

  /** Resource ID */
  resourceId?: string;

  /** Changes made */
  changes?: {
    before?: any;
    after?: any;
  };

  /** IP address */
  ipAddress?: string;

  /** User agent */
  userAgent?: string;

  /** Timestamp */
  timestamp: number;

  /** Status */
  status: 'success' | 'failure';

  /** Error message (if failed) */
  error?: string;
}

/**
 * Usage metrics
 */
export interface UsageMetrics {
  /** Tenant ID */
  tenantId: string;

  /** Date (YYYY-MM-DD) */
  date: string;

  /** API calls */
  apiCalls: number;

  /** Tasks executed */
  tasksExecuted: number;

  /** Storage used (MB) */
  storageUsed: number;

  /** Active users */
  activeUsers: number;

  /** Agent executions */
  agentExecutions: {
    [agentType: string]: number;
  };

  /** Average response time (ms) */
  avgResponseTime: number;

  /** Error rate */
  errorRate: number;

  /** Cost */
  cost: number;
}

/**
 * Analytics dashboard data
 */
export interface AnalyticsDashboard {
  /** Tenant ID */
  tenantId: string;

  /** Period */
  period: {
    start: number;
    end: number;
  };

  /** Overview metrics */
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalAgents: number;
    totalTasks: number;
    successRate: number;
    avgResponseTime: number;
  };

  /** Time series data */
  timeSeries: {
    apiCalls: Array<{ date: string; count: number }>;
    tasks: Array<{ date: string; count: number }>;
    activeUsers: Array<{ date: string; count: number }>;
    costs: Array<{ date: string; amount: number }>;
  };

  /** Top agents */
  topAgents: Array<{
    agentType: string;
    executions: number;
    successRate: number;
    avgResponseTime: number;
  }>;

  /** Top users */
  topUsers: Array<{
    userId: string;
    userName: string;
    actions: number;
    lastActive: number;
  }>;

  /** Errors */
  errors: Array<{
    type: string;
    count: number;
    lastOccurred: number;
  }>;
}

/**
 * Billing information
 */
export interface BillingInfo {
  /** Tenant ID */
  tenantId: string;

  /** Current plan */
  plan: PlanLevel;

  /** Billing period */
  billingPeriod: 'monthly' | 'yearly';

  /** Next billing date */
  nextBillingDate: number;

  /** Payment method */
  paymentMethod?: {
    type: 'card' | 'bank' | 'invoice';
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };

  /** Billing history */
  invoices: Array<{
    id: string;
    date: number;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    invoiceUrl?: string;
  }>;

  /** Current month usage */
  currentUsage: {
    apiCalls: number;
    storage: number;
    overage: {
      apiCalls: number;
      storage: number;
      cost: number;
    };
  };
}
