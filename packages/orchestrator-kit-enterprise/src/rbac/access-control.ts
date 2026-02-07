/**
 * Orchestrator Kit Enterprise - Access Control
 *
 * Role-Based Access Control (RBAC) system
 */

import { Permission, UserRole } from '../types';
import { UserManager } from '../multi-tenancy/user-manager';

/**
 * Access control result
 */
export interface AccessResult {
  /** Access granted */
  granted: boolean;

  /** Reason (if denied) */
  reason?: string;

  /** User role */
  role?: UserRole;

  /** Permissions */
  permissions?: Permission[];
}

/**
 * Access Control Manager
 */
export class AccessControl {
  constructor(private userManager: UserManager) {}

  /**
   * Check if user has access to resource
   */
  checkAccess(
    userId: string,
    tenantId: string,
    requiredPermission: Permission
  ): AccessResult {
    // Get user
    const user = this.userManager.getUser(userId);
    if (!user) {
      return {
        granted: false,
        reason: 'User not found',
      };
    }

    // Get tenant membership
    const membership = user.tenants.find((t) => t.tenantId === tenantId);
    if (!membership) {
      return {
        granted: false,
        reason: 'User is not a member of this tenant',
      };
    }

    // Check permission
    const hasPermission = membership.permissions.includes(requiredPermission);

    return {
      granted: hasPermission,
      reason: hasPermission ? undefined : 'Insufficient permissions',
      role: membership.role,
      permissions: membership.permissions,
    };
  }

  /**
   * Check if user has any of the required permissions
   */
  checkAnyPermission(
    userId: string,
    tenantId: string,
    requiredPermissions: Permission[]
  ): AccessResult {
    const user = this.userManager.getUser(userId);
    if (!user) {
      return {
        granted: false,
        reason: 'User not found',
      };
    }

    const membership = user.tenants.find((t) => t.tenantId === tenantId);
    if (!membership) {
      return {
        granted: false,
        reason: 'User is not a member of this tenant',
      };
    }

    const hasAnyPermission = requiredPermissions.some((perm) =>
      membership.permissions.includes(perm)
    );

    return {
      granted: hasAnyPermission,
      reason: hasAnyPermission ? undefined : 'Insufficient permissions',
      role: membership.role,
      permissions: membership.permissions,
    };
  }

  /**
   * Check if user has all required permissions
   */
  checkAllPermissions(
    userId: string,
    tenantId: string,
    requiredPermissions: Permission[]
  ): AccessResult {
    const user = this.userManager.getUser(userId);
    if (!user) {
      return {
        granted: false,
        reason: 'User not found',
      };
    }

    const membership = user.tenants.find((t) => t.tenantId === tenantId);
    if (!membership) {
      return {
        granted: false,
        reason: 'User is not a member of this tenant',
      };
    }

    const hasAllPermissions = requiredPermissions.every((perm) =>
      membership.permissions.includes(perm)
    );

    return {
      granted: hasAllPermissions,
      reason: hasAllPermissions ? undefined : 'Insufficient permissions',
      role: membership.role,
      permissions: membership.permissions,
    };
  }

  /**
   * Check if user has role
   */
  checkRole(
    userId: string,
    tenantId: string,
    requiredRole: UserRole
  ): AccessResult {
    const user = this.userManager.getUser(userId);
    if (!user) {
      return {
        granted: false,
        reason: 'User not found',
      };
    }

    const membership = user.tenants.find((t) => t.tenantId === tenantId);
    if (!membership) {
      return {
        granted: false,
        reason: 'User is not a member of this tenant',
      };
    }

    const hasRole = membership.role === requiredRole;

    return {
      granted: hasRole,
      reason: hasRole ? undefined : 'Insufficient role',
      role: membership.role,
      permissions: membership.permissions,
    };
  }

  /**
   * Check if user is owner
   */
  isOwner(userId: string, tenantId: string): boolean {
    return this.checkRole(userId, tenantId, UserRole.OWNER).granted;
  }

  /**
   * Check if user is admin or owner
   */
  isAdminOrOwner(userId: string, tenantId: string): boolean {
    const role = this.userManager.getUserRole(userId, tenantId);
    return role === UserRole.OWNER || role === UserRole.ADMIN;
  }

  /**
   * Get user permissions in tenant
   */
  getUserPermissions(userId: string, tenantId: string): Permission[] {
    const user = this.userManager.getUser(userId);
    if (!user) return [];

    const membership = user.tenants.find((t) => t.tenantId === tenantId);
    return membership?.permissions ?? [];
  }

  /**
   * Require permission (throws error if denied)
   */
  requirePermission(
    userId: string,
    tenantId: string,
    permission: Permission
  ): void {
    const result = this.checkAccess(userId, tenantId, permission);
    if (!result.granted) {
      throw new Error(`Access denied: ${result.reason}`);
    }
  }

  /**
   * Require role (throws error if denied)
   */
  requireRole(
    userId: string,
    tenantId: string,
    role: UserRole
  ): void {
    const result = this.checkRole(userId, tenantId, role);
    if (!result.granted) {
      throw new Error(`Access denied: ${result.reason}`);
    }
  }

  /**
   * Create permission decorator
   */
  createPermissionDecorator(permission: Permission) {
    return (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (
        ...args: [userId: string, tenantId: string, ...rest: any[]]
      ) {
        const [userId, tenantId] = args;

        const accessControl = new AccessControl(
          (this as any).userManager
        );

        accessControl.requirePermission(userId, tenantId, permission);

        return originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }
}

/**
 * Permission decorator factory
 */
export function RequirePermission(permission: Permission) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      userId: string,
      tenantId: string,
      ...args: any[]
    ) {
      const userManager = (this as any).userManager;
      if (!userManager) {
        throw new Error('UserManager not found in class instance');
      }

      const accessControl = new AccessControl(userManager);
      accessControl.requirePermission(userId, tenantId, permission);

      return originalMethod.apply(this, [userId, tenantId, ...args]);
    };

    return descriptor;
  };
}

/**
 * Role decorator factory
 */
export function RequireRole(role: UserRole) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      userId: string,
      tenantId: string,
      ...args: any[]
    ) {
      const userManager = (this as any).userManager;
      if (!userManager) {
        throw new Error('UserManager not found in class instance');
      }

      const accessControl = new AccessControl(userManager);
      accessControl.requireRole(userId, tenantId, role);

      return originalMethod.apply(this, [userId, tenantId, ...args]);
    };

    return descriptor;
  };
}
