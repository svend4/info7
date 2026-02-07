/**
 * Orchestrator Kit Enterprise - Usage Example
 *
 * Demonstrates multi-tenancy, RBAC, and audit logging
 */

import { TenantManager } from './multi-tenancy/tenant-manager';
import { UserManager } from './multi-tenancy/user-manager';
import { AccessControl } from './rbac/access-control';
import { AuditLogger, AuditAction } from './audit/audit-logger';
import { PlanLevel, UserRole, Permission } from './types';

async function main() {
  console.log('🏢 Orchestrator Kit Enterprise - Example\n');

  // Initialize managers
  const tenantManager = new TenantManager();
  const userManager = new UserManager();
  const accessControl = new AccessControl(userManager);
  const auditLogger = new AuditLogger();

  console.log('✅ Managers initialized\n');
  console.log('━'.repeat(60));
  console.log();

  // ==========================================
  // Example 1: Create Tenants
  // ==========================================
  console.log('Example 1: Creating Multi-Tenant Organizations\n');

  const acmeTenant = tenantManager.createTenant({
    name: 'Acme Corporation',
    subdomain: 'acme',
    plan: PlanLevel.ENTERPRISE,
    ownerId: 'user-001',
    contactEmail: 'admin@acme.com',
  });

  const startupTenant = tenantManager.createTenant({
    name: 'Startup Inc',
    subdomain: 'startup',
    plan: PlanLevel.PRO,
    ownerId: 'user-002',
    contactEmail: 'founder@startup.com',
  });

  const freeTenant = tenantManager.createTenant({
    name: 'Free User',
    subdomain: 'freeuser',
    plan: PlanLevel.FREE,
    ownerId: 'user-003',
    contactEmail: 'user@example.com',
  });

  console.log('Created Tenants:');
  console.log(`  • ${acmeTenant.name} (${acmeTenant.plan}) - ${acmeTenant.subdomain}.orchestrator.ai`);
  console.log(`  • ${startupTenant.name} (${startupTenant.plan}) - ${startupTenant.subdomain}.orchestrator.ai`);
  console.log(`  • ${freeTenant.name} (${freeTenant.plan}) - ${freeTenant.subdomain}.orchestrator.ai`);
  console.log();

  console.log('Resource Limits by Plan:');
  console.log(`  Enterprise: ${acmeTenant.limits.maxUsers} users, ${acmeTenant.limits.apiCallsPerMonth} API calls/month`);
  console.log(`  Pro: ${startupTenant.limits.maxUsers} users, ${startupTenant.limits.apiCallsPerMonth} API calls/month`);
  console.log(`  Free: ${freeTenant.limits.maxUsers} users, ${freeTenant.limits.apiCallsPerMonth} API calls/month`);
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // ==========================================
  // Example 2: User Management
  // ==========================================
  console.log('Example 2: User Management with RBAC\n');

  // Create owner user
  const ownerUser = await userManager.createUser({
    email: 'admin@acme.com',
    name: 'John Doe',
    password: 'securePassword123',
    tenantId: acmeTenant.id,
    role: UserRole.OWNER,
  });

  console.log(`Created Owner: ${ownerUser.name} (${ownerUser.email})`);
  console.log(`  Role: ${ownerUser.tenants[0].role}`);
  console.log(`  Permissions: ${ownerUser.tenants[0].permissions.length} permissions`);
  console.log();

  // Create team members
  const adminUser = await userManager.createUser({
    email: 'alice@acme.com',
    name: 'Alice Smith',
    password: 'password123',
    tenantId: acmeTenant.id,
    role: UserRole.ADMIN,
  });

  const memberUser = await userManager.createUser({
    email: 'bob@acme.com',
    name: 'Bob Johnson',
    password: 'password123',
    tenantId: acmeTenant.id,
    role: UserRole.MEMBER,
  });

  const viewerUser = await userManager.createUser({
    email: 'carol@acme.com',
    name: 'Carol Williams',
    password: 'password123',
    tenantId: acmeTenant.id,
    role: UserRole.VIEWER,
  });

  console.log('Created Team Members:');
  console.log(`  • ${adminUser.name} (Admin)`);
  console.log(`  • ${memberUser.name} (Member)`);
  console.log(`  • ${viewerUser.name} (Viewer)`);
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // ==========================================
  // Example 3: Access Control
  // ==========================================
  console.log('Example 3: RBAC Access Control\n');

  // Test permissions
  const testPermissions = [
    { user: ownerUser, permission: Permission.TENANT_DELETE, expected: true },
    { user: adminUser, permission: Permission.TENANT_DELETE, expected: false },
    { user: memberUser, permission: Permission.AGENT_EXECUTE, expected: true },
    { user: viewerUser, permission: Permission.AGENT_WRITE, expected: false },
  ];

  console.log('Permission Tests:');
  for (const test of testPermissions) {
    const result = accessControl.checkAccess(
      test.user.id,
      acmeTenant.id,
      test.permission
    );

    const status = result.granted === test.expected ? '✅' : '❌';
    console.log(
      `  ${status} ${test.user.name}: ${test.permission} → ${result.granted ? 'GRANTED' : 'DENIED'}`
    );
  }
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // ==========================================
  // Example 4: Invitations
  // ==========================================
  console.log('Example 4: Team Invitations\n');

  const invitation = userManager.createInvitation({
    tenantId: acmeTenant.id,
    email: 'david@acme.com',
    role: UserRole.MEMBER,
    invitedBy: ownerUser.id,
  });

  console.log('Created Invitation:');
  console.log(`  Email: ${invitation.email}`);
  console.log(`  Role: ${invitation.role}`);
  console.log(`  Token: ${invitation.token.substring(0, 20)}...`);
  console.log(`  Expires: ${new Date(invitation.expiresAt).toLocaleDateString()}`);
  console.log();

  // Accept invitation
  const newUser = await userManager.acceptInvitation(invitation.token, {
    email: 'david@acme.com',
    name: 'David Brown',
    password: 'password123',
  });

  console.log(`✅ Invitation accepted by ${newUser.name}`);
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // ==========================================
  // Example 5: Audit Logging
  // ==========================================
  console.log('Example 5: Comprehensive Audit Logging\n');

  // Log various actions
  auditLogger.logSuccess({
    tenantId: acmeTenant.id,
    userId: ownerUser.id,
    action: AuditAction.USER_CREATED,
    resourceType: 'user',
    resourceId: newUser.id,
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
  });

  auditLogger.logSuccess({
    tenantId: acmeTenant.id,
    userId: adminUser.id,
    action: AuditAction.AGENT_EXECUTED,
    resourceType: 'agent',
    resourceId: 'agent-legal-001',
    ipAddress: '192.168.1.2',
  });

  auditLogger.logFailure({
    tenantId: acmeTenant.id,
    userId: viewerUser.id,
    action: AuditAction.AGENT_DELETED,
    resourceType: 'agent',
    resourceId: 'agent-legal-001',
    error: 'Insufficient permissions',
    ipAddress: '192.168.1.3',
  });

  const recentLogs = auditLogger.getTenantLogs(acmeTenant.id, 10);

  console.log('Recent Audit Logs:');
  for (const log of recentLogs) {
    const status = log.status === 'success' ? '✅' : '❌';
    console.log(
      `  ${status} ${log.action} by ${log.userId} on ${log.resourceType} (${log.status})`
    );
  }
  console.log();

  const stats = auditLogger.getStatistics(acmeTenant.id);
  console.log('Audit Statistics:');
  console.log(`  Total logs: ${stats.totalLogs}`);
  console.log(`  Success: ${stats.successCount}`);
  console.log(`  Failures: ${stats.failureCount}`);
  console.log(`  Top actions: ${stats.topActions.map((a) => a.action).join(', ')}`);
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // ==========================================
  // Example 6: Usage Tracking & Limits
  // ==========================================
  console.log('Example 6: Usage Tracking & Limit Enforcement\n');

  // Simulate usage
  tenantManager.trackUsage(acmeTenant.id, {
    apiCallsThisMonth: 50000,
    storageUsedMB: 5000,
  });

  tenantManager.trackUsage(freeTenant.id, {
    apiCallsThisMonth: 12000, // Over limit!
    currentUsers: 4, // Over limit!
  });

  console.log('Usage Check - Acme Corporation (Enterprise):');
  const acmeCheck = tenantManager.checkLimits(acmeTenant.id);
  console.log(`  Status: ${acmeCheck.exceeded ? '⚠️  Over limit' : '✅ Within limits'}`);
  if (acmeCheck.exceeded) {
    console.log(`  Violations: ${acmeCheck.violations.join(', ')}`);
  }
  console.log();

  console.log('Usage Check - Free User (Free Plan):');
  const freeCheck = tenantManager.checkLimits(freeTenant.id);
  console.log(`  Status: ${freeCheck.exceeded ? '⚠️  Over limit' : '✅ Within limits'}`);
  if (freeCheck.exceeded) {
    console.log(`  Violations: ${freeCheck.violations.join(', ')}`);
  }
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // ==========================================
  // Example 7: Plan Upgrades
  // ==========================================
  console.log('Example 7: Plan Management\n');

  console.log(`Free Tenant Before: ${freeTenant.plan}`);
  console.log(`  Limits: ${freeTenant.limits.maxUsers} users, ${freeTenant.limits.maxAgents} agents`);
  console.log();

  // Upgrade plan
  const upgradedTenant = tenantManager.upgradePlan(freeTenant.id, PlanLevel.PRO);

  console.log(`Free Tenant After Upgrade: ${upgradedTenant.plan}`);
  console.log(`  Limits: ${upgradedTenant.limits.maxUsers} users, ${upgradedTenant.limits.maxAgents} agents`);
  console.log(`  SSO Enabled: ${upgradedTenant.settings.features.sso}`);
  console.log(`  Advanced Analytics: ${upgradedTenant.settings.features.advancedAnalytics}`);
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // ==========================================
  // Final Statistics
  // ==========================================
  console.log('📊 Final System Statistics\n');

  const tenantStats = tenantManager.getStatistics();
  console.log('Tenants:');
  console.log(`  Total: ${tenantStats.total}`);
  console.log(`  By Plan: Free=${tenantStats.byPlan.free}, Pro=${tenantStats.byPlan.pro}, Enterprise=${tenantStats.byPlan.enterprise}`);
  console.log(`  Total Users: ${tenantStats.totalUsers}`);
  console.log(`  Total Agents: ${tenantStats.totalAgents}`);
  console.log();

  const allUsers = userManager.getAllUsers();
  console.log('Users:');
  console.log(`  Total: ${allUsers.length}`);
  console.log(`  Email verified: ${allUsers.filter((u) => u.emailVerified).length}`);
  console.log(`  MFA enabled: ${allUsers.filter((u) => u.mfaEnabled).length}`);
  console.log();

  console.log('✅ Example complete!\n');
}

// Run example
if (require.main === module) {
  main().catch(console.error);
}

export { main as runEnterpriseExample };
