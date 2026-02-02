# Supabase Database Setup

This directory contains SQL migrations for the Task Manager Pro database schema.

## Quick Start

### Option 1: Using Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/20260201000000_init_task_manager_schema.sql`
4. Paste and run the migration

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push the migration to your database
supabase db push
```

### Option 3: Using Migration Files Directly

```bash
# Apply migration to remote database
supabase db push

# Or apply to local development database
supabase db reset
```

## Migration Files

### `20260201000000_init_task_manager_schema.sql`

Initial database schema including:

- **5 Core Tables**: profiles, categories, tags, tasks, task_tags
- **2 Custom Enums**: task_status, task_priority
- **Row-Level Security**: Policies on all tables for data isolation
- **Performance Indexes**: 15 indexes for common query patterns
- **Triggers**: Auto-update timestamps, auto-create profiles
- **Data Validation**: Check constraints for data integrity

## Schema Overview

```
auth.users (Supabase managed)
    ↓
profiles (1:1 with auth.users)
    ├── categories (many-to-one)
    ├── tags (many-to-one)
    └── tasks (many-to-one)
            ├── category_id → categories (optional)
            └── task_tags (many-to-many with tags)
```

## Security Model

All tables have Row-Level Security (RLS) enabled:

- **profiles**: Readable by all authenticated users, editable by owner only
- **categories, tags, tasks**: Full CRUD only for owner (user_id = auth.uid())
- **task_tags**: Managed only for user's own tasks

## Testing the Schema

After applying the migration:

1. **Test Authentication Flow**:
   ```sql
   -- Sign up creates user + auto-creates profile
   SELECT * FROM profiles WHERE id = auth.uid();
   ```

2. **Test RLS Policies**:
   ```sql
   -- Should only show current user's tasks
   SELECT * FROM tasks;

   -- Should fail (trying to access another user's data)
   SELECT * FROM tasks WHERE user_id != auth.uid();
   ```

3. **Test Data Integrity**:
   ```sql
   -- Should fail (invalid email format)
   INSERT INTO profiles (id, email) VALUES (gen_random_uuid(), 'invalid-email');

   -- Should fail (invalid color format)
   INSERT INTO categories (user_id, name, color)
   VALUES (auth.uid(), 'Work', 'red');

   -- Should succeed (valid hex color)
   INSERT INTO categories (user_id, name, color)
   VALUES (auth.uid(), 'Work', '#FF0000');
   ```

## Performance Considerations

The schema includes indexes for:

- User data filtering (`idx_tasks_user_id`)
- Status filtering (`idx_tasks_status`)
- Due date sorting (`idx_tasks_due_date`)
- Composite queries (`idx_tasks_user_id_status`)

Typical queries should perform well up to 100K+ tasks per user.

## Rollback

To rollback this migration:

```sql
-- Drop all tables, types, and functions
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
```

## Next Steps

After applying the migration:

1. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Test the schema with sample data
3. Integrate with your Next.js application
4. Run the supabase-auditor agent for security validation

## Support

For issues or questions:
- Check Supabase docs: https://supabase.com/docs
- Review RLS policies: https://supabase.com/docs/guides/auth/row-level-security
- Consult the database-architect agent for schema changes
