import { router, publicProcedure } from '../server';

export const categoriesRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    return data;
  }),
});
