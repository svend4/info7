# Database Setup Guide

Quick-start guide for setting up the Flower Shop PostgreSQL database.

## Prerequisites

- Supabase account (free tier works)
- Supabase project created
- Node.js 18+ installed (for CLI)

## Option 1: Using Supabase Dashboard (Recommended for First Time)

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Enter:
   - Project name: `flower-shop`
   - Database password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be provisioned (~2 minutes)

### Step 2: Apply Migrations via SQL Editor

1. In your Supabase project, navigate to **SQL Editor**
2. Open each migration file from `supabase/migrations/` in this order:

**Migration 1: ENUMs**
- Copy contents of `20260202000000_create_enums.sql`
- Paste into SQL Editor
- Click "Run" (or press Ctrl+Enter)
- Wait for success message

**Migration 2: Base Tables**
- Copy contents of `20260202000001_create_base_tables.sql`
- Paste into SQL Editor
- Click "Run"
- Verify: Tables `profiles`, `categories`, `products` created

**Migration 3: Order Tables**
- Copy contents of `20260202000002_create_order_tables.sql`
- Paste into SQL Editor
- Click "Run"
- Verify: Tables `orders`, `order_items`, `cart_items` created

**Migration 4: Functions and Triggers**
- Copy contents of `20260202000003_create_functions_and_triggers.sql`
- Paste into SQL Editor
- Click "Run"
- Verify: Functions and triggers created (check for success messages)

**Migration 5: RLS Policies**
- Copy contents of `20260202000004_create_rls_policies.sql`
- Paste into SQL Editor
- Click "Run"
- Verify: All tables have RLS enabled (green shield icon in Table Editor)

**Migration 6: Indexes**
- Copy contents of `20260202000005_create_indexes.sql`
- Paste into SQL Editor
- Click "Run"
- Verify: Indexes created (check execution time improvement)

### Step 3: Verify Schema

Navigate to **Table Editor** in Supabase Dashboard and verify:

- [x] 6 tables visible: profiles, categories, products, orders, order_items, cart_items
- [x] RLS enabled on all tables (green shield icon)
- [x] All tables have proper columns and types

### Step 4: (Optional) Load Sample Data

1. Copy contents of `supabase/migrations/seed_sample_data.sql`
2. Paste into SQL Editor
3. Click "Run"
4. Verify: Sample categories, products, and orders created

**IMPORTANT**: Before loading sample data, create test users via Supabase Auth:
- Navigate to **Authentication** → **Users**
- Click "Add user" → "Create new user"
- Create two users:
  - Email: `customer@example.com`, Password: `password123`
  - Email: `admin@example.com`, Password: `admin123`
- Copy their UUIDs and update `seed_sample_data.sql` if needed

### Step 5: Configure Environment Variables

Create `.env.local` in project root:

```bash
# Get these from Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Option 2: Using Supabase CLI (For Local Development)

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
npx supabase login
```

### Step 3: Link Project

```bash
npx supabase link --project-ref your-project-ref
```

**Find your project ref**:
- Supabase Dashboard → Project Settings → General
- Look for "Reference ID"

### Step 4: Apply Migrations

```bash
# Apply all migrations
npx supabase db push

# Or apply individually
npx supabase db push --include-all
```

### Step 5: Verify

```bash
# List all tables
npx supabase db list

# Check RLS status
npx supabase db inspect db:rls
```

## Option 3: Local Development with Supabase CLI

### Step 1: Initialize Supabase

```bash
cd /home/user/info7/test-projects/flower-shop
npx supabase init
```

### Step 2: Start Local Supabase

```bash
npx supabase start
```

**Output**:
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: eyJhbGciOiJIUzI1...
service_role key: eyJhbGciOiJIUzI1...
```

### Step 3: Apply Migrations

```bash
npx supabase db reset
```

This will:
1. Reset local database
2. Apply all migrations from `supabase/migrations/`
3. Create all tables, functions, triggers, policies, and indexes

### Step 4: Access Local Studio

Open http://localhost:54323 in browser to:
- View tables
- Run SQL queries
- Check RLS policies
- Browse data

### Step 5: Load Sample Data

```bash
psql postgresql://postgres:postgres@localhost:54322/postgres \
  -f supabase/migrations/seed_sample_data.sql
```

## Verification Checklist

After setup, verify the following:

### Tables Created
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected**:
- cart_items
- categories
- order_items
- orders
- products
- profiles

### RLS Enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

**Expected**: All tables have `rowsecurity = true`

### Functions Created
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';
```

**Expected**:
- generate_order_number
- handle_new_user
- is_admin
- update_updated_at_column

### Triggers Created
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

**Expected**: 5 triggers (updated_at on 4 tables + on_auth_user_created)

### Indexes Created
```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected**: 23+ indexes (including primary keys and unique constraints)

### Sample Data (If Loaded)
```sql
SELECT 'profiles' AS table_name, COUNT(*) AS count FROM profiles
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'cart_items', COUNT(*) FROM cart_items;
```

**Expected** (with sample data):
- profiles: 2
- categories: 5
- products: 14
- orders: 2
- order_items: 3
- cart_items: 2

## Testing RLS Policies

### Test as Customer

1. Login via Supabase Auth as `customer@example.com`
2. Run queries:

```sql
-- Should succeed (own cart)
SELECT * FROM cart_items WHERE user_id = auth.uid();

-- Should succeed (own orders)
SELECT * FROM orders WHERE user_id = auth.uid();

-- Should fail (other user's orders)
SELECT * FROM orders WHERE user_id = 'other-uuid';
-- Returns empty (filtered by RLS)

-- Should succeed (public products)
SELECT * FROM products;
```

### Test as Admin

1. Login via Supabase Auth as `admin@example.com`
2. First, set role to admin:

```sql
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
```

3. Run queries:

```sql
-- Should succeed (admin can view all orders)
SELECT * FROM orders;

-- Should succeed (admin can update products)
UPDATE products SET price = 100 WHERE id = 'some-uuid';

-- Should succeed (admin can change order status)
UPDATE orders SET status = 'completed' WHERE id = 'some-uuid';
```

## Common Issues

### Issue: "relation auth.users does not exist"

**Solution**: This is a Supabase-specific table. Ensure you're running migrations on a Supabase project, not vanilla PostgreSQL.

### Issue: Profile not auto-created on signup

**Diagnosis**:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**Solution**: Re-run migration `20260202000003_create_functions_and_triggers.sql`

### Issue: RLS blocking all queries

**Diagnosis**: Check if RLS is enabled but no policies exist:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

**Solution**: Run migration `20260202000004_create_rls_policies.sql`

### Issue: Slow queries

**Diagnosis**: Check if indexes exist:
```sql
SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';
```

**Solution**: Run migration `20260202000005_create_indexes.sql`

## Next Steps

1. **Connect your application**:
   - Install Supabase client: `npm install @supabase/supabase-js`
   - Configure with environment variables
   - See `/docs/INTEGRATION_GUIDE.md` (to be created by fullstack agent)

2. **Set up authentication**:
   - Enable email auth in Supabase Dashboard → Authentication → Settings
   - Configure redirect URLs
   - See Supabase Auth documentation

3. **Create admin user**:
   ```sql
   UPDATE profiles SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

4. **Add real product data**:
   - Use Supabase Table Editor, or
   - Create custom seed script, or
   - Build admin panel for data entry

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Schema Diagram](../supabase/migrations/SCHEMA.md)
- [Security Policies](../supabase/migrations/SECURITY.md)
- [Performance Guide](../supabase/migrations/PERFORMANCE.md)
