-- Migration: 20260202000004_create_rls_policies.sql
-- Purpose: Create Row-Level Security (RLS) policies for data isolation
-- Author: database-architect agent
-- Date: 2026-02-02
-- Dependencies: All previous migrations

-- ============================================================================
-- ENABLE ROW-LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Policy: Authenticated users can view all profiles
-- Rationale: Needed to display customer names in orders and admin interfaces
CREATE POLICY "profiles_select_authenticated"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Users can insert their own profile (edge case, usually handled by trigger)
CREATE POLICY "profiles_insert_own"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Policy: Users can update their own profile only
CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Policy: Users can delete their own profile only
CREATE POLICY "profiles_delete_own"
    ON profiles FOR DELETE
    TO authenticated
    USING (id = auth.uid());

-- ============================================================================
-- CATEGORIES TABLE POLICIES
-- ============================================================================

-- Policy: Anyone (including anonymous) can view categories
-- Rationale: Public catalog browsing without authentication
CREATE POLICY "categories_select_public"
    ON categories FOR SELECT
    TO public
    USING (true);

-- Policy: Only admins can insert categories
CREATE POLICY "categories_insert_admin"
    ON categories FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- Policy: Only admins can update categories
CREATE POLICY "categories_update_admin"
    ON categories FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Policy: Only admins can delete categories
CREATE POLICY "categories_delete_admin"
    ON categories FOR DELETE
    TO authenticated
    USING (is_admin());

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================================

-- Policy: Anyone (including anonymous) can view products
-- Rationale: Public catalog browsing without authentication
CREATE POLICY "products_select_public"
    ON products FOR SELECT
    TO public
    USING (true);

-- Policy: Only admins can insert products
CREATE POLICY "products_insert_admin"
    ON products FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- Policy: Only admins can update products
CREATE POLICY "products_update_admin"
    ON products FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Policy: Only admins can delete products
CREATE POLICY "products_delete_admin"
    ON products FOR DELETE
    TO authenticated
    USING (is_admin());

-- ============================================================================
-- ORDERS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own orders, admins can view all orders
CREATE POLICY "orders_select_own_or_admin"
    ON orders FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR is_admin()
    );

-- Policy: Authenticated users can create orders
-- Note: user_id must match authenticated user (prevents order spoofing)
CREATE POLICY "orders_insert_authenticated"
    ON orders FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Policy: Only admins can update orders
-- Rationale: Order status changes and modifications require admin privileges
CREATE POLICY "orders_update_admin"
    ON orders FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Policy: Only admins can delete orders
CREATE POLICY "orders_delete_admin"
    ON orders FOR DELETE
    TO authenticated
    USING (is_admin());

-- ============================================================================
-- ORDER_ITEMS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own order items, admins can view all
-- Note: Uses subquery to check order ownership
CREATE POLICY "order_items_select_own_or_admin"
    ON order_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR is_admin())
        )
    );

-- Policy: Order items can only be inserted during order creation
-- Note: This policy allows insert if the associated order belongs to the user
CREATE POLICY "order_items_insert_on_order_creation"
    ON order_items FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Policy: Only admins can update order items
CREATE POLICY "order_items_update_admin"
    ON order_items FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Policy: Only admins can delete order items
CREATE POLICY "order_items_delete_admin"
    ON order_items FOR DELETE
    TO authenticated
    USING (is_admin());

-- ============================================================================
-- CART_ITEMS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own cart items only
CREATE POLICY "cart_items_select_own"
    ON cart_items FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Policy: Users can add items to their own cart only
CREATE POLICY "cart_items_insert_own"
    ON cart_items FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own cart items only
CREATE POLICY "cart_items_update_own"
    ON cart_items FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own cart items only
CREATE POLICY "cart_items_delete_own"
    ON cart_items FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- POLICY COMMENTS
-- ============================================================================

COMMENT ON POLICY "profiles_select_authenticated" ON profiles
    IS 'All authenticated users can view profiles (needed for orders and admin interfaces)';
COMMENT ON POLICY "profiles_update_own" ON profiles
    IS 'Users can only update their own profile information';

COMMENT ON POLICY "categories_select_public" ON categories
    IS 'Public access to categories for catalog browsing';
COMMENT ON POLICY "categories_insert_admin" ON categories
    IS 'Only admins can create new categories';

COMMENT ON POLICY "products_select_public" ON products
    IS 'Public access to products for catalog browsing';
COMMENT ON POLICY "products_insert_admin" ON products
    IS 'Only admins can create new products';

COMMENT ON POLICY "orders_select_own_or_admin" ON orders
    IS 'Users can view their own orders, admins can view all';
COMMENT ON POLICY "orders_insert_authenticated" ON orders
    IS 'Authenticated users can create orders (user_id must match auth.uid)';
COMMENT ON POLICY "orders_update_admin" ON orders
    IS 'Only admins can update orders (status changes, etc.)';

COMMENT ON POLICY "order_items_select_own_or_admin" ON order_items
    IS 'Users can view items from their own orders, admins can view all';
COMMENT ON POLICY "order_items_insert_on_order_creation" ON order_items
    IS 'Order items can be inserted during order creation by order owner';

COMMENT ON POLICY "cart_items_select_own" ON cart_items
    IS 'Users can only view their own cart items';
COMMENT ON POLICY "cart_items_insert_own" ON cart_items
    IS 'Users can only add items to their own cart';
