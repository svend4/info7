'use client';

import { ProductCard } from './ProductCard';
import { Flower2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  is_available: boolean;
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Flower2 className="w-16 h-16 text-rose-300 mx-auto mb-4" />
        <h3 className="text-xl font-heading text-gray-700 mb-2">
          No Flowers Found
        </h3>
        <p className="text-gray-500">
          Check back soon for beautiful new arrangements
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div key={product.id} className="stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
