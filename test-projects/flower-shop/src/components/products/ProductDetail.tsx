'use client';

import { AddToCartButton } from './AddToCartButton';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  is_available: boolean;
  categories: Category;
}

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-lg"
            />
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="mb-4">
            <span className="text-gray-600">Category: </span>
            <span className="font-medium">{product.categories.name}</span>
          </div>

          <div className="text-3xl font-bold mb-4">
            ${product.price.toFixed(2)}
          </div>

          {product.description && (
            <p className="text-gray-700 mb-6">{product.description}</p>
          )}

          <div className="mb-6">
            <span className="text-gray-600">In Stock: </span>
            <span className="font-medium">{product.stock_quantity} units</span>
          </div>

          {product.is_available ? (
            <AddToCartButton productId={product.id} />
          ) : (
            <button disabled className="w-full p-3 bg-gray-300 rounded">
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
