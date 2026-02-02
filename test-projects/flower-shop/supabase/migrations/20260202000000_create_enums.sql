-- Migration: 20260202000000_create_enums.sql
-- Purpose: Create ENUM types for user roles and order statuses
-- Author: database-architect agent
-- Date: 2026-02-02

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- user_role: Defines user access levels in the system
-- - customer: Regular users who can browse and purchase flowers
-- - admin: Administrators with full system access
CREATE TYPE user_role AS ENUM ('customer', 'admin');

-- order_status: Represents the lifecycle of an order
-- - pending: Order created, awaiting confirmation
-- - confirmed: Order confirmed by admin/system
-- - preparing: Flowers being prepared
-- - delivering: Order out for delivery
-- - completed: Order successfully delivered
-- - cancelled: Order cancelled (by user or admin)
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'delivering',
    'completed',
    'cancelled'
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TYPE user_role IS 'User role types: customer (default) or admin';
COMMENT ON TYPE order_status IS 'Order lifecycle states from pending to completed/cancelled';
