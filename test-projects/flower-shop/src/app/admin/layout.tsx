'use client';

import { useAdmin } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAdmin();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex gap-6">
          <Link href="/admin" className="hover:text-gray-300">
            Dashboard
          </Link>
          <Link href="/admin/products" className="hover:text-gray-300">
            Products
          </Link>
          <Link href="/admin/categories" className="hover:text-gray-300">
            Categories
          </Link>
          <Link href="/admin/orders" className="hover:text-gray-300">
            Orders
          </Link>
          <Link href="/" className="hover:text-gray-300 ml-auto">
            Back to Store
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
