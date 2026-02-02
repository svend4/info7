'use client';

import { useAuth } from '@/hooks/useAuth';
import { OrderList } from '@/components/orders/OrderList';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>

      <OrderList />
    </main>
  );
}
