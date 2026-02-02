'use client';

interface Product {
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  products: Product;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  delivery_date: string | null;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    delivering: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="border rounded p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">Order {order.order_number}</h3>
          <p className="text-gray-600 text-sm">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded text-sm ${
            statusColors[order.status] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {order.status.toUpperCase()}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Items:</h4>
        {order.order_items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm mb-1">
            <span>
              {item.products.name} x {item.quantity}
            </span>
            <span>${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold">Total</span>
          <span className="font-bold text-lg">
            ${order.total_amount.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mt-2">
          Delivery: {order.delivery_address}
        </p>

        {order.delivery_date && (
          <p className="text-gray-600 text-sm">
            Scheduled: {new Date(order.delivery_date).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
