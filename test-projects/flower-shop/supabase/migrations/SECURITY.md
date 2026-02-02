# Row-Level Security (RLS) Policies

This document details the security implementation for the Flower Shop database.

## Overview

All tables have Row-Level Security (RLS) enabled to ensure:
- Data isolation between users
- Role-based access control (customer vs admin)
- Protection against unauthorized access
- Audit trail preservation

## Security Model

### User Roles

```sql
CREATE TYPE user_role AS ENUM ('customer', 'admin');
```

- **customer** (default): Regular users who can browse and purchase
- **admin**: Full system access for management operations

### Admin Check Function

```sql
CREATE FUNCTION is_admin() RETURNS BOOLEAN
```

Used throughout RLS policies to check admin privileges:
- Queries `profiles` table for current user's role
- Created with `SECURITY DEFINER` for elevated permissions
- Called by: `is_admin()` in policy definitions

## Table-by-Table Policies

### 1. Profiles Table

**Security Goal**: Users control their own data, but profiles are viewable for orders/admin.

| Operation | Policy | Allowed Users | Rationale |
|-----------|--------|---------------|-----------|
| SELECT | `profiles_select_authenticated` | All authenticated users | Needed to display customer names in orders |
| INSERT | `profiles_insert_own` | Owner (id = auth.uid()) | Auto-created by trigger, fallback for edge cases |
| UPDATE | `profiles_update_own` | Owner (id = auth.uid()) | Users manage their own profile |
| DELETE | `profiles_delete_own` | Owner (id = auth.uid()) | Users can delete their account |

**Example Query (Allowed)**:
```sql
-- User viewing their own profile
SELECT * FROM profiles WHERE id = auth.uid();

-- Admin viewing customer profile
SELECT * FROM profiles WHERE id = 'customer-uuid';
```

**Example Query (Denied)**:
```sql
-- User trying to update another user's profile
UPDATE profiles SET role = 'admin' WHERE id = 'other-user-uuid';
-- Error: Policy violation
```

### 2. Categories Table

**Security Goal**: Public catalog browsing, admin-only management.

| Operation | Policy | Allowed Users | Rationale |
|-----------|--------|---------------|-----------|
| SELECT | `categories_select_public` | Everyone (including anonymous) | Public catalog browsing |
| INSERT | `categories_insert_admin` | Admins only | Prevent unauthorized category creation |
| UPDATE | `categories_update_admin` | Admins only | Prevent category manipulation |
| DELETE | `categories_delete_admin` | Admins only | Prevent data loss |

**Example Query (Allowed)**:
```sql
-- Anonymous user browsing categories
SELECT * FROM categories;

-- Admin creating category
INSERT INTO categories (name, slug) VALUES ('Розы', 'roses');
```

**Example Query (Denied)**:
```sql
-- Customer trying to create category
INSERT INTO categories (name, slug) VALUES ('Fake', 'fake');
-- Error: Policy violation (not admin)
```

### 3. Products Table

**Security Goal**: Public product viewing, admin-only inventory management.

| Operation | Policy | Allowed Users | Rationale |
|-----------|--------|---------------|-----------|
| SELECT | `products_select_public` | Everyone (including anonymous) | Public product catalog |
| INSERT | `products_insert_admin` | Admins only | Prevent unauthorized products |
| UPDATE | `products_update_admin` | Admins only | Prevent price/stock manipulation |
| DELETE | `products_delete_admin` | Admins only | Prevent inventory loss |

**Example Query (Allowed)**:
```sql
-- Anonymous user viewing products
SELECT * FROM products WHERE is_available = true;

-- Admin updating stock
UPDATE products SET stock_quantity = 50 WHERE id = 'product-uuid';
```

**Example Query (Denied)**:
```sql
-- Customer trying to change price
UPDATE products SET price = 0.01 WHERE id = 'product-uuid';
-- Error: Policy violation (not admin)
```

### 4. Orders Table

**Security Goal**: Users see their own orders, admins manage all orders.

| Operation | Policy | Allowed Users | Rationale |
|-----------|--------|---------------|-----------|
| SELECT | `orders_select_own_or_admin` | Owner OR Admin | Data isolation + admin oversight |
| INSERT | `orders_insert_authenticated` | Owner (user_id = auth.uid()) | Prevent order spoofing |
| UPDATE | `orders_update_admin` | Admins only | Status changes require admin |
| DELETE | `orders_delete_admin` | Admins only | Prevent order history loss |

**Example Query (Allowed)**:
```sql
-- User viewing their orders
SELECT * FROM orders WHERE user_id = auth.uid();

-- Admin viewing all orders
SELECT * FROM orders; -- (if is_admin() = true)

-- User creating their own order
INSERT INTO orders (user_id, total_amount, ...)
VALUES (auth.uid(), 100.00, ...);
```

**Example Query (Denied)**:
```sql
-- User trying to view another user's orders
SELECT * FROM orders WHERE user_id = 'other-user-uuid';
-- Error: Returns empty (policy filters it out)

-- User trying to update order status
UPDATE orders SET status = 'completed' WHERE id = 'order-uuid';
-- Error: Policy violation (not admin)
```

### 5. Order Items Table

**Security Goal**: Users see items from their orders, admins manage all.

| Operation | Policy | Allowed Users | Rationale |
|-----------|--------|---------------|-----------|
| SELECT | `order_items_select_own_or_admin` | Owner (via order) OR Admin | Data isolation |
| INSERT | `order_items_insert_on_order_creation` | Owner (via order) | Allow order creation |
| UPDATE | `order_items_update_admin` | Admins only | Prevent order tampering |
| DELETE | `order_items_delete_admin` | Admins only | Preserve order history |

**Example Query (Allowed)**:
```sql
-- User viewing items from their order
SELECT * FROM order_items
WHERE order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
);

-- User creating order items during checkout
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
VALUES ('user-owned-order-uuid', 'product-uuid', 2, 50.00);
```

**Example Query (Denied)**:
```sql
-- User trying to add items to another user's order
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
VALUES ('other-user-order-uuid', 'product-uuid', 2, 50.00);
-- Error: Policy violation (order not owned by user)
```

### 6. Cart Items Table

**Security Goal**: Complete cart isolation per user.

| Operation | Policy | Allowed Users | Rationale |
|-----------|--------|---------------|-----------|
| SELECT | `cart_items_select_own` | Owner (user_id = auth.uid()) | Cart privacy |
| INSERT | `cart_items_insert_own` | Owner (user_id = auth.uid()) | Prevent cart injection |
| UPDATE | `cart_items_update_own` | Owner (user_id = auth.uid()) | Quantity changes |
| DELETE | `cart_items_delete_own` | Owner (user_id = auth.uid()) | Remove from cart |

**Example Query (Allowed)**:
```sql
-- User viewing their cart
SELECT * FROM cart_items WHERE user_id = auth.uid();

-- User adding to cart
INSERT INTO cart_items (user_id, product_id, quantity)
VALUES (auth.uid(), 'product-uuid', 2);
```

**Example Query (Denied)**:
```sql
-- User trying to view another user's cart
SELECT * FROM cart_items WHERE user_id = 'other-user-uuid';
-- Error: Returns empty (policy filters it out)
```

## Security Best Practices

### 1. Always Use auth.uid()

```sql
-- CORRECT: Uses Supabase's authenticated user ID
SELECT * FROM orders WHERE user_id = auth.uid();

-- INCORRECT: Never trust client-provided user IDs
SELECT * FROM orders WHERE user_id = :userId; -- Vulnerable to spoofing
```

### 2. Policy Layering

Policies use both `USING` and `WITH CHECK` clauses:

```sql
-- USING: Controls which rows can be seen/modified
-- WITH CHECK: Controls which values can be inserted/updated

CREATE POLICY "cart_items_update_own"
    ON cart_items FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())        -- Can only update own cart
    WITH CHECK (user_id = auth.uid());  -- Cannot change user_id to someone else
```

### 3. Admin Checks

All admin operations verify role via `is_admin()`:

```sql
CREATE POLICY "products_update_admin"
    ON products FOR UPDATE
    TO authenticated
    USING (is_admin())        -- Only admins can update
    WITH CHECK (is_admin());  -- Ensures admin status throughout transaction
```

### 4. Subquery Policies

Order items use subquery to check ownership:

```sql
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
```

## Testing RLS Policies

### Test as Customer

```sql
-- Set session to act as customer
SET request.jwt.claims.sub = 'customer-uuid';

-- Should succeed
SELECT * FROM products;
SELECT * FROM orders WHERE user_id = 'customer-uuid';

-- Should fail
UPDATE products SET price = 0;
SELECT * FROM orders WHERE user_id = 'other-customer-uuid';
```

### Test as Admin

```sql
-- Create admin user
INSERT INTO profiles (id, email, role)
VALUES ('admin-uuid', 'admin@example.com', 'admin');

-- Set session to act as admin
SET request.jwt.claims.sub = 'admin-uuid';

-- Should succeed
UPDATE products SET price = 100;
SELECT * FROM orders; -- All orders
UPDATE orders SET status = 'completed';
```

### Test as Anonymous

```sql
-- Remove authentication
RESET request.jwt.claims.sub;

-- Should succeed
SELECT * FROM products;
SELECT * FROM categories;

-- Should fail
SELECT * FROM orders;
INSERT INTO cart_items (...);
```

## Common Security Issues

### Issue: User Can't See Their Own Data

**Symptom**: Authenticated user receives empty results for their own data.

**Diagnosis**:
```sql
-- Check if auth.uid() returns expected value
SELECT auth.uid();

-- Check if user exists in profiles
SELECT * FROM profiles WHERE id = auth.uid();
```

**Solution**: Ensure user has profile (should be auto-created by trigger).

### Issue: Admin Can't Modify Data

**Symptom**: Admin user receives policy violation errors.

**Diagnosis**:
```sql
-- Check admin role
SELECT role FROM profiles WHERE id = auth.uid();

-- Test is_admin() function
SELECT is_admin();
```

**Solution**: Ensure user's role is set to 'admin' in profiles table.

### Issue: Policy Performance Degradation

**Symptom**: Slow queries on large tables with RLS.

**Diagnosis**:
```sql
-- Check query plan
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = auth.uid();
```

**Solution**: Ensure indexes exist on foreign keys (see PERFORMANCE.md).

## Security Audit Checklist

- [ ] All tables have RLS enabled
- [ ] No public write access to sensitive tables
- [ ] Admin checks use `is_admin()` function
- [ ] User IDs verified via `auth.uid()`, never client input
- [ ] Policies use both `USING` and `WITH CHECK` where applicable
- [ ] Subquery policies indexed for performance
- [ ] Test cases cover: anonymous, customer, admin roles
- [ ] No sensitive data exposed in error messages

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Migration file: `20260202000004_create_rls_policies.sql`
