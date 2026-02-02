# Database Design Documentation

**Project:** Task Manager Pro
**Database:** PostgreSQL (Supabase)
**Design Date:** 2026-02-01
**Designer:** database-architect agent

## Overview

The Task Manager Pro database is designed as a normalized, secure, multi-tenant PostgreSQL schema optimized for task management with user-defined categorization and tagging.

## Design Principles

### 1. Normalization (3NF)

The schema follows Third Normal Form (3NF):

- **No repeating groups**: Many-to-many relationships handled via junction tables
- **Atomic values**: All columns contain single, indivisible values
- **No transitive dependencies**: All non-key attributes depend only on primary keys

### 2. Multi-Tenant Isolation

Every user-owned table includes `user_id` with:
- Foreign key constraint to `profiles(id)`
- Row-Level Security policies enforcing `user_id = auth.uid()`
- Indexes on `user_id` for query performance

### 3. Data Integrity

Enforced through:
- **Foreign keys** with CASCADE/SET NULL actions
- **Check constraints** for format validation (email, hex colors)
- **Unique constraints** preventing duplicates per user
- **NOT NULL constraints** on required fields

### 4. Performance Optimization

- **15 strategic indexes** covering common query patterns
- **Partial indexes** for nullable columns (reduces index size)
- **Composite indexes** for multi-column queries
- **Auto-vacuuming** (PostgreSQL default)

## Entity-Relationship Design

### Core Entities

```
┌─────────────────┐
│   auth.users    │ (Supabase managed)
│  (id, email)    │
└────────┬────────┘
         │ 1:1
         ↓
┌─────────────────┐
│    profiles     │
│  (id, email,    │
│   full_name)    │
└────────┬────────┘
         │
         ├─────────────────┬─────────────────┐
         │ 1:N             │ 1:N             │ 1:N
         ↓                 ↓                 ↓
┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│ categories  │   │     tags     │   │    tasks     │
│ (name,color)│   │    (name)    │   │ (title,desc) │
└─────────────┘   └──────┬───────┘   └──────┬───────┘
                         │                   │
                         │        N:M        │
                         └────────┬──────────┘
                                  ↓
                         ┌──────────────┐
                         │  task_tags   │
                         │ (task_id,    │
                         │  tag_id)     │
                         └──────────────┘
```

### Relationships

1. **auth.users → profiles** (1:1)
   - One auth user has exactly one profile
   - Auto-created on signup via trigger

2. **profiles → categories** (1:N)
   - One user has many categories
   - Categories belong to one user

3. **profiles → tags** (1:N)
   - One user has many tags
   - Tags belong to one user

4. **profiles → tasks** (1:N)
   - One user has many tasks
   - Tasks belong to one user

5. **categories → tasks** (1:N, optional)
   - One category can have many tasks
   - Tasks can have zero or one category
   - ON DELETE SET NULL (tasks remain if category deleted)

6. **tasks ↔ tags** (N:M)
   - One task can have many tags
   - One tag can be on many tasks
   - Implemented via `task_tags` junction table

## Table Details

### profiles

**Purpose**: Extends Supabase auth.users with application-specific data

**Key Design Decisions**:
- Primary key = auth.users.id (ensures 1:1 relationship)
- Email validation via regex check constraint
- Auto-created on signup (trigger on auth.users)
- Readable by all authenticated users (for collaboration UX)
- Editable only by owner

**Indexes**:
- `profiles_pkey` (id) - Primary key (auto-created)
- `idx_profiles_email` - Email lookups
- `idx_profiles_created_at` - Recent user sorting

### categories

**Purpose**: User-defined categories for task organization

**Key Design Decisions**:
- Hex color format enforced (`#RRGGBB`)
- Unique name per user (prevents confusion)
- ON DELETE CASCADE from profiles (delete user → delete categories)

**Indexes**:
- `categories_pkey` (id) - Primary key
- `idx_categories_user_id` - Filter by owner
- `idx_categories_user_id_name` - Search categories by name

### tags

**Purpose**: Flexible labeling system for tasks

**Key Design Decisions**:
- Similar design to categories (normalized separately)
- Unique name per user
- Many-to-many with tasks via junction table

**Indexes**:
- `tags_pkey` (id) - Primary key
- `idx_tags_user_id` - Filter by owner
- `idx_tags_user_id_name` - Search tags by name

### tasks

**Purpose**: Core task items with lifecycle tracking

**Key Design Decisions**:
- Status enum: `todo` (default) → `in_progress` → `completed`
- Priority enum: `low`, `medium` (default), `high`
- Optional due_date with future validation
- Optional category (allows uncategorized tasks)
- Auto-updated `updated_at` timestamp

**Indexes**:
- `tasks_pkey` (id) - Primary key
- `idx_tasks_user_id` - Filter by owner (most common query)
- `idx_tasks_status` - Filter by lifecycle stage
- `idx_tasks_priority` - Filter by urgency
- `idx_tasks_due_date` - Sort by deadline (partial: only indexed if NOT NULL)
- `idx_tasks_category_id` - Filter by category (partial)
- `idx_tasks_user_id_status` - Composite: "my in_progress tasks"
- `idx_tasks_user_id_due_date` - Composite: "my upcoming tasks"
- `idx_tasks_user_id_created_at` - Composite: "my recent tasks"

### task_tags

**Purpose**: Junction table for many-to-many task-tag relationship

**Key Design Decisions**:
- Composite primary key (task_id, tag_id)
- ON DELETE CASCADE from both sides (cleanup orphans)
- RLS checks task ownership (users can't tag others' tasks)

**Indexes**:
- `task_tags_pkey` (task_id, tag_id) - Composite primary key
- `idx_task_tags_tag_id` - Reverse lookup: "find all tasks with tag X"

## Security Architecture

### Row-Level Security (RLS)

Every table has RLS enabled with policies following these patterns:

**Pattern 1: Owner-Only CRUD** (categories, tags, tasks)
```sql
-- SELECT: USING (auth.uid() = user_id)
-- INSERT: WITH CHECK (auth.uid() = user_id)
-- UPDATE: USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)
-- DELETE: USING (auth.uid() = user_id)
```

**Pattern 2: Public Read, Owner Write** (profiles)
```sql
-- SELECT: USING (auth.role() = 'authenticated')
-- UPDATE: USING (auth.uid() = id) WITH CHECK (auth.uid() = id)
-- DELETE: USING (auth.uid() = id)
```

**Pattern 3: Ownership via Subquery** (task_tags)
```sql
-- SELECT/INSERT/DELETE: Check task ownership via EXISTS subquery
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = task_tags.task_id
        AND tasks.user_id = auth.uid()
    )
)
```

### Multi-Tenant Isolation

Data isolation enforced at three levels:

1. **Application Level**: Frontend filters by user session
2. **Database Level**: RLS policies enforce user_id = auth.uid()
3. **Network Level**: Supabase API validates JWT tokens

Attack surface minimization:
- No direct database access from frontend
- All queries filtered through RLS (bypassing requires SECURITY DEFINER)
- Foreign key cascades prevent orphaned data

## Performance Optimization

### Index Strategy

**Covering Common Queries**:

1. "Show my tasks" → `idx_tasks_user_id`
2. "Show my in-progress tasks" → `idx_tasks_user_id_status`
3. "Show tasks due this week" → `idx_tasks_user_id_due_date`
4. "Find all tasks tagged 'urgent'" → `idx_task_tags_tag_id`
5. "Search my categories by name" → `idx_categories_user_id_name`

**Partial Indexes**:
```sql
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
```
Benefit: Reduces index size by 30-40% (assuming 30% of tasks have due dates)

**Composite Indexes**:
```sql
CREATE INDEX idx_tasks_user_id_status ON tasks(user_id, status);
```
Benefit: Single index serves both WHERE user_id AND WHERE user_id + status

### Query Performance Expectations

With proper indexes:

| Query Type | Records | Expected Time |
|------------|---------|---------------|
| Get user tasks | <10K | <50ms |
| Filter by status | <10K | <30ms |
| Full-text search | <10K | <100ms |
| Tag filtering | <10K | <50ms |
| Insert/Update | 1 | <10ms |

Performance degrades gracefully up to 100K tasks per user.

## Data Validation

### Check Constraints

1. **Email Format** (profiles):
   ```sql
   CONSTRAINT profiles_email_valid
   CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
   ```

2. **Hex Color Format** (categories):
   ```sql
   CONSTRAINT categories_color_hex_format
   CHECK (color ~* '^#[0-9A-Fa-f]{6}$')
   ```

3. **Non-Empty Strings** (multiple tables):
   ```sql
   CONSTRAINT tasks_title_not_empty
   CHECK (LENGTH(TRIM(title)) > 0)
   ```

4. **Future Due Date** (tasks):
   ```sql
   CONSTRAINT tasks_due_date_future
   CHECK (due_date IS NULL OR due_date >= created_at)
   ```

### Unique Constraints

- `profiles.id` (PK, inherits from auth.users)
- `categories(user_id, name)` - No duplicate category names per user
- `tags(user_id, name)` - No duplicate tag names per user
- `task_tags(task_id, tag_id)` - No duplicate task-tag pairs

## Triggers & Automation

### Auto-Update Timestamps

```sql
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

Ensures `updated_at` stays current without manual SET clauses.

### Auto-Create Profile

```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

Automatically creates profile when user signs up, extracting metadata from `auth.users.raw_user_meta_data`.

## Migration Strategy

### Initial Setup

1. Create enums (must precede table creation)
2. Create utility functions
3. Create tables in dependency order:
   - profiles (depends on auth.users)
   - categories, tags (depend on profiles)
   - tasks (depends on profiles, categories)
   - task_tags (depends on tasks, tags)
4. Create triggers
5. Enable RLS and create policies
6. Create performance indexes

### Future Migrations

For schema evolution:

1. **Adding columns**: `ALTER TABLE ADD COLUMN`
2. **Changing constraints**: `ALTER TABLE DROP CONSTRAINT`, `ADD CONSTRAINT`
3. **Adding indexes**: `CREATE INDEX CONCURRENTLY` (no table locking)
4. **Modifying RLS**: `DROP POLICY`, `CREATE POLICY`

Always include rollback SQL in migration comments.

## Testing Recommendations

### Schema Validation Tests

1. **RLS Enforcement**:
   ```sql
   -- Test: User A cannot see User B's tasks
   -- Expected: Empty result set
   ```

2. **Data Integrity**:
   ```sql
   -- Test: Cannot insert task with invalid category_id
   -- Expected: Foreign key violation error
   ```

3. **Trigger Functionality**:
   ```sql
   -- Test: Update task, check updated_at changed
   -- Expected: updated_at > created_at
   ```

### Performance Testing

1. Insert 10K tasks per user
2. Run typical queries, measure execution time
3. Verify index usage: `EXPLAIN ANALYZE SELECT ...`
4. Check table size: `pg_total_relation_size('tasks')`

## Appendix: SQL Scripts

### Sample Data

```sql
-- Create test user (via Supabase Auth, not direct SQL)

-- Add sample categories
INSERT INTO categories (user_id, name, color) VALUES
    (auth.uid(), 'Work', '#3B82F6'),
    (auth.uid(), 'Personal', '#10B981'),
    (auth.uid(), 'Urgent', '#EF4444');

-- Add sample tags
INSERT INTO tags (user_id, name) VALUES
    (auth.uid(), 'important'),
    (auth.uid(), 'quick-win'),
    (auth.uid(), 'blocked');

-- Add sample tasks
INSERT INTO tasks (user_id, title, description, status, priority, due_date, category_id)
SELECT
    auth.uid(),
    'Complete project proposal',
    'Finalize Q1 project proposal and send to stakeholders',
    'in_progress',
    'high',
    NOW() + INTERVAL '3 days',
    (SELECT id FROM categories WHERE name = 'Work' LIMIT 1);
```

### Useful Queries

```sql
-- Get all tasks with their category and tags
SELECT
    t.id,
    t.title,
    t.status,
    t.priority,
    t.due_date,
    c.name AS category,
    ARRAY_AGG(tg.name) AS tags
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN task_tags tt ON t.id = tt.task_id
LEFT JOIN tags tg ON tt.tag_id = tg.id
WHERE t.user_id = auth.uid()
GROUP BY t.id, c.name
ORDER BY t.created_at DESC;

-- Get task statistics by status
SELECT
    status,
    COUNT(*) AS task_count,
    COUNT(*) FILTER (WHERE priority = 'high') AS high_priority_count
FROM tasks
WHERE user_id = auth.uid()
GROUP BY status;

-- Find overdue tasks
SELECT
    title,
    due_date,
    AGE(NOW(), due_date) AS overdue_by
FROM tasks
WHERE user_id = auth.uid()
    AND status != 'completed'
    AND due_date < NOW()
ORDER BY due_date;
```

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Index Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
