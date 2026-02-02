/**
 * tRPC router for tag operations
 * Provides type-safe CRUD operations for task tags
 */

import { router, protectedProcedure } from '../server';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// Zod schemas for input validation
const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
});

const updateTagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
});

export const tagsRouter = router({
  /**
   * Get all tags for the current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('tags')
      .select('*')
      .eq('user_id', ctx.userId)
      .order('name', { ascending: true });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch tags',
        cause: error,
      });
    }

    return data;
  }),

  /**
   * Create a new tag
   */
  create: protectedProcedure
    .input(createTagSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('tags')
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
            message: 'A tag with this name already exists',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create tag',
          cause: error,
        });
      }

      return data;
    }),

  /**
   * Update an existing tag
   */
  update: protectedProcedure
    .input(updateTagSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const { data, error } = await (ctx.supabase
        .from('tags') as any)
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
            message: 'A tag with this name already exists',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update tag',
          cause: error,
        });
      }

      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag not found',
        });
      }

      return data;
    }),

  /**
   * Delete a tag
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('tags')
        .delete()
        .eq('id', input.id)
        .eq('user_id', ctx.userId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete tag',
          cause: error,
        });
      }

      return { success: true };
    }),
});
