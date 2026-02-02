-- Migration: 20260202000002_create_order_tables.sql
-- Purpose: Create order management and shopping cart tables
-- Author: database-architect agent
-- Date: 2026-02-02
-- Dependencies: 20260202000000_create_enums.sql, 20260202000001_create_base_tables.sql

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

-- orders: Customer orders with delivery information
-- Stores complete order details including customer info and delivery preferences
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    total_amount NUMERIC(10, 2) NOT NULL,

    -- Delivery information
    delivery_address TEXT NOT NULL,
    delivery_date DATE,
    delivery_time TEXT,

    -- Customer information (denormalized for order history preservation)
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,

    -- Additional details
    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraints
ALTER TABLE orders ADD CONSTRAINT orders_customer_name_not_empty
    CHECK (LENGTH(TRIM(customer_name)) > 0);
ALTER TABLE orders ADD CONSTRAINT orders_customer_phone_not_empty
    CHECK (LENGTH(TRIM(customer_phone)) > 0);
ALTER TABLE orders ADD CONSTRAINT orders_delivery_address_not_empty
    CHECK (LENGTH(TRIM(delivery_address)) > 0);
ALTER TABLE orders ADD CONSTRAINT orders_total_amount_non_negative
    CHECK (total_amount >= 0);
ALTER TABLE orders ADD CONSTRAINT orders_delivery_date_future_or_today
    CHECK (delivery_date >= CURRENT_DATE OR delivery_date IS NULL);

COMMENT ON TABLE orders IS 'Customer orders with delivery and payment information';
COMMENT ON COLUMN orders.order_number IS 'Unique human-readable order identifier (e.g., "ORD-20260202-001")';
COMMENT ON COLUMN orders.status IS 'Order lifecycle status (pending → confirmed → preparing → delivering → completed)';
COMMENT ON COLUMN orders.total_amount IS 'Total order amount (sum of order_items.price_at_purchase * quantity)';
COMMENT ON COLUMN orders.customer_name IS 'Customer name at time of order (denormalized for history)';
COMMENT ON COLUMN orders.customer_phone IS 'Customer phone at time of order (denormalized for history)';
COMMENT ON COLUMN orders.customer_email IS 'Customer email at time of order (denormalized for history)';
COMMENT ON COLUMN orders.delivery_date IS 'Requested delivery date (NULL for ASAP)';
COMMENT ON COLUMN orders.delivery_time IS 'Requested delivery time window (e.g., "10:00-12:00")';

-- ============================================================================
-- ORDER_ITEMS TABLE
-- ============================================================================

-- order_items: Line items for each order
-- Stores product snapshot at purchase time to preserve historical pricing
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    price_at_purchase NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraints
ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_positive
    CHECK (quantity > 0);
ALTER TABLE order_items ADD CONSTRAINT order_items_price_positive
    CHECK (price_at_purchase > 0);

COMMENT ON TABLE order_items IS 'Order line items with historical pricing';
COMMENT ON COLUMN order_items.order_id IS 'Foreign key to orders (CASCADE delete when order deleted)';
COMMENT ON COLUMN order_items.product_id IS 'Foreign key to products (RESTRICT to preserve order history)';
COMMENT ON COLUMN order_items.quantity IS 'Quantity ordered (must be positive)';
COMMENT ON COLUMN order_items.price_at_purchase IS 'Product price at time of purchase (preserves historical pricing)';

-- ============================================================================
-- CART_ITEMS TABLE
-- ============================================================================

-- cart_items: Temporary shopping cart storage
-- Persists user's cart across sessions
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure one product appears only once per user's cart
    UNIQUE(user_id, product_id)
);

-- Add constraints
ALTER TABLE cart_items ADD CONSTRAINT cart_items_quantity_positive
    CHECK (quantity > 0);

COMMENT ON TABLE cart_items IS 'Persistent shopping cart storage';
COMMENT ON COLUMN cart_items.user_id IS 'Foreign key to profiles (CASCADE delete when user deleted)';
COMMENT ON COLUMN cart_items.product_id IS 'Foreign key to products (CASCADE delete when product deleted)';
COMMENT ON COLUMN cart_items.quantity IS 'Quantity in cart (must be positive)';
COMMENT ON CONSTRAINT cart_items_user_id_product_id_key ON cart_items
    IS 'Ensures each product appears only once per user cart';
