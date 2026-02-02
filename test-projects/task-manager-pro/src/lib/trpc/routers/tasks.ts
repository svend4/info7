/**
 * tRPC router for task operations
 * Provides type-safe CRUD operations with Zod validation
 */

import { router, protectedProcedure } from '../server';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// Zod schemas for input validation
const taskStatusSchema = z.enum(['todo', 'in_progress', 'completed']);
const taskPrioritySchema = z.enum(['low', 'medium', 'high']);

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional(),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  due_date: z.string().datetime().optional(),
  category_id: z.string().uuid().optional(),
});

const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  due_date: z.string().datetime().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
});

const taskFiltersSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  category_id: z.string().uuid().optional(),
  search: z.string().optional(),
});

export const tasksRouter = router({
  /**
   * Get all tasks for the current user with optional filters
   */
  getAll: protectedProcedure
    .input(taskFiltersSchema)
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('tasks')
        .select(`
          *,
          category:categories(*),
          task_tags(
            tag:tags(*)
          )
        `)
        .eq('user_id', ctx.userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (input.status) {
        query = query.eq('status', input.status);
      }
      if (input.priority) {
        query = query.eq('priority', input.priority);
      }
      if (input.category_id) {
        query = query.eq('category_id', input.category_id);
      }
      if (input.search) {
        query = query.or(
          `title.ilike.%${input.search}%,description.ilike.%${input.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tasks',
          cause: error,
        });
      }

      // Transform data to include tags array
      const tasksWithTags = (data as any[]).map((task: any) => ({
        ...task,
        tags: task.task_tags?.map((tt: any) => tt.tag).filter(Boolean) ?? [],
      }));

      return tasksWithTags;
    }),

  /**
   * Get a single task by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('tasks')
        .select(`
          *,
          category:categories(*),
          task_tags(
            tag:tags(*)
          )
        `)
        .eq('id', input.id)
        .eq('user_id', ctx.userId)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
          cause: error,
        });
      }

      // Transform data to include tags array
      const taskWithTags = {
        ...(data as any),
        tags: (data as any).task_tags?.map((tt: any) => tt.tag).filter(Boolean) ?? [],
      };

      return taskWithTags;
    }),

  /**
   * Create a new task
   */
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('tasks')
        .insert({
          ...input,
          user_id: ctx.userId,
        } as any)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create task',
          cause: error,
        });
      }

      return data;
    }),

  /**
   * Update an existing task
   */
  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // First verify the task belongs to the user (RLS will prevent this, but explicit check is clearer)
      const { data: existingTask } = await ctx.supabase
        .from('tasks')
        .select('id')
        .eq('id', id)
        .eq('user_id', ctx.userId)
        .single();

      if (!existingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found or you do not have permission to update it',
        });
      }

      const { data, error } = await (ctx.supabase
        .from('tasks') as any)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', ctx.userId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update task',
          cause: error,
        });
      }

      return data;
    }),

  /**
   * Delete a task
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('tasks')
        .delete()
        .eq('id', input.id)
        .eq('user_id', ctx.userId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete task',
          cause: error,
        });
      }

      return { success: true };
    }),

  /**
   * Add a tag to a task
   */
  addTag: protectedProcedure
    .input(
      z.object({
        task_id: z.string().uuid(),
        tag_id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify task belongs to user
      const { data: task } = await ctx.supabase
        .from('tasks')
        .select('id')
        .eq('id', input.task_id)
        .eq('user_id', ctx.userId)
        .single();

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      const { error } = await ctx.supabase
        .from('task_tags')
        .insert({
          task_id: input.task_id,
          tag_id: input.tag_id,
        } as any);

      if (error) {
        // Check for duplicate key error
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Tag already added to this task',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add tag to task',
          cause: error,
        });
      }

      return { success: true };
    }),

  /**
   * Remove a tag from a task
   */
  removeTag: protectedProcedure
    .input(
      z.object({
        task_id: z.string().uuid(),
        tag_id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('task_tags')
        .delete()
        .eq('task_id', input.task_id)
        .eq('tag_id', input.tag_id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove tag from task',
          cause: error,
        });
      }

      return { success: true };
    }),
});
