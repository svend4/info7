'use client';

import { trpc } from '@/lib/trpc/client';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.dashboard.getStats.useQuery();

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 mb-2">Total Products</h3>
          <p className="text-3xl font-bold">{stats?.totalProducts || 0}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">
            ${(stats?.totalRevenue || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold">{stats?.pendingOrders || 0}</p>
        </div>
      </div>
    </div>
  );
}
