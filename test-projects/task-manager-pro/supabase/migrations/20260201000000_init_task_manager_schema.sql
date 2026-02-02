-- Migration: 20260201000000_init_task_manager_schema.sql
-- Purpose: Initialize Task Manager Pro database schema with normalized structure,
--          RLS policies, performance indexes, and data integrity constraints
-- Author: database-architect agent
-- Date: 2026-02-01

-- ==============================================================================
-- SECTION 1: ENUMS
-- ==============================================================================
-- Define custom types for task status and priority to ensure data consistency

-- Task status enum: represents the lifecycle of a task
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');

-- Task priority enum: represents urgency levels
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- ==============================================================================
-- SECTION 2: UTILITY FUNCTIONS
-- ==============================================================================

-- Trigger function to automatically update the 'updated_at' timestamp
-- This ensures all tables with updated_at columns stay current without manual intervention
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- SECTION 3: CORE TABLES
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: profiles
-- Purpose: Extends Supabase auth.users with application-specific user data
-- Relationship: One-to-one with auth.users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    -- Primary key matches auth.users.id for 1:1 relationship
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- User contact and display information
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,

    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT profiles_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Add comment for documentation
COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users with application data';
COMMENT ON COLUMN profiles.id IS 'Foreign key to auth.users - ensures 1:1 relationship';
COMMENT ON COLUMN profiles.email IS 'User email address - validated format, required for notifications';

-- -----------------------------------------------------------------------------
-- TABLE: categories
-- Purpose: User-defined categories for organizing tasks
-- Relationship: Many-to-one with profiles (each user has multiple categories)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key to profiles (owner of this category)
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Category attributes
    name TEXT NOT NULL,
    color TEXT NOT NULL,

    -- Audit timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT categories_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT categories_color_hex_format CHECK (color ~* '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT categories_unique_name_per_user UNIQUE(user_id, name)
);

-- Add comments
COMMENT ON TABLE categories IS 'User-defined categories for task organization';
COMMENT ON COLUMN categories.color IS 'Hex color code (e.g., #FF5733) for UI display';
COMMENT ON CONSTRAINT categories_unique_name_per_user ON categories IS 'Prevent duplicate category names per user';

-- -----------------------------------------------------------------------------
-- TABLE: tags
-- Purpose: User-defined tags for flexible task labeling
-- Relationship: Many-to-one with profiles, many-to-many with tasks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tags (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key to profiles (owner of this tag)
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Tag attributes
    name TEXT NOT NULL,

    -- Audit timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT tags_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT tags_unique_name_per_user UNIQUE(user_id, name)
);

-- Add comments
COMMENT ON TABLE tags IS 'User-defined tags for flexible task categorization';
COMMENT ON CONSTRAINT tags_unique_name_per_user ON tags IS 'Prevent duplicate tag names per user';

-- -----------------------------------------------------------------------------
-- TABLE: tasks
-- Purpose: Core task items with status, priority, and metadata
-- Relationships:
--   - Many-to-one with profiles (user_id)
--   - Many-to-one with categories (category_id, optional)
--   - Many-to-many with tags (via task_tags)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key to profiles (owner of this task)
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Task content
    title TEXT NOT NULL,
    description TEXT,

    -- Task metadata
    status task_status NOT NULL DEFAULT 'todo',
    priority task_priority NOT NULL DEFAULT 'medium',
    due_date TIMESTAMPTZ,

    -- Optional category reference
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT tasks_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT tasks_due_date_future CHECK (due_date IS NULL OR due_date >= created_at)
);

-- Add comments
COMMENT ON TABLE tasks IS 'Core task items with status tracking and categorization';
COMMENT ON COLUMN tasks.status IS 'Task lifecycle stage: todo → in_progress → completed';
COMMENT ON COLUMN tasks.priority IS 'Task urgency level: low, medium, high';
COMMENT ON CONSTRAINT tasks_due_date_future ON tasks IS 'Ensure due date is not before task creation';

-- -----------------------------------------------------------------------------
-- TABLE: task_tags
-- Purpose: Junction table for many-to-many relationship between tasks and tags
-- Relationship: Links tasks to tags (one task can have multiple tags)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_tags (
    -- Composite primary key (task_id, tag_id)
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

    -- Composite primary key ensures no duplicate task-tag pairs
    PRIMARY KEY (task_id, tag_id)
);

-- Add comments
COMMENT ON TABLE task_tags IS 'Junction table for many-to-many task-tag relationships';
COMMENT ON COLUMN task_tags.task_id IS 'Foreign key to tasks - CASCADE delete removes orphaned relationships';
COMMENT ON COLUMN task_tags.tag_id IS 'Foreign key to tags - CASCADE delete removes orphaned relationships';

-- ==============================================================================
-- SECTION 4: TRIGGERS
-- ==============================================================================

-- Auto-update updated_at timestamp on profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at timestamp on tasks
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- TRIGGER: Auto-create profile on user signup
-- Purpose: Automatically create a profile entry when a new user signs up
--          This ensures every auth.users record has a corresponding profile
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table (requires auth schema access)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Auto-create profile record when new user signs up via Supabase Auth';

-- ==============================================================================
-- SECTION 5: ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables (CRITICAL for multi-tenant security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- RLS POLICIES: profiles
-- Design: Users can view any profile (for collaboration/display purposes)
--         but can only update/delete their own profile
-- -----------------------------------------------------------------------------

-- Policy: Anyone authenticated can view any profile
CREATE POLICY "Profiles are viewable by authenticated users"
    ON profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy: Users can insert their own profile (redundant with trigger, but explicit)
CREATE POLICY "Users can create their own profile"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can only delete their own profile
CREATE POLICY "Users can delete their own profile"
    ON profiles
    FOR DELETE
    USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- RLS POLICIES: categories
-- Design: Users have full CRUD access only to their own categories
-- -----------------------------------------------------------------------------

-- Policy: Users can view only their own categories
CREATE POLICY "Users can view their own categories"
    ON categories
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create categories for themselves
CREATE POLICY "Users can create their own categories"
    ON categories
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own categories
CREATE POLICY "Users can update their own categories"
    ON categories
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own categories
CREATE POLICY "Users can delete their own categories"
    ON categories
    FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RLS POLICIES: tags
-- Design: Users have full CRUD access only to their own tags
-- -----------------------------------------------------------------------------

-- Policy: Users can view only their own tags
CREATE POLICY "Users can view their own tags"
    ON tags
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create tags for themselves
CREATE POLICY "Users can create their own tags"
    ON tags
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own tags
CREATE POLICY "Users can update their own tags"
    ON tags
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own tags
CREATE POLICY "Users can delete their own tags"
    ON tags
    FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RLS POLICIES: tasks
-- Design: Users have full CRUD access only to their own tasks
-- -----------------------------------------------------------------------------

-- Policy: Users can view only their own tasks
CREATE POLICY "Users can view their own tasks"
    ON tasks
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create tasks for themselves
CREATE POLICY "Users can create their own tasks"
    ON tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own tasks
CREATE POLICY "Users can update their own tasks"
    ON tasks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own tasks
CREATE POLICY "Users can delete their own tasks"
    ON tasks
    FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RLS POLICIES: task_tags
-- Design: Users can only manage task-tag relationships for their own tasks
--         This requires a subquery to check task ownership
-- -----------------------------------------------------------------------------

-- Policy: Users can view task-tag relationships for their own tasks
CREATE POLICY "Users can view their own task-tag relationships"
    ON task_tags
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_tags.task_id
            AND tasks.user_id = auth.uid()
        )
    );

-- Policy: Users can create task-tag relationships for their own tasks
CREATE POLICY "Users can create task-tag relationships for their own tasks"
    ON task_tags
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_tags.task_id
            AND tasks.user_id = auth.uid()
        )
    );

-- Policy: Users can delete task-tag relationships for their own tasks
CREATE POLICY "Users can delete task-tag relationships for their own tasks"
    ON task_tags
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_tags.task_id
            AND tasks.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- SECTION 6: PERFORMANCE INDEXES
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- INDEXES: profiles
-- -----------------------------------------------------------------------------

-- Index on email for lookups (unique constraint already creates index on id)
CREATE INDEX idx_profiles_email ON profiles(email);

-- Index on created_at for sorting/filtering recent users
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- -----------------------------------------------------------------------------
-- INDEXES: categories
-- -----------------------------------------------------------------------------

-- Index on user_id for filtering by owner (most common query pattern)
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Composite index on user_id + name for searching categories by user
CREATE INDEX idx_categories_user_id_name ON categories(user_id, name);

-- -----------------------------------------------------------------------------
-- INDEXES: tags
-- -----------------------------------------------------------------------------

-- Index on user_id for filtering by owner
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- Composite index on user_id + name for searching tags by user
CREATE INDEX idx_tags_user_id_name ON tags(user_id, name);

-- -----------------------------------------------------------------------------
-- INDEXES: tasks
-- -----------------------------------------------------------------------------

-- Index on user_id (most common filter - show user's tasks)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Index on status for filtering tasks by lifecycle stage
CREATE INDEX idx_tasks_status ON tasks(status);

-- Index on priority for filtering high-priority tasks
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Index on due_date for sorting/filtering upcoming tasks
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;

-- Index on category_id for filtering tasks by category
CREATE INDEX idx_tasks_category_id ON tasks(category_id) WHERE category_id IS NOT NULL;

-- Composite index on user_id + status (common query: "show me my in_progress tasks")
CREATE INDEX idx_tasks_user_id_status ON tasks(user_id, status);

-- Composite index on user_id + due_date (common query: "show me my upcoming tasks")
CREATE INDEX idx_tasks_user_id_due_date ON tasks(user_id, due_date) WHERE due_date IS NOT NULL;

-- Composite index on user_id + created_at for sorting user's tasks by creation date
CREATE INDEX idx_tasks_user_id_created_at ON tasks(user_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- INDEXES: task_tags
-- -----------------------------------------------------------------------------

-- Index on tag_id for reverse lookups (find all tasks with a specific tag)
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);

-- Note: Index on task_id is already created by the PRIMARY KEY (task_id, tag_id)

-- ==============================================================================
-- SECTION 7: VALIDATION & CONSTRAINTS SUMMARY
-- ==============================================================================

-- This migration includes the following data integrity measures:
--
-- 1. REFERENTIAL INTEGRITY:
--    - All foreign keys have ON DELETE CASCADE or SET NULL
--    - Prevents orphaned records
--
-- 2. DATA VALIDATION:
--    - Email format validation (profiles.email)
--    - Hex color format validation (categories.color)
--    - Non-empty string checks (title, name fields)
--    - Due date future check (tasks.due_date >= created_at)
--
-- 3. UNIQUENESS CONSTRAINTS:
--    - Unique category names per user
--    - Unique tag names per user
--    - Unique task-tag pairs (composite PK)
--
-- 4. SECURITY:
--    - RLS enabled on all tables
--    - Policies enforce user_id = auth.uid() for data isolation
--    - Profiles readable by all (for collaboration), editable by owner only
--
-- 5. PERFORMANCE:
--    - 15 indexes covering common query patterns
--    - Partial indexes for nullable columns (due_date, category_id)
--    - Composite indexes for multi-column queries
--
-- 6. AUDIT TRAIL:
--    - created_at on all tables
--    - updated_at on profiles and tasks (auto-updated via trigger)
--    - Triggers for automatic timestamp management

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================
