'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

export default function CatalogPage() {
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const { data: products, isLoading } = trpc.products.getAll.useQuery({
    categoryId,
    search: search || undefined,
    isAvailable: true,
  });

  return (
    <main className="min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-rose-50 to-sage-50 py-12 mb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Flower Catalog
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our collection of fresh, beautiful flowers
            </p>
          </motion.div>
        </div>
      </section>

      {/* Catalog Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <ProductFilters
              categoryId={categoryId}
              onCategoryChange={setCategoryId}
              search={search}
              onSearchChange={setSearch}
            />
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-gray-600">
                {!isLoading &&
                  `${products?.length || 0} ${
                    (products?.length || 0) === 1 ? 'flower' : 'flowers'
                  } found`}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid products={products || []} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
