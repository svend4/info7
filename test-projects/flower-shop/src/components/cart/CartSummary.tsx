'use client';

import { useCart } from '@/hooks/useCart';
import Link from 'next/link';

export function CartSummary() {
  const { totalItems, totalPrice, cartItems } = useCart();

  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="border rounded p-6">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Items ({totalItems})</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <Link href="/checkout">
        <button className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700">
          Proceed to Checkout
        </button>
      </Link>
    </div>
  );
}
