# Database Schema Validation Checklist

**Project:** Task Manager Pro
**Migration:** 20260201000000_init_task_manager_schema.sql
**Validation Date:** 2026-02-01

## Pre-Deployment Checklist

### Schema Design

- [x] All required tables created (profiles, categories, tags, tasks, task_tags)
- [x] Foreign key relationships defined correctly
- [x] Primary keys defined on all tables
- [x] Enums created before tables (task_status, task_priority)
- [x] Timestamp columns use TIMESTAMPTZ for timezone awareness
- [x] UUID generation uses gen_random_uuid()

### Data Integrity

- [x] Foreign keys have appropriate ON DELETE actions
  - [x] profiles → auth.users: ON DELETE CASCADE
  - [x] categories → profiles: ON DELETE CASCADE
  - [x] tags → profiles: ON DELETE CASCADE
  - [x] tasks → profiles: ON DELETE CASCADE
  - [x] tasks → categories: ON DELETE SET NULL
  - [x] task_tags → tasks: ON DELETE CASCADE
  - [x] task_tags → tags: ON DELETE CASCADE

- [x] NOT NULL constraints on required fields
  - [x] profiles.email
  - [x] categories.name, categories.color
  - [x] tags.name
  - [x] tasks.title, tasks.status, tasks.priority

- [x] Check constraints for data validation
  - [x] Email format validation (profiles.email)
  - [x] Hex color format validation (categories.color)
  - [x] Non-empty string validation (name, title fields)
  - [x] Future due date validation (tasks.due_date >= created_at)

- [x] Unique constraints to prevent duplicates
  - [x] categories: UNIQUE(user_id, name)
  - [x] tags: UNIQUE(user_id, name)
  - [x] task_tags: PRIMARY KEY(task_id, tag_id)

### Security (RLS)

- [x] RLS enabled on ALL tables
  - [x] profiles
  - [x] categories
  - [x] tags
  - [x] tasks
  - [x] task_tags

- [x] RLS policies created for profiles
  - [x] SELECT: All authenticated users
  - [x] INSERT: Own profile only
  - [x] UPDATE: Own profile only
  - [x] DELETE: Own profile only

- [x] RLS policies created for categories
  - [x] SELECT: Own categories only
  - [x] INSERT: Own categories only
  - [x] UPDATE: Own categories only
  - [x] DELETE: Own categories only

- [x] RLS policies created for tags
  - [x] SELECT: Own tags only
  - [x] INSERT: Own tags only
  - [x] UPDATE: Own tags only
  - [x] DELETE: Own tags only

- [x] RLS policies created for tasks
  - [x] SELECT: Own tasks only
  - [x] INSERT: Own tasks only
  - [x] UPDATE: Own tasks only
  - [x] DELETE: Own tasks only

- [x] RLS policies created for task_tags
  - [x] SELECT: Own tasks only (via subquery)
  - [x] INSERT: Own tasks only (via subquery)
  - [x] DELETE: Own tasks only (via subquery)

### Performance (Indexes)

- [x] Indexes on foreign key columns
  - [x] categories.user_id
  - [x] tags.user_id
  - [x] tasks.user_id
  - [x] tasks.category_id
  - [x] task_tags.tag_id

- [x] Indexes on frequently queried columns
  - [x] tasks.status
  - [x] tasks.priority
  - [x] tasks.due_date (partial index)
  - [x] profiles.email
  - [x] profiles.created_at

- [x] Composite indexes for common multi-column queries
  - [x] tasks(user_id, status)
  - [x] tasks(user_id, due_date)
  - [x] tasks(user_id, created_at)
  - [x] categories(user_id, name)
  - [x] tags(user_id, name)

- [x] Partial indexes for nullable columns
  - [x] tasks.due_date WHERE due_date IS NOT NULL
  - [x] tasks.category_id WHERE category_id IS NOT NULL

### Triggers & Automation

- [x] Trigger function created: update_updated_at_column()
- [x] Trigger function created: handle_new_user()
- [x] Trigger created: update_profiles_updated_at
- [x] Trigger created: update_tasks_updated_at
- [x] Trigger created: on_auth_user_created (auth.users)

### Documentation

- [x] Comments added to tables
- [x] Comments added to key columns
- [x] Comments added to important constraints
- [x] Comments added to functions
- [x] Migration includes comprehensive comments
- [x] Separate documentation files created
  - [x] supabase/README.md
  - [x] docs/DATABASE-DESIGN.md
  - [x] docs/SCHEMA-DIAGRAM.md
  - [x] docs/QUICK-REFERENCE.md

## Post-Deployment Verification

### Functional Testing

Run these queries after applying the migration:

#### 1. Verify Tables Exist

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'categories', 'tags', 'tasks', 'task_tags')
ORDER BY tablename;
```

Expected: 5 rows (all table names)

#### 2. Verify Enums Exist

```sql
SELECT typname
FROM pg_type
WHERE typname IN ('task_status', 'task_priority')
ORDER BY typname;
```

Expected: 2 rows

#### 3. Verify RLS Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'categories', 'tags', 'tasks', 'task_tags')
ORDER BY tablename;
```

Expected: All rows have rowsecurity = true

#### 4. Verify RLS Policies

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Expected: 19 policies total
- profiles: 4 policies
- categories: 4 policies
- tags: 4 policies
- tasks: 4 policies
- task_tags: 3 policies

#### 5. Verify Indexes

```sql
SELECT
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'categories', 'tags', 'tasks', 'task_tags')
ORDER BY tablename, indexname;
```

Expected: 20+ indexes (including primary keys)

#### 6. Verify Triggers

```sql
SELECT
    event_object_table AS table_name,
    trigger_name,
    event_manipulation AS event,
    action_timing AS timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

Expected: 3 triggers
- profiles: update_profiles_updated_at
- tasks: update_tasks_updated_at
- auth.users: on_auth_user_created

### Security Testing

#### Test 1: RLS Isolation

```sql
-- As User A: Create a task
INSERT INTO tasks (user_id, title, status, priority)
VALUES (auth.uid(), 'User A Task', 'todo', 'medium');

-- As User A: Query tasks
SELECT COUNT(*) FROM tasks;
-- Expected: 1 (only User A's task)

-- As User B: Query tasks
SELECT COUNT(*) FROM tasks;
-- Expected: 0 (User B cannot see User A's task)
```

#### Test 2: Profile Auto-Creation

```sql
-- Sign up a new user via Supabase Auth
-- Then query:
SELECT * FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'newuser@example.com');
-- Expected: 1 row (profile auto-created)
```

#### Test 3: Foreign Key Cascade

```sql
-- Create category
INSERT INTO categories (user_id, name, color)
VALUES (auth.uid(), 'Test Category', '#FF0000')
RETURNING id;

-- Create task with category
INSERT INTO tasks (user_id, title, category_id)
VALUES (auth.uid(), 'Test Task', '<category_id>');

-- Delete category
DELETE FROM categories WHERE id = '<category_id>';

-- Check task
SELECT category_id FROM tasks WHERE title = 'Test Task';
-- Expected: category_id = NULL (ON DELETE SET NULL worked)
```

### Performance Testing

#### Test 1: Index Usage

```sql
EXPLAIN ANALYZE
SELECT * FROM tasks
WHERE user_id = '<user_id>'
    AND status = 'in_progress';
```

Expected: Uses `idx_tasks_user_id_status` (check query plan)

#### Test 2: Query Performance

```sql
-- Insert 1000 tasks
INSERT INTO tasks (user_id, title, status, priority)
SELECT
    auth.uid(),
    'Task ' || generate_series,
    (ARRAY['todo', 'in_progress', 'completed'])[floor(random() * 3 + 1)],
    (ARRAY['low', 'medium', 'high'])[floor(random() * 3 + 1)]
FROM generate_series(1, 1000);

-- Query performance test
EXPLAIN ANALYZE
SELECT * FROM tasks WHERE user_id = auth.uid();
```

Expected: Execution time < 50ms

### Data Validation Testing

#### Test 1: Email Format

```sql
-- Should succeed
UPDATE profiles SET email = 'valid@example.com' WHERE id = auth.uid();

-- Should fail (invalid format)
UPDATE profiles SET email = 'invalid-email' WHERE id = auth.uid();
```

Expected: Second query fails with CHECK constraint violation

#### Test 2: Hex Color Format

```sql
-- Should succeed
INSERT INTO categories (user_id, name, color)
VALUES (auth.uid(), 'Valid', '#FF5733');

-- Should fail (invalid format)
INSERT INTO categories (user_id, name, color)
VALUES (auth.uid(), 'Invalid', 'red');
```

Expected: Second query fails with CHECK constraint violation

#### Test 3: Duplicate Prevention

```sql
-- First insert succeeds
INSERT INTO categories (user_id, name, color)
VALUES (auth.uid(), 'Work', '#FF0000');

-- Second insert fails (duplicate name)
INSERT INTO categories (user_id, name, color)
VALUES (auth.uid(), 'Work', '#00FF00');
```

Expected: Second query fails with UNIQUE constraint violation

## Rollback Testing

Test the rollback script:

```sql
-- Run rollback
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Verify cleanup
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- Expected: No application tables
```

## Common Issues & Solutions

### Issue 1: RLS Blocks All Queries

**Symptom:** Queries return empty results even though data exists

**Solution:** Ensure auth.uid() is available in the context. Use service role key for admin operations.

### Issue 2: Trigger Not Firing

**Symptom:** Profiles not auto-created on signup

**Solution:** Verify trigger exists on auth.users table and function has SECURITY DEFINER.

### Issue 3: Slow Queries

**Symptom:** Queries take >100ms with moderate data

**Solution:** Run EXPLAIN ANALYZE and verify indexes are being used. Check for sequential scans.

### Issue 4: Foreign Key Violations

**Symptom:** Cannot insert tasks with category_id

**Solution:** Verify category exists and belongs to the same user as the task.

## Sign-Off

- [ ] All pre-deployment checks passed
- [ ] Migration applied successfully
- [ ] All post-deployment verifications passed
- [ ] Security testing completed
- [ ] Performance testing completed
- [ ] Data validation testing completed
- [ ] Documentation reviewed
- [ ] Team notified of schema deployment

**Validated By:** ___________________________

**Date:** ___________________________

**Notes:**
___________________________
___________________________
___________________________
