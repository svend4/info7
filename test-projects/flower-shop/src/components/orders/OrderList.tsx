'use client';

import { trpc } from '@/lib/trpc/client';
import { OrderCard } from './OrderCard';

export function OrderList() {
  const { data: orders, isLoading } = trpc.orders.getMyOrders.useQuery();

  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No orders yet</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
