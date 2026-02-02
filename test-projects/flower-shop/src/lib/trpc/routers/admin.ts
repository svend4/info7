import { z } from 'zod';
import { router, adminProcedure } from '../server';

export const adminRouter = router({
  products: router({
    create: adminProcedure
      .input(
        z.object({
          categoryId: z.string(),
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          price: z.number().min(0.01),
          imageUrl: z.string().optional(),
          stockQuantity: z.number().min(0).default(0),
          isAvailable: z.boolean().default(true),
          isFeatured: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await ctx.supabase
          .from('products')
          .insert({
            category_id: input.categoryId,
            name: input.name,
            slug: input.slug,
            description: input.description || null,
            price: input.price,
            image_url: input.imageUrl || null,
            stock_quantity: input.stockQuantity,
            is_available: input.isAvailable,
            is_featured: input.isFeatured,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.string(),
          categoryId: z.string().optional(),
          name: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
          description: z.string().optional(),
          price: z.number().min(0.01).optional(),
          imageUrl: z.string().optional(),
          stockQuantity: z.number().min(0).optional(),
          isAvailable: z.boolean().optional(),
          isFeatured: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;

        const updateData: Record<string, unknown> = {};
        if (updates.categoryId !== undefined)
          updateData.category_id = updates.categoryId;
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.slug !== undefined) updateData.slug = updates.slug;
        if (updates.description !== undefined)
          updateData.description = updates.description;
        if (updates.price !== undefined) updateData.price = updates.price;
        if (updates.imageUrl !== undefined)
          updateData.image_url = updates.imageUrl;
        if (updates.stockQuantity !== undefined)
          updateData.stock_quantity = updates.stockQuantity;
        if (updates.isAvailable !== undefined)
          updateData.is_available = updates.isAvailable;
        if (updates.isFeatured !== undefined)
          updateData.is_featured = updates.isFeatured;

        const { data, error } = await ctx.supabase
          .from('products')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { error } = await ctx.supabase
          .from('products')
          .delete()
          .eq('id', input.id);

        if (error) throw error;
        return { success: true };
      }),
  }),

  categories: router({
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await ctx.supabase
          .from('categories')
          .insert({
            name: input.name,
            slug: input.slug,
            description: input.description || null,
            image_url: input.imageUrl || null,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;

        const updateData: Record<string, unknown> = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.slug !== undefined) updateData.slug = updates.slug;
        if (updates.description !== undefined)
          updateData.description = updates.description;
        if (updates.imageUrl !== undefined)
          updateData.image_url = updates.imageUrl;

        const { data, error } = await ctx.supabase
          .from('categories')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { error } = await ctx.supabase
          .from('categories')
          .delete()
          .eq('id', input.id);

        if (error) throw error;
        return { success: true };
      }),
  }),

  orders: router({
    getAll: adminProcedure.query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('orders')
        .select('*, order_items(*, products(*)), profiles(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }),

    updateStatus: adminProcedure
      .input(
        z.object({
          orderId: z.string(),
          status: z.enum([
            'pending',
            'confirmed',
            'preparing',
            'delivering',
            'completed',
            'cancelled',
          ]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await ctx.supabase
          .from('orders')
          .update({ status: input.status })
          .eq('id', input.orderId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }),
  }),

  dashboard: router({
    getStats: adminProcedure.query(async ({ ctx }) => {
      // Get total products
      const { count: totalProducts } = await ctx.supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get total orders
      const { count: totalOrders } = await ctx.supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: orders } = await ctx.supabase
        .from('orders')
        .select('total_amount')
        .in('status', ['completed', 'confirmed', 'preparing', 'delivering']);

      const totalRevenue = orders?.reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
      );

      // Get pending orders count
      const { count: pendingOrders } = await ctx.supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue: totalRevenue || 0,
        pendingOrders: pendingOrders || 0,
      };
    }),
  }),
});
