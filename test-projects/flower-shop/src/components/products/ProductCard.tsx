'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group">
      <Card className="overflow-hidden border-rose-100 product-card-hover bg-white/80 backdrop-blur-sm">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-cream-100 to-rose-50">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Flower2 className="w-16 h-16 text-rose-300" />
            </div>
          )}

          {!product.is_available && (
            <Badge className="absolute top-3 right-3 bg-rose-600">
              Out of Stock
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-heading font-semibold text-lg mb-2 text-gray-900 group-hover:text-rose-700 transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {product.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0">
          <div className="flex justify-between items-center w-full">
            <span className="text-2xl font-heading font-bold text-rose-700">
              ${product.price.toFixed(2)}
            </span>
            {product.is_available && product.stock_quantity < 10 && (
              <span className="text-xs text-orange-600 font-medium">
                Only {product.stock_quantity} left
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
