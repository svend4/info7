'use client';

import { use } from 'react';
import { trpc } from '@/lib/trpc/client';
import { ProductDetail } from '@/components/products/ProductDetail';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);

  const { data: product, isLoading } = trpc.products.getBySlug.useQuery({
    slug,
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">Product not found</div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <ProductDetail product={product} />
    </main>
  );
}
