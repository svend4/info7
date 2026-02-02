'use client';

import { trpc } from '@/lib/trpc/client';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';

export const dynamic = 'force-dynamic';

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = trpc.admin.orders.getAll.useQuery();

  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders Management</h1>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Order #</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order: any) => (
              <tr key={order.id} className="border-t">
                <td className="p-4">{order.order_number}</td>
                <td className="p-4">
                  <div>{order.customer_name}</div>
                  <div className="text-sm text-gray-600">
                    {order.customer_email || order.customer_phone}
                  </div>
                </td>
                <td className="p-4">${order.total_amount.toFixed(2)}</td>
                <td className="p-4">
                  <OrderStatusSelect
                    orderId={order.id}
                    currentStatus={order.status}
                  />
                </td>
                <td className="p-4">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
