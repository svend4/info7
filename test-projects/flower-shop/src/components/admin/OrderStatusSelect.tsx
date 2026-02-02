'use client';

import { trpc } from '@/lib/trpc/client';

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const utils = trpc.useUtils();

  const updateStatus = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.admin.orders.getAll.invalidate();
    },
  });

  const statuses = [
    'pending',
    'confirmed',
    'preparing',
    'delivering',
    'completed',
    'cancelled',
  ];

  return (
    <select
      value={currentStatus}
      onChange={(e) =>
        updateStatus.mutate({
          orderId,
          status: e.target.value as any,
        })
      }
      className="p-2 border rounded"
    >
      {statuses.map((status) => (
        <option key={status} value={status}>
          {status.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
