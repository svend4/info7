import { z } from 'zod';
import { router, publicProcedure } from '../server';

export const productsRouter = router({
  getAll: publicProcedure
    .input(
      z
        .object({
          categoryId: z.string().optional(),
          isAvailable: z.boolean().optional(),
          isFeatured: z.boolean().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('products')
        .select('*, categories(id, name, slug)')
        .order('created_at', { ascending: false });

      if (input?.categoryId) {
        query = query.eq('category_id', input.categoryId);
      }

      if (input?.isAvailable !== undefined) {
        query = query.eq('is_available', input.isAvailable);
      }

      if (input?.isFeatured !== undefined) {
        query = query.eq('is_featured', input.isFeatured);
      }

      if (input?.search) {
        query = query.ilike('name', `%${input.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('products')
        .select('*, categories(id, name, slug)')
        .eq('slug', input.slug)
        .single();

      if (error) throw error;

      return data;
    }),

  getFeatured: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('is_featured', true)
      .eq('is_available', true)
      .limit(6);

    if (error) throw error;

    return data;
  }),
});
