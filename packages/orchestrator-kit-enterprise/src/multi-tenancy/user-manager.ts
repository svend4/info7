/**
 * Orchestrator Kit Enterprise - User Manager
 *
 * Manages users across tenants
 */

import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { User, UserRole, Permission, Invitation } from '../types';

/**
 * Role-based permissions
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: [
    Permission.TENANT_READ,
    Permission.TENANT_WRITE,
    Permission.TENANT_DELETE,
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.USER_DELETE,
    Permission.USER_INVITE,
    Permission.AGENT_READ,
    Permission.AGENT_WRITE,
    Permission.AGENT_DELETE,
    Permission.AGENT_EXECUTE,
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_EXPORT,
    Permission.SETTINGS_READ,
    Permission.SETTINGS_WRITE,
    Permission.BILLING_READ,
    Permission.BILLING_WRITE,
  ],
  [UserRole.ADMIN]: [
    Permission.TENANT_READ,
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.USER_INVITE,
    Permission.AGENT_READ,
    Permission.AGENT_WRITE,
    Permission.AGENT_EXECUTE,
    Permission.ANALYTICS_READ,
    Permission.SETTINGS_READ,
    Permission.SETTINGS_WRITE,
  ],
  [UserRole.MEMBER]: [
    Permission.TENANT_READ,
    Permission.USER_READ,
    Permission.AGENT_READ,
    Permission.AGENT_EXECUTE,
    Permission.ANALYTICS_READ,
  ],
  [UserRole.VIEWER]: [
    Permission.TENANT_READ,
    Permission.USER_READ,
    Permission.AGENT_READ,
    Permission.ANALYTICS_READ,
  ],
};

/**
 * User Manager
 */
export class UserManager {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, string> = new Map();
  private invitations: Map<string, Invitation> = new Map();

  /**
   * Create new user
   */
  async createUser(params: {
    email: string;
    name: string;
    password?: string;
    tenantId: string;
    role: UserRole;
  }): Promise<User> {
    // Check if email already exists
    if (this.usersByEmail.has(params.email)) {
      throw new Error(`User with email ${params.email} already exists`);
    }

    // Hash password if provided
    let passwordHash: string | undefined;
    if (params.password) {
      passwordHash = await bcrypt.hash(params.password, 10);
    }

    const user: User = {
      id: uuidv4(),
      email: params.email,
      name: params.name,
      passwordHash,
      emailVerified: false,
      mfaEnabled: false,
      tenants: [
        {
          tenantId: params.tenantId,
          role: params.role,
          permissions: ROLE_PERMISSIONS[params.role],
          joinedAt: Date.now(),
        },
      ],
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };

    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user.id);

    return user;
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | undefined {
    const userId = this.usersByEmail.get(email);
    if (!userId) return undefined;
    return this.users.get(userId);
  }

  /**
   * Verify password
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.passwordHash) {
      return false;
    }

    return await bcrypt.compare(password, user.passwordHash);
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, newPassword: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser: User = {
      ...user,
      passwordHash,
      metadata: {
        ...user.metadata,
        updatedAt: Date.now(),
      },
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  /**
   * Verify email
   */
  verifyEmail(userId: string): User {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const updatedUser: User = {
      ...user,
      emailVerified: true,
      metadata: {
        ...user.metadata,
        updatedAt: Date.now(),
      },
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  /**
   * Add user to tenant
   */
  addUserToTenant(
    userId: string,
    tenantId: string,
    role: UserRole
  ): User {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Check if already member
    const existingMembership = user.tenants.find((t) => t.tenantId === tenantId);
    if (existingMembership) {
      throw new Error('User is already a member of this tenant');
    }

    const updatedUser: User = {
      ...user,
      tenants: [
        ...user.tenants,
        {
          tenantId,
          role,
          permissions: ROLE_PERMISSIONS[role],
          joinedAt: Date.now(),
        },
      ],
      metadata: {
        ...user.metadata,
        updatedAt: Date.now(),
      },
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  /**
   * Remove user from tenant
   */
  removeUserFromTenant(userId: string, tenantId: string): User {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const updatedUser: User = {
      ...user,
      tenants: user.tenants.filter((t) => t.tenantId !== tenantId),
      metadata: {
        ...user.metadata,
        updatedAt: Date.now(),
      },
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  /**
   * Update user role in tenant
   */
  updateUserRole(
    userId: string,
    tenantId: string,
    newRole: UserRole
  ): User {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const updatedUser: User = {
      ...user,
      tenants: user.tenants.map((t) =>
        t.tenantId === tenantId
          ? {
              ...t,
              role: newRole,
              permissions: ROLE_PERMISSIONS[newRole],
            }
          : t
      ),
      metadata: {
        ...user.metadata,
        updatedAt: Date.now(),
      },
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  /**
   * Check if user has permission in tenant
   */
  hasPermission(
    userId: string,
    tenantId: string,
    permission: Permission
  ): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    const membership = user.tenants.find((t) => t.tenantId === tenantId);
    if (!membership) return false;

    return membership.permissions.includes(permission);
  }

  /**
   * Get user's role in tenant
   */
  getUserRole(userId: string, tenantId: string): UserRole | undefined {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const membership = user.tenants.find((t) => t.tenantId === tenantId);
    return membership?.role;
  }

  /**
   * Get all users in tenant
   */
  getTenantUsers(tenantId: string): User[] {
    return Array.from(this.users.values()).filter((user) =>
      user.tenants.some((t) => t.tenantId === tenantId)
    );
  }

  /**
   * Create invitation
   */
  createInvitation(params: {
    tenantId: string;
    email: string;
    role: UserRole;
    invitedBy: string;
  }): Invitation {
    const invitation: Invitation = {
      id: uuidv4(),
      tenantId: params.tenantId,
      email: params.email,
      role: params.role,
      token: this.generateToken(),
      invitedBy: params.invitedBy,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      accepted: false,
    };

    this.invitations.set(invitation.id, invitation);
    return invitation;
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(
    invitationToken: string,
    userParams: {
      email: string;
      name: string;
      password: string;
    }
  ): Promise<User> {
    // Find invitation by token
    const invitation = Array.from(this.invitations.values()).find(
      (inv) => inv.token === invitationToken
    );

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.accepted) {
      throw new Error('Invitation already accepted');
    }

    if (invitation.expiresAt < Date.now()) {
      throw new Error('Invitation expired');
    }

    if (invitation.email !== userParams.email) {
      throw new Error('Email does not match invitation');
    }

    // Create or update user
    let user = this.getUserByEmail(userParams.email);

    if (user) {
      // Add to tenant
      user = this.addUserToTenant(user.id, invitation.tenantId, invitation.role);
    } else {
      // Create new user
      user = await this.createUser({
        email: userParams.email,
        name: userParams.name,
        password: userParams.password,
        tenantId: invitation.tenantId,
        role: invitation.role,
      });
    }

    // Mark invitation as accepted
    invitation.accepted = true;
    invitation.acceptedAt = Date.now();
    this.invitations.set(invitation.id, invitation);

    return user;
  }

  /**
   * Get pending invitations for tenant
   */
  getTenantInvitations(tenantId: string): Invitation[] {
    return Array.from(this.invitations.values()).filter(
      (inv) => inv.tenantId === tenantId && !inv.accepted && inv.expiresAt > Date.now()
    );
  }

  /**
   * Revoke invitation
   */
  revokeInvitation(invitationId: string): void {
    this.invitations.delete(invitationId);
  }

  /**
   * Generate random token
   */
  private generateToken(): string {
    return uuidv4() + '-' + Date.now().toString(36);
  }

  /**
   * Update last login
   */
  updateLastLogin(userId: string): User {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const updatedUser: User = {
      ...user,
      metadata: {
        ...user.metadata,
        lastLoginAt: Date.now(),
        lastActiveAt: Date.now(),
      },
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  /**
   * Delete user
   */
  deleteUser(userId: string): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    this.users.delete(userId);
    this.usersByEmail.delete(user.email);
  }

  /**
   * Get all users
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }
}
