# Database Schema Diagram

This document provides a visual representation of the Flower Shop database schema.

## Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION LAYER                               │
│                                                                              │
│  ┌──────────────────┐                                                        │
│  │   auth.users     │ (Supabase Auth - System Table)                        │
│  ├──────────────────┤                                                        │
│  │ id (PK)          │                                                        │
│  │ email            │                                                        │
│  │ ...              │                                                        │
│  └──────────────────┘                                                        │
│         │                                                                    │
│         │ 1:1                                                                │
│         ▼                                                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION LAYER                                 │
│                                                                              │
│  ┌──────────────────┐                                                        │
│  │    profiles      │ (User Profiles)                                       │
│  ├──────────────────┤                                                        │
│  │ id (PK, FK)      │──────────┐                                            │
│  │ email            │          │                                            │
│  │ full_name        │          │ 1:N                                        │
│  │ phone            │          │                                            │
│  │ role (ENUM)      │          │                                            │
│  │ created_at       │          │                                            │
│  │ updated_at       │          │                                            │
│  └──────────────────┘          │                                            │
│                                │                                            │
│                                ▼                                            │
│  ┌──────────────────────────────────────────┐                               │
│  │              orders                       │                               │
│  ├──────────────────────────────────────────┤                               │
│  │ id (PK)                                   │──────────┐                    │
│  │ user_id (FK) ────────────────────────────┘          │                    │
│  │ order_number (UNIQUE)                               │ 1:N                │
│  │ status (ENUM)                                       │                    │
│  │ total_amount                                        │                    │
│  │ delivery_address                                    │                    │
│  │ delivery_date                                       │                    │
│  │ delivery_time                                       │                    │
│  │ customer_name                                       │                    │
│  │ customer_phone                                      │                    │
│  │ customer_email                                      │                    │
│  │ notes                                               │                    │
│  │ created_at                                          │                    │
│  │ updated_at                                          │                    │
│  └──────────────────────────────────────────┘          │                    │
│                                                         ▼                    │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │                     order_items                              │            │
│  ├─────────────────────────────────────────────────────────────┤            │
│  │ id (PK)                                                      │            │
│  │ order_id (FK) ──────────────────────────────────────────────┘            │
│  │ product_id (FK) ─────────────────┐                                       │
│  │ quantity                          │                                       │
│  │ price_at_purchase                 │                                       │
│  │ created_at                        │                                       │
│  └───────────────────────────────────┘                                       │
│                                      │                                       │
│                                      │                                       │
└──────────────────────────────────────┼───────────────────────────────────────┘
                                       │
┌──────────────────────────────────────┼───────────────────────────────────────┐
│                         CATALOG LAYER                                        │
│                                      │                                       │
│  ┌──────────────────┐                │                                       │
│  │   categories     │                │                                       │
│  ├──────────────────┤                │                                       │
│  │ id (PK)          │──────────┐     │                                       │
│  │ name             │          │     │                                       │
│  │ slug (UNIQUE)    │          │ 1:N │                                       │
│  │ description      │          │     │                                       │
│  │ image_url        │          │     │                                       │
│  │ created_at       │          │     │                                       │
│  └──────────────────┘          │     │                                       │
│                                │     │                                       │
│                                ▼     │                                       │
│  ┌────────────────────────────────────────┐                                 │
│  │           products                     │◄────────────────────────────────┘
│  ├────────────────────────────────────────┤                                  │
│  │ id (PK)                                │──────────┐                       │
│  │ category_id (FK) ──────────────────────┘          │                       │
│  │ name                                              │ 1:N                   │
│  │ slug (UNIQUE)                                     │                       │
│  │ description                                       │                       │
│  │ price                                             │                       │
│  │ image_url                                         │                       │
│  │ stock_quantity                                    │                       │
│  │ is_available                                      │                       │
│  │ is_featured                                       │                       │
│  │ created_at                                        │                       │
│  │ updated_at                                        │                       │
│  └────────────────────────────────────────┘          │                       │
│                                                      │                       │
│                                                      ▼                       │
└──────────────────────────────────────────────────────┼───────────────────────┘
                                                       │
┌──────────────────────────────────────────────────────┼───────────────────────┐
│                         SHOPPING CART LAYER                                  │
│                                                      │                       │
│  ┌────────────────────────────────────────┐         │                       │
│  │          cart_items                    │         │                       │
│  ├────────────────────────────────────────┤         │                       │
│  │ id (PK)                                │         │                       │
│  │ user_id (FK to profiles)               │         │                       │
│  │ product_id (FK) ───────────────────────┼─────────┘                       │
│  │ quantity                               │                                 │
│  │ created_at                             │                                 │
│  │ updated_at                             │                                 │
│  │ UNIQUE(user_id, product_id)            │                                 │
│  └────────────────────────────────────────┘                                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Relationship Details

### One-to-One Relationships

| Parent | Child | Description |
|--------|-------|-------------|
| auth.users | profiles | Each authenticated user has exactly one profile |

### One-to-Many Relationships

| Parent | Child | Foreign Key | Delete Behavior |
|--------|-------|-------------|-----------------|
| profiles | orders | user_id | CASCADE (delete user → delete orders) |
| orders | order_items | order_id | CASCADE (delete order → delete items) |
| products | order_items | product_id | RESTRICT (preserve order history) |
| categories | products | category_id | RESTRICT (prevent orphaned products) |
| profiles | cart_items | user_id | CASCADE (delete user → delete cart) |
| products | cart_items | product_id | CASCADE (delete product → remove from carts) |

## ENUM Types

### user_role

```sql
CREATE TYPE user_role AS ENUM ('customer', 'admin');
```

**Values**:
- `customer` - Regular users (default)
- `admin` - Administrators with full access

**Usage**: `profiles.role`

### order_status

```sql
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'delivering',
    'completed',
    'cancelled'
);
```

**Order Lifecycle**:
```
pending → confirmed → preparing → delivering → completed
   ↓                                               ↓
cancelled ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

**Usage**: `orders.status`

## Constraints

### Primary Keys

All tables use UUID primary keys generated via `gen_random_uuid()`:
- More secure than sequential integers
- Globally unique (no collisions in distributed systems)
- Non-guessable (security benefit)

### Foreign Keys

| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| profiles | id | auth.users(id) | CASCADE |
| products | category_id | categories(id) | RESTRICT |
| orders | user_id | profiles(id) | CASCADE |
| order_items | order_id | orders(id) | CASCADE |
| order_items | product_id | products(id) | RESTRICT |
| cart_items | user_id | profiles(id) | CASCADE |
| cart_items | product_id | products(id) | CASCADE |

### Unique Constraints

| Table | Column(s) | Purpose |
|-------|-----------|---------|
| categories | slug | URL-friendly category identifier |
| products | slug | URL-friendly product identifier |
| orders | order_number | Human-readable order tracking |
| cart_items | (user_id, product_id) | One product per user cart |

### Check Constraints

| Table | Constraint | Rule |
|-------|-----------|------|
| profiles | email_check | Valid email format |
| categories | name_not_empty | Name length > 0 |
| categories | slug_format | Lowercase alphanumeric with hyphens |
| products | name_not_empty | Name length > 0 |
| products | slug_format | Lowercase alphanumeric with hyphens |
| products | price_positive | price > 0 |
| products | stock_non_negative | stock_quantity >= 0 |
| orders | customer_name_not_empty | Customer name length > 0 |
| orders | customer_phone_not_empty | Phone length > 0 |
| orders | delivery_address_not_empty | Address length > 0 |
| orders | total_amount_non_negative | total_amount >= 0 |
| orders | delivery_date_future_or_today | delivery_date >= CURRENT_DATE |
| order_items | quantity_positive | quantity > 0 |
| order_items | price_positive | price_at_purchase > 0 |
| cart_items | quantity_positive | quantity > 0 |

## Normalization Level

The schema achieves **Third Normal Form (3NF)**:

### 1NF (First Normal Form)
- [x] All columns contain atomic values
- [x] No repeating groups
- [x] Each row is unique (primary key)

### 2NF (Second Normal Form)
- [x] Meets 1NF requirements
- [x] No partial dependencies on composite keys

### 3NF (Third Normal Form)
- [x] Meets 2NF requirements
- [x] No transitive dependencies

**Exception**: Denormalization in `orders` table for historical preservation:
- `customer_name`, `customer_phone`, `customer_email` are duplicated from `profiles`
- **Rationale**: Preserve customer information at time of order (even if profile changes)
- **Trade-off**: Slight redundancy for data integrity and audit trail

## Data Types

### UUID
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```
- 128-bit unique identifier
- Size: 16 bytes
- Example: `550e8400-e29b-41d4-a716-446655440000`

### TEXT
```sql
name TEXT NOT NULL
```
- Variable-length string
- No length limit (practical limit: ~1GB)
- Used for: names, descriptions, addresses, notes

### NUMERIC(10, 2)
```sql
price NUMERIC(10, 2) NOT NULL
```
- Exact decimal storage (no floating-point errors)
- 10 total digits, 2 decimal places
- Range: -99,999,999.99 to 99,999,999.99
- Example: 2500.00

### INTEGER
```sql
stock_quantity INTEGER NOT NULL DEFAULT 0
```
- 32-bit signed integer
- Range: -2,147,483,648 to 2,147,483,647
- Used for: quantities, counts

### BOOLEAN
```sql
is_available BOOLEAN NOT NULL DEFAULT TRUE
```
- True/False values
- Size: 1 byte
- Used for: flags, toggles

### TIMESTAMPTZ
```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```
- Timestamp with timezone
- Stored in UTC, displayed in session timezone
- Example: `2026-02-02 10:30:45+00`

### DATE
```sql
delivery_date DATE
```
- Calendar date (no time component)
- Example: `2026-02-15`

## Functions and Triggers

### Functions

| Function | Purpose | Usage |
|----------|---------|-------|
| `update_updated_at_column()` | Auto-update updated_at | BEFORE UPDATE triggers |
| `generate_order_number()` | Generate unique order IDs | Order creation |
| `is_admin()` | Check admin role | RLS policies |
| `handle_new_user()` | Auto-create profile | AFTER INSERT on auth.users |

### Triggers

| Table | Trigger | Function | When |
|-------|---------|----------|------|
| profiles | update_profiles_updated_at | update_updated_at_column() | BEFORE UPDATE |
| products | update_products_updated_at | update_updated_at_column() | BEFORE UPDATE |
| orders | update_orders_updated_at | update_updated_at_column() | BEFORE UPDATE |
| cart_items | update_cart_items_updated_at | update_updated_at_column() | BEFORE UPDATE |
| auth.users | on_auth_user_created | handle_new_user() | AFTER INSERT |

## Storage Estimates

Assumptions:
- 100 categories
- 10,000 products
- 100,000 users
- 500,000 orders
- 2,000,000 order items
- 50,000 active cart items

| Table | Estimated Size | Notes |
|-------|---------------|-------|
| profiles | 15 MB | ~150 bytes per row |
| categories | <1 MB | Small, rarely changes |
| products | 5 MB | ~500 bytes per row |
| orders | 150 MB | ~300 bytes per row |
| order_items | 100 MB | ~50 bytes per row |
| cart_items | 3 MB | Temporary, frequently cleared |
| **Indexes** | 50 MB | ~15-20% of table data |
| **Total** | ~325 MB | For 500K orders |

## Query Patterns

### Most Frequent Queries

1. **View products by category** (catalog page)
   ```sql
   SELECT * FROM products
   WHERE category_id = ? AND is_available = true;
   ```

2. **View user's cart** (cart page)
   ```sql
   SELECT * FROM cart_items WHERE user_id = auth.uid();
   ```

3. **View user's order history** (profile page)
   ```sql
   SELECT * FROM orders
   WHERE user_id = auth.uid()
   ORDER BY created_at DESC;
   ```

4. **View featured products** (homepage)
   ```sql
   SELECT * FROM products WHERE is_featured = true;
   ```

5. **View order details with items** (order detail page)
   ```sql
   SELECT o.*, oi.*, p.name
   FROM orders o
   JOIN order_items oi ON o.id = oi.order_id
   JOIN products p ON oi.product_id = p.id
   WHERE o.id = ?;
   ```

All queries are optimized with appropriate indexes (see PERFORMANCE.md).

## References

- Migration files: `/supabase/migrations/`
- Security policies: [SECURITY.md](./SECURITY.md)
- Performance indexes: [PERFORMANCE.md](./PERFORMANCE.md)
- Quick start: [README.md](./README.md)
