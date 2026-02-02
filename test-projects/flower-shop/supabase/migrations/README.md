# Database Migrations

This directory contains PostgreSQL migration files for the Flower Shop e-commerce application.

## Migration Order

Migrations are executed in alphabetical order by filename. The timestamp prefix ensures correct execution order:

1. **20260202000000_create_enums.sql** - Create ENUM types
2. **20260202000001_create_base_tables.sql** - Create profiles, categories, products tables
3. **20260202000002_create_order_tables.sql** - Create orders, order_items, cart_items tables
4. **20260202000003_create_functions_and_triggers.sql** - Create helper functions and triggers
5. **20260202000004_create_rls_policies.sql** - Create Row-Level Security policies
6. **20260202000005_create_indexes.sql** - Create performance indexes

## Applying Migrations

### Using Supabase CLI

```bash
# Apply all pending migrations
npx supabase db push

# Reset database and reapply all migrations (WARNING: destructive)
npx supabase db reset
```

### Using Supabase Dashboard

1. Navigate to SQL Editor in your Supabase project
2. Copy and paste the contents of each migration file
3. Execute in order (from 000000 to 000005)

### Using psql (Local Development)

```bash
# Connect to local Supabase database
psql postgresql://postgres:postgres@localhost:54322/postgres

# Execute migrations in order
\i supabase/migrations/20260202000000_create_enums.sql
\i supabase/migrations/20260202000001_create_base_tables.sql
\i supabase/migrations/20260202000002_create_order_tables.sql
\i supabase/migrations/20260202000003_create_functions_and_triggers.sql
\i supabase/migrations/20260202000004_create_rls_policies.sql
\i supabase/migrations/20260202000005_create_indexes.sql
```

## Database Schema Overview

### Tables

- **profiles** - User profiles with role-based access control
- **categories** - Flower categories (Roses, Tulips, Bouquets, etc.)
- **products** - Flower products with pricing and inventory
- **orders** - Customer orders with delivery information
- **order_items** - Order line items with historical pricing
- **cart_items** - Persistent shopping cart

### ENUMs

- **user_role** - `customer`, `admin`
- **order_status** - `pending`, `confirmed`, `preparing`, `delivering`, `completed`, `cancelled`

### Helper Functions

- **generate_order_number()** - Generates unique order numbers (e.g., "ORD-20260202-001")
- **is_admin()** - Checks if current user is admin (used in RLS policies)
- **update_updated_at_column()** - Auto-updates updated_at timestamp
- **handle_new_user()** - Auto-creates profile on user signup

### Triggers

- Auto-update `updated_at` on: profiles, products, orders, cart_items
- Auto-create profile on user signup (auth.users)

## Security Features

All tables have Row-Level Security (RLS) enabled with the following policies:

- **profiles**: Users can view all, modify only their own
- **categories**: Public read, admin-only write
- **products**: Public read, admin-only write
- **orders**: Users view their own or all (admin), create own, admin-only modify/delete
- **order_items**: Users view items from their orders, admin can modify
- **cart_items**: Users can only access their own cart

See [SECURITY.md](./SECURITY.md) for detailed policy documentation.

## Performance Optimizations

23 indexes created for optimal query performance:

- Category filtering on products
- Featured products for homepage
- User order history
- Order status filtering
- Cart item lookups

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed index documentation.

## Seed Data

To populate the database with sample data for testing:

```bash
psql postgresql://postgres:postgres@localhost:54322/postgres \
  -f supabase/migrations/seed_sample_data.sql
```

## Rollback Strategy

If you need to rollback migrations:

```sql
-- Drop all tables (in reverse order)
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop ENUMs
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
```

**Note**: This will delete ALL data. Only use in development.

## Common Issues

### Issue: "relation auth.users does not exist"

**Solution**: Ensure you're running migrations on a Supabase project (not vanilla PostgreSQL). The `auth.users` table is created by Supabase Auth.

### Issue: "permission denied for schema auth"

**Solution**: Ensure the `handle_new_user()` function is created with `SECURITY DEFINER` to allow access to `auth.users`.

### Issue: Profile not created on signup

**Solution**: Verify the trigger on `auth.users` exists:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## Maintenance

### Analyze Tables (After Bulk Imports)

```sql
ANALYZE profiles;
ANALYZE categories;
ANALYZE products;
ANALYZE orders;
ANALYZE order_items;
ANALYZE cart_items;
```

### Monitor Index Usage

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Check Table Sizes

```sql
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Support

For issues or questions:
- Review [Supabase documentation](https://supabase.com/docs)
- Check [PostgreSQL documentation](https://www.postgresql.org/docs/)
- See project README at `/home/user/info7/test-projects/flower-shop/README.md`
