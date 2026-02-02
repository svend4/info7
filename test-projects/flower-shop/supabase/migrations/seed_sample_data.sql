-- Migration: seed_sample_data.sql
-- Purpose: Populate database with sample data for testing
-- Author: database-architect agent
-- Date: 2026-02-02
-- WARNING: This is for DEVELOPMENT/TESTING only. Do NOT run in production.

-- ============================================================================
-- SAMPLE PROFILES
-- ============================================================================

-- Create sample users (in real app, these are created by Supabase Auth)
-- Note: You'll need to manually create these users via Supabase Auth UI or API first

-- Sample customer user
INSERT INTO profiles (id, email, full_name, phone, role, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'customer@example.com', 'Иван Петров', '+7 (999) 123-45-67', 'customer', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample admin user
INSERT INTO profiles (id, email, full_name, phone, role, created_at, updated_at)
VALUES
    ('22222222-2222-2222-2222-222222222222', 'admin@example.com', 'Мария Админова', '+7 (999) 888-88-88', 'admin', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE CATEGORIES
-- ============================================================================

INSERT INTO categories (id, name, slug, description, image_url, created_at)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Розы', 'roses', 'Элегантные розы различных цветов для любого повода', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7', NOW()),
    ('c2222222-2222-2222-2222-222222222222', 'Тюльпаны', 'tulips', 'Нежные тюльпаны - символ весны и радости', 'https://images.unsplash.com/photo-1520763185298-1b434c919102', NOW()),
    ('c3333333-3333-3333-3333-333333333333', 'Букеты', 'bouquets', 'Готовые букеты для особых случаев', 'https://images.unsplash.com/photo-1561181286-d3fee7d55364', NOW()),
    ('c4444444-4444-4444-4444-444444444444', 'Орхидеи', 'orchids', 'Экзотические орхидеи для ценителей красоты', 'https://images.unsplash.com/photo-1558879621-4956c9c8f2e4', NOW()),
    ('c5555555-5555-5555-5555-555555555555', 'Лилии', 'lilies', 'Утонченные лилии с изысканным ароматом', 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE PRODUCTS
-- ============================================================================

-- Roses
INSERT INTO products (id, category_id, name, slug, description, price, image_url, stock_quantity, is_available, is_featured, created_at, updated_at)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Красные розы (25 шт)', 'red-roses-25', 'Классический букет из 25 красных роз высшего качества', 2500.00, 'https://images.unsplash.com/photo-1568610876039-1f95cb74c3be', 50, true, true, NOW(), NOW()),
    ('p1111111-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111', 'Белые розы (11 шт)', 'white-roses-11', 'Нежный букет из 11 белых роз', 1200.00, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7', 30, true, false, NOW(), NOW()),
    ('p1111111-1111-1111-1111-111111111113', 'c1111111-1111-1111-1111-111111111111', 'Розовые розы (15 шт)', 'pink-roses-15', 'Романтический букет из 15 розовых роз', 1800.00, 'https://images.unsplash.com/photo-1545241047-6083a3684587', 40, true, true, NOW(), NOW()),

-- Tulips
    ('p2222222-2222-2222-2222-222222222221', 'c2222222-2222-2222-2222-222222222222', 'Красные тюльпаны (51 шт)', 'red-tulips-51', 'Большой букет из 51 красного тюльпана', 3500.00, 'https://images.unsplash.com/photo-1520763185298-1b434c919102', 25, true, true, NOW(), NOW()),
    ('p2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Желтые тюльпаны (25 шт)', 'yellow-tulips-25', 'Солнечный букет из 25 желтых тюльпанов', 1800.00, 'https://images.unsplash.com/photo-1517087784325-c7cbc8c72c05', 35, true, false, NOW(), NOW()),
    ('p2222222-2222-2222-2222-222222222223', 'c2222222-2222-2222-2222-222222222222', 'Микс тюльпанов (35 шт)', 'mixed-tulips-35', 'Яркая композиция из разноцветных тюльпанов', 2400.00, 'https://images.unsplash.com/photo-1490750967868-88aa4486c946', 20, true, false, NOW(), NOW()),

-- Bouquets
    ('p3333333-3333-3333-3333-333333333331', 'c3333333-3333-3333-3333-333333333333', 'Букет "Весенний"', 'spring-bouquet', 'Композиция из тюльпанов, ирисов и зелени', 3200.00, 'https://images.unsplash.com/photo-1561181286-d3fee7d55364', 15, true, true, NOW(), NOW()),
    ('p3333333-3333-3333-3333-333333333332', 'c3333333-3333-3333-3333-333333333333', 'Букет "Романтика"', 'romance-bouquet', 'Нежная композиция из роз, эустомы и гипсофилы', 4500.00, 'https://images.unsplash.com/photo-1502359925369-b62b60f91805', 10, true, true, NOW(), NOW()),
    ('p3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Букет "Праздничный"', 'festive-bouquet', 'Роскошная композиция из роз, лилий и орхидей', 6500.00, 'https://images.unsplash.com/photo-1487070183336-b863922373d4', 8, true, false, NOW(), NOW()),

-- Orchids
    ('p4444444-4444-4444-4444-444444444441', 'c4444444-4444-4444-4444-444444444444', 'Орхидея Фаленопсис белая', 'white-phalaenopsis', 'Элегантная белая орхидея в горшке', 2800.00, 'https://images.unsplash.com/photo-1558879621-4956c9c8f2e4', 12, true, false, NOW(), NOW()),
    ('p4444444-4444-4444-4444-444444444442', 'c4444444-4444-4444-4444-444444444444', 'Орхидея Фаленопсис розовая', 'pink-phalaenopsis', 'Нежная розовая орхидея в кашпо', 3000.00, 'https://images.unsplash.com/photo-1557000721-24051276d31e', 10, true, false, NOW(), NOW()),

-- Lilies
    ('p5555555-5555-5555-5555-555555555551', 'c5555555-5555-5555-5555-555555555555', 'Белые лилии (7 шт)', 'white-lilies-7', 'Изысканный букет из 7 белых лилий', 2200.00, 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7', 18, true, false, NOW(), NOW()),
    ('p5555555-5555-5555-5555-555555555552', 'c5555555-5555-5555-5555-555555555555', 'Розовые лилии (5 шт)', 'pink-lilies-5', 'Нежный букет из 5 розовых лилий', 1800.00, 'https://images.unsplash.com/photo-1528908698403-e0e91816eae4', 20, true, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE CART ITEMS (for customer user)
-- ============================================================================

INSERT INTO cart_items (id, user_id, product_id, quantity, created_at, updated_at)
VALUES
    ('ca111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 2, NOW(), NOW()),
    ('ca111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'p2222222-2222-2222-2222-222222222221', 1, NOW(), NOW())
ON CONFLICT (user_id, product_id) DO NOTHING;

-- ============================================================================
-- SAMPLE ORDERS
-- ============================================================================

INSERT INTO orders (
    id, user_id, order_number, status, total_amount,
    delivery_address, delivery_date, delivery_time,
    customer_name, customer_phone, customer_email, notes,
    created_at, updated_at
)
VALUES
    (
        'o1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'ORD-20260201-001',
        'completed',
        4300.00,
        'Москва, ул. Пушкина, д. 10, кв. 25',
        '2026-02-01',
        '14:00-16:00',
        'Иван Петров',
        '+7 (999) 123-45-67',
        'customer@example.com',
        'Позвонить за 30 минут до доставки',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'o1111111-1111-1111-1111-111111111112',
        '11111111-1111-1111-1111-111111111111',
        'ORD-20260202-001',
        'pending',
        7000.00,
        'Москва, Ленинский проспект, д. 45',
        '2026-02-05',
        '10:00-12:00',
        'Иван Петров',
        '+7 (999) 123-45-67',
        'customer@example.com',
        'Букет для юбилея',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE ORDER ITEMS
-- ============================================================================

INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase, created_at)
VALUES
    -- Order 1 items
    ('oi111111-1111-1111-1111-111111111111', 'o1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 1, 2500.00, NOW() - INTERVAL '2 days'),
    ('oi111111-1111-1111-1111-111111111112', 'o1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111113', 1, 1800.00, NOW() - INTERVAL '2 days'),

    -- Order 2 items
    ('oi111111-1111-1111-1111-111111111113', 'o1111111-1111-1111-1111-111111111112', 'p2222222-2222-2222-2222-222222222221', 2, 3500.00, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFY SAMPLE DATA
-- ============================================================================

-- Check counts
DO $$
DECLARE
    profiles_count INTEGER;
    categories_count INTEGER;
    products_count INTEGER;
    orders_count INTEGER;
    order_items_count INTEGER;
    cart_items_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profiles_count FROM profiles;
    SELECT COUNT(*) INTO categories_count FROM categories;
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO orders_count FROM orders;
    SELECT COUNT(*) INTO order_items_count FROM order_items;
    SELECT COUNT(*) INTO cart_items_count FROM cart_items;

    RAISE NOTICE 'Sample data loaded successfully:';
    RAISE NOTICE '  Profiles: %', profiles_count;
    RAISE NOTICE '  Categories: %', categories_count;
    RAISE NOTICE '  Products: %', products_count;
    RAISE NOTICE '  Orders: %', orders_count;
    RAISE NOTICE '  Order Items: %', order_items_count;
    RAISE NOTICE '  Cart Items: %', cart_items_count;
END $$;

-- ============================================================================
-- NOTES
-- ============================================================================

-- To use this sample data:
-- 1. Create users via Supabase Auth with IDs:
--    - 11111111-1111-1111-1111-111111111111 (customer@example.com)
--    - 22222222-2222-2222-2222-222222222222 (admin@example.com)
-- 2. Run this SQL file to populate database
-- 3. Login with customer@example.com to see orders and cart
-- 4. Login with admin@example.com for admin access

-- Sample user credentials (set in Supabase Auth):
-- Customer: customer@example.com / password123
-- Admin: admin@example.com / admin123

-- WARNING: DO NOT use this in production!
-- This is for development and testing purposes only.
