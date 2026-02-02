'use client';

import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!cartItems || cartItems.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <CheckoutForm />
    </main>
  );
}
