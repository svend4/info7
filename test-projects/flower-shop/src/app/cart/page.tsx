'use client';

import { useCart } from '@/hooks/useCart';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function CartPage() {
  const { cartItems, isLoading } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading cart...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {!cartItems || cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <a
            href="/catalog"
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div className="md:col-span-1">
            <CartSummary />
          </div>
        </div>
      )}
    </main>
  );
}
