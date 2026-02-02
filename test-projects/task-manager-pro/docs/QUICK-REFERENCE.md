# Database Quick Reference

**Task Manager Pro - Developer Cheat Sheet**

## Table Structure (Quick View)

```
profiles       → User profiles (1:1 with auth.users)
categories     → User task categories
tags           → User task tags
tasks          → Task items (references categories)
task_tags      → Junction table (tasks ↔ tags)
```

## Common Queries

### Get User's Tasks with Details

```sql
SELECT
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    c.name AS category,
    c.color AS category_color,
    ARRAY_AGG(tg.name) FILTER (WHERE tg.name IS NOT NULL) AS tags
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN task_tags tt ON t.id = tt.task_id
LEFT JOIN tags tg ON tt.tag_id = tg.id
WHERE t.user_id = auth.uid()
GROUP BY t.id, c.name, c.color
ORDER BY
    CASE t.priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
    END,
    t.due_date NULLS LAST;
```

### Create Task with Tags

```sql
-- 1. Insert task
INSERT INTO tasks (user_id, title, description, status, priority, due_date, category_id)
VALUES (
    auth.uid(),
    'Complete project proposal',
    'Finalize Q1 proposal',
    'todo',
    'high',
    NOW() + INTERVAL '3 days',
    (SELECT id FROM categories WHERE name = 'Work' AND user_id = auth.uid() LIMIT 1)
)
RETURNING id;

-- 2. Add tags (use returned task id)
INSERT INTO task_tags (task_id, tag_id)
SELECT
    '<task_id>',
    id
FROM tags
WHERE name IN ('important', 'urgent')
    AND user_id = auth.uid();
```

### Get Task Statistics

```sql
SELECT
    status,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE priority = 'high') AS high_priority,
    COUNT(*) FILTER (WHERE due_date < NOW()) AS overdue
FROM tasks
WHERE user_id = auth.uid()
GROUP BY status;
```

### Search Tasks

```sql
-- Full-text search on title and description
SELECT *
FROM tasks
WHERE user_id = auth.uid()
    AND (
        title ILIKE '%search term%'
        OR description ILIKE '%search term%'
    )
ORDER BY created_at DESC;
```

### Get Tasks by Tag

```sql
SELECT DISTINCT t.*
FROM tasks t
JOIN task_tags tt ON t.id = tt.task_id
JOIN tags tg ON tt.tag_id = tg.id
WHERE t.user_id = auth.uid()
    AND tg.name = 'important';
```

## TypeScript Types (for tRPC)

```typescript
// Enums
export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed'
}

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

// Table types
export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    color: string; // hex color, e.g., '#FF5733'
    created_at: Date;
}

export interface Tag {
    id: string;
    user_id: string;
    name: string;
    created_at: Date;
}

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: Date | null;
    category_id: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface TaskTag {
    task_id: string;
    tag_id: string;
}

// Extended types with relations
export interface TaskWithDetails extends Task {
    category: Category | null;
    tags: Tag[];
}
```

## Zod Schemas (for validation)

```typescript
import { z } from 'zod';

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'completed']);
export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(5000).nullable(),
    status: taskStatusSchema.default('todo'),
    priority: taskPrioritySchema.default('medium'),
    due_date: z.date().nullable(),
    category_id: z.string().uuid().nullable(),
    tag_ids: z.array(z.string().uuid()).optional()
});

export const updateTaskSchema = createTaskSchema.partial();

export const createCategorySchema = z.object({
    name: z.string().min(1).max(50),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
});

export const createTagSchema = z.object({
    name: z.string().min(1).max(30)
});
```

## RLS Policy Reference

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **profiles** | All authenticated | Own only | Own only | Own only |
| **categories** | Own only | Own only | Own only | Own only |
| **tags** | Own only | Own only | Own only | Own only |
| **tasks** | Own only | Own only | Own only | Own only |
| **task_tags** | Own tasks | Own tasks | N/A | Own tasks |

"Own only" = `WHERE user_id = auth.uid()`

## Indexes (for query optimization)

```
profiles:
    - profiles_pkey (id)
    - idx_profiles_email
    - idx_profiles_created_at

categories:
    - categories_pkey (id)
    - idx_categories_user_id
    - idx_categories_user_id_name

tags:
    - tags_pkey (id)
    - idx_tags_user_id
    - idx_tags_user_id_name

tasks:
    - tasks_pkey (id)
    - idx_tasks_user_id ← MOST IMPORTANT
    - idx_tasks_status
    - idx_tasks_priority
    - idx_tasks_due_date (partial)
    - idx_tasks_category_id (partial)
    - idx_tasks_user_id_status ← Composite
    - idx_tasks_user_id_due_date ← Composite
    - idx_tasks_user_id_created_at ← Composite

task_tags:
    - task_tags_pkey (task_id, tag_id)
    - idx_task_tags_tag_id
```

## Performance Tips

1. **Always filter by user_id first** (uses index):
   ```sql
   WHERE user_id = auth.uid() AND status = 'todo'
   -- NOT: WHERE status = 'todo' AND user_id = auth.uid()
   ```

2. **Use composite indexes** for multi-column queries:
   ```sql
   -- Good: uses idx_tasks_user_id_status
   WHERE user_id = auth.uid() AND status = 'in_progress'
   ```

3. **Avoid SELECT ***:
   ```sql
   -- Good:
   SELECT id, title, status FROM tasks WHERE ...

   -- Bad:
   SELECT * FROM tasks WHERE ...
   ```

4. **Use EXPLAIN ANALYZE** to verify index usage:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM tasks WHERE user_id = auth.uid();
   ```

## Common Pitfalls

1. **Forgetting RLS**:
   - RLS is ALWAYS enabled
   - Backend queries run as authenticated user (auth.uid())
   - Use service role key ONLY for admin operations

2. **N+1 Queries**:
   - Fetch tasks with tags in one query (use JOIN + ARRAY_AGG)
   - Don't loop over tasks to fetch tags individually

3. **Missing user_id**:
   - Always include user_id in INSERT (RLS will reject otherwise)
   - Backend should derive user_id from session, not from client input

4. **Invalid foreign keys**:
   - Check category_id exists before inserting task
   - Check tag_id exists before inserting task_tags

## Useful Supabase Client Queries

```typescript
// Get tasks with category and tags
const { data: tasks } = await supabase
    .from('tasks')
    .select(`
        *,
        category:categories(*),
        tags:task_tags(tag:tags(*))
    `)
    .eq('user_id', userId);

// Create task with tags
const { data: task } = await supabase
    .from('tasks')
    .insert({
        user_id: userId,
        title: 'New task',
        status: 'todo',
        priority: 'medium'
    })
    .select()
    .single();

// Add tags to task
await supabase
    .from('task_tags')
    .insert(
        tagIds.map(tagId => ({
            task_id: task.id,
            tag_id: tagId
        }))
    );

// Update task status
await supabase
    .from('tasks')
    .update({ status: 'completed' })
    .eq('id', taskId)
    .eq('user_id', userId); // RLS check

// Delete task (cascades to task_tags)
await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);
```

## Environment Variables

```env
# Required for Supabase client
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional for migrations (use Supabase CLI)
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_ACCESS_TOKEN=your-access-token
```

## Testing Data

```sql
-- Insert test categories
INSERT INTO categories (user_id, name, color) VALUES
    (auth.uid(), 'Work', '#3B82F6'),
    (auth.uid(), 'Personal', '#10B981'),
    (auth.uid(), 'Urgent', '#EF4444');

-- Insert test tags
INSERT INTO tags (user_id, name) VALUES
    (auth.uid(), 'important'),
    (auth.uid(), 'quick-win'),
    (auth.uid(), 'blocked');

-- Insert test tasks
INSERT INTO tasks (user_id, title, description, status, priority, due_date, category_id)
SELECT
    auth.uid(),
    title,
    description,
    status,
    priority,
    due_date,
    (SELECT id FROM categories WHERE name = category_name AND user_id = auth.uid())
FROM (VALUES
    ('Complete project proposal', 'Finalize Q1 proposal', 'in_progress', 'high', NOW() + INTERVAL '3 days', 'Work'),
    ('Buy groceries', 'Milk, eggs, bread', 'todo', 'low', NOW() + INTERVAL '1 day', 'Personal'),
    ('Fix critical bug', 'Production issue with auth', 'todo', 'high', NOW() + INTERVAL '2 hours', 'Urgent')
) AS t(title, description, status, priority, due_date, category_name);
```

## References

- Migration file: `supabase/migrations/20260201000000_init_task_manager_schema.sql`
- Full documentation: `docs/DATABASE-DESIGN.md`
- Schema diagram: `docs/SCHEMA-DIAGRAM.md`
- Supabase setup: `supabase/README.md`
