import { z } from 'zod';
import { router, protectedProcedure } from '../server';

export const cartRouter = router({
  getItems: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('cart_items')
      .select('*, products(*, categories(id, name, slug))')
      .eq('user_id', ctx.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  }),

  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if item already exists in cart
      const { data: existingItem } = await ctx.supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', ctx.userId)
        .eq('product_id', input.productId)
        .single();

      if (existingItem) {
        // Update quantity
        const { data, error } = await ctx.supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + input.quantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new item
        const { data, error } = await ctx.supabase
          .from('cart_items')
          .insert({
            user_id: ctx.userId,
            product_id: input.productId,
            quantity: input.quantity,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    }),

  updateQuantity: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('cart_items')
        .update({ quantity: input.quantity })
        .eq('id', input.itemId)
        .eq('user_id', ctx.userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  removeItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('cart_items')
        .delete()
        .eq('id', input.itemId)
        .eq('user_id', ctx.userId);

      if (error) throw error;
      return { success: true };
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase
      .from('cart_items')
      .delete()
      .eq('user_id', ctx.userId);

    if (error) throw error;
    return { success: true };
  }),
});
