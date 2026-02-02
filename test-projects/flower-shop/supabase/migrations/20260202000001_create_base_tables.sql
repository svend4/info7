-- Migration: 20260202000001_create_base_tables.sql
-- Purpose: Create core tables for users, categories, and products
-- Author: database-architect agent
-- Date: 2026-02-02
-- Dependencies: 20260202000000_create_enums.sql

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

-- profiles: User profiles extending Supabase auth.users
-- Stores additional user information and role-based access control
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraints
ALTER TABLE profiles ADD CONSTRAINT profiles_email_check
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

COMMENT ON TABLE profiles IS 'User profiles with role-based access control';
COMMENT ON COLUMN profiles.id IS 'Foreign key to auth.users table';
COMMENT ON COLUMN profiles.role IS 'User role: customer (default) or admin';

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

-- categories: Flower categories for product organization
-- Examples: "Розы" (Roses), "Тюльпаны" (Tulips), "Букеты" (Bouquets)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraints
ALTER TABLE categories ADD CONSTRAINT categories_name_not_empty
    CHECK (LENGTH(TRIM(name)) > 0);
ALTER TABLE categories ADD CONSTRAINT categories_slug_format
    CHECK (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$');

COMMENT ON TABLE categories IS 'Flower categories for product organization';
COMMENT ON COLUMN categories.slug IS 'URL-friendly identifier (e.g., "roses", "tulips")';
COMMENT ON COLUMN categories.image_url IS 'Category image for catalog display';

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================

-- products: Flower products available for purchase
-- Contains pricing, inventory, and availability information
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraints
ALTER TABLE products ADD CONSTRAINT products_name_not_empty
    CHECK (LENGTH(TRIM(name)) > 0);
ALTER TABLE products ADD CONSTRAINT products_slug_format
    CHECK (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$');
ALTER TABLE products ADD CONSTRAINT products_price_positive
    CHECK (price > 0);
ALTER TABLE products ADD CONSTRAINT products_stock_non_negative
    CHECK (stock_quantity >= 0);

COMMENT ON TABLE products IS 'Flower products with pricing and inventory management';
COMMENT ON COLUMN products.category_id IS 'Foreign key to categories table (RESTRICT on delete to prevent orphaned products)';
COMMENT ON COLUMN products.slug IS 'URL-friendly identifier for product detail pages';
COMMENT ON COLUMN products.price IS 'Current price per unit (stored in numeric for precision)';
COMMENT ON COLUMN products.stock_quantity IS 'Available inventory count';
COMMENT ON COLUMN products.is_available IS 'Product visibility in catalog (can hide out-of-stock items)';
COMMENT ON COLUMN products.is_featured IS 'Display on homepage featured section';
