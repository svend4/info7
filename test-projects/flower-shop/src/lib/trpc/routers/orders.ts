import { z } from 'zod';
import { router, protectedProcedure } from '../server';
import { TRPCError } from '@trpc/server';

export const ordersRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        deliveryAddress: z.string().min(1),
        deliveryDate: z.string().optional(),
        deliveryTime: z.string().optional(),
        customerName: z.string().min(1),
        customerPhone: z.string().min(1),
        customerEmail: z.string().email().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get cart items
      const { data: cartItems, error: cartError } = await ctx.supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('user_id', ctx.userId);

      if (cartError) throw cartError;

      if (!cartItems || cartItems.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cart is empty',
        });
      }

      // Calculate total amount
      const totalAmount = cartItems.reduce((sum, item) => {
        return sum + Number(item.products.price) * item.quantity;
      }, 0);

      // Generate order number
      const { data: orderNumber, error: orderNumberError } =
        await ctx.supabase.rpc('generate_order_number');

      if (orderNumberError) throw orderNumberError;

      // Create order
      const { data: order, error: orderError } = await ctx.supabase
        .from('orders')
        .insert({
          user_id: ctx.userId,
          order_number: orderNumber,
          total_amount: totalAmount,
          delivery_address: input.deliveryAddress,
          delivery_date: input.deliveryDate || null,
          delivery_time: input.deliveryTime || null,
          customer_name: input.customerName,
          customer_phone: input.customerPhone,
          customer_email: input.customerEmail || null,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: Number(item.products.price),
      }));

      const { error: orderItemsError } = await ctx.supabase
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) throw orderItemsError;

      // Clear cart
      const { error: clearCartError } = await ctx.supabase
        .from('cart_items')
        .delete()
        .eq('user_id', ctx.userId);

      if (clearCartError) throw clearCartError;

      return order;
    }),

  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', ctx.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  }),

  getById: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('id', input.orderId)
        .single();

      if (error) throw error;

      // Check if user owns this order or is admin
      if (data.user_id !== ctx.userId && !ctx.isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return data;
    }),
});
