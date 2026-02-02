'use client';

import { trpc } from '@/lib/trpc/client';

export function useCart() {
  const utils = trpc.useUtils();

  const { data: cartItems, isLoading } = trpc.cart.getItems.useQuery();

  const addItem = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      utils.cart.getItems.invalidate();
    },
  });

  const updateQuantity = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      utils.cart.getItems.invalidate();
    },
  });

  const removeItem = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      utils.cart.getItems.invalidate();
    },
  });

  const clearCart = trpc.cart.clear.useMutation({
    onSuccess: () => {
      utils.cart.getItems.invalidate();
    },
  });

  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const totalPrice =
    cartItems?.reduce((sum, item) => {
      return sum + Number(item.products.price) * item.quantity;
    }, 0) || 0;

  return {
    cartItems,
    isLoading,
    addItem: addItem.mutate,
    updateQuantity: updateQuantity.mutate,
    removeItem: removeItem.mutate,
    clearCart: clearCart.mutate,
    totalItems,
    totalPrice,
  };
}
