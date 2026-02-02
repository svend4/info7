/**
 * tRPC router for category operations
 * Provides type-safe CRUD operations for task categories
 */

import { router, protectedProcedure } from '../server';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// Zod schemas for input validation
const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code'),
});

const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const categoriesRouter = router({
  /**
   * Get all categories for the current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('categories')
      .select('*')
      .eq('user_id', ctx.userId)
      .order('name', { ascending: true });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch categories',
        cause: error,
      });
    }

    return data;
  }),

  /**
   * Create a new category
   */
  create: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('categories')
        .insert({
          ...input,
          user_id: ctx.userId,
        } as any)
        .select()
        .single();

      if (error) {
        // Check for unique constraint violation
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A category with this name already exists',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create category',
          cause: error,
        });
      }

      return data;
    }),

  /**
   * Update an existing category
   */
  update: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const { data, error } = await (ctx.supabase
        .from('categories') as any)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', ctx.userId)
        .select()
        .single();

      if (error) {
        // Check for unique constraint violation
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A category with this name already exists',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update category',
          cause: error,
        });
      }

      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      return data;
    }),

  /**
   * Delete a category
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('categories')
        .delete()
        .eq('id', input.id)
        .eq('user_id', ctx.userId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete category',
          cause: error,
        });
      }

      return { success: true };
    }),
});
