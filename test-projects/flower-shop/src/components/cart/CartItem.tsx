'use client';

import { useCart } from '@/hooks/useCart';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

interface CartItemData {
  id: string;
  product_id: string;
  quantity: number;
  products: Product;
}

interface CartItemProps {
  item: CartItemData;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 p-4 border-b">
      {item.products.image_url && (
        <img
          src={item.products.image_url}
          alt={item.products.name}
          className="w-20 h-20 object-cover rounded"
        />
      )}

      <div className="flex-1">
        <h3 className="font-bold">{item.products.name}</h3>
        <p className="text-gray-600">${item.products.price.toFixed(2)}</p>

        <div className="flex items-center gap-2 mt-2">
          <label>Quantity:</label>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) =>
              updateQuantity({
                itemId: item.id,
                quantity: parseInt(e.target.value) || 1,
              })
            }
            className="w-20 p-1 border rounded"
          />
        </div>
      </div>

      <div className="flex flex-col justify-between items-end">
        <button
          onClick={() => removeItem({ itemId: item.id })}
          className="text-red-600 hover:text-red-800"
        >
          Remove
        </button>

        <p className="font-bold">
          ${(Number(item.products.price) * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
