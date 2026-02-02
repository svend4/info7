-- Migration: 20260202000003_create_functions_and_triggers.sql
-- Purpose: Create helper functions and triggers for automation
-- Author: database-architect agent
-- Date: 2026-02-02
-- Dependencies: 20260202000001_create_base_tables.sql, 20260202000002_create_order_tables.sql

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: update_updated_at_column
-- Purpose: Automatically update updated_at timestamp on row modification
-- Usage: Attached to BEFORE UPDATE triggers on tables with updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column()
    IS 'Trigger function to automatically update updated_at timestamp';

-- Function: generate_order_number
-- Purpose: Generate unique order numbers with format ORD-YYYYMMDD-NNN
-- Returns: Unique order number string
-- Example: "ORD-20260202-001", "ORD-20260202-002", etc.
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    today_prefix TEXT;
    next_number INTEGER;
    order_number TEXT;
BEGIN
    -- Generate date prefix (e.g., "ORD-20260202")
    today_prefix := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD');

    -- Find the next sequential number for today
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(order_number FROM LENGTH(today_prefix) + 2)
            AS INTEGER
        )
    ), 0) + 1
    INTO next_number
    FROM orders
    WHERE order_number LIKE today_prefix || '-%';

    -- Format as ORD-YYYYMMDD-001
    order_number := today_prefix || '-' || LPAD(next_number::TEXT, 3, '0');

    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_order_number()
    IS 'Generates unique order numbers in format ORD-YYYYMMDD-NNN';

-- Function: is_admin
-- Purpose: Check if the current user has admin role
-- Returns: TRUE if user is admin, FALSE otherwise
-- Usage: Used in RLS policies for admin-only operations
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin()
    IS 'Returns TRUE if current user has admin role (used in RLS policies)';

-- Function: handle_new_user
-- Purpose: Automatically create profile when user signs up
-- Trigger: AFTER INSERT on auth.users
-- Note: This ensures every authenticated user has a profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        'customer' -- Default role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user()
    IS 'Automatically creates profile record when new user signs up via Supabase Auth';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-update profiles.updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update products.updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update orders.updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update cart_items.updated_at
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-create profile on user signup
-- Note: This trigger is on auth.users table (Supabase system table)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

COMMENT ON TRIGGER update_profiles_updated_at ON profiles
    IS 'Automatically updates updated_at timestamp on profile changes';
COMMENT ON TRIGGER update_products_updated_at ON products
    IS 'Automatically updates updated_at timestamp on product changes';
COMMENT ON TRIGGER update_orders_updated_at ON orders
    IS 'Automatically updates updated_at timestamp on order changes';
COMMENT ON TRIGGER update_cart_items_updated_at ON cart_items
    IS 'Automatically updates updated_at timestamp on cart changes';
COMMENT ON TRIGGER on_auth_user_created ON auth.users
    IS 'Automatically creates profile record when user signs up';
