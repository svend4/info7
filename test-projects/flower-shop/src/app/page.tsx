'use client';

import { trpc } from '@/lib/trpc/client';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Sparkles, Truck, Heart, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const { data: featuredProducts, isLoading } =
    trpc.products.getFeatured.useQuery();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-cream-100 to-sage-50 py-20 md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl animate-float" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-sage-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-gray-900 mb-6">
              Fresh Flowers
              <span className="block text-rose-600 mt-2">Delivered Daily</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Beautiful, hand-curated arrangements for every occasion.
              Delivered with care and elegance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalog">
                <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-lg px-8 py-6">
                  Shop Now
                </Button>
              </Link>
              <Link href="/catalog">
                <Button size="lg" variant="outline" className="border-rose-600 text-rose-700 hover:bg-rose-50 text-lg px-8 py-6">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Sparkles, title: 'Fresh Daily', desc: 'Hand-picked each morning' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Same-day available' },
              { icon: Heart, title: 'Gift Ready', desc: 'Beautiful packaging included' },
              { icon: ShieldCheck, title: 'Quality Guarantee', desc: '100% satisfaction' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="p-6 text-center border-rose-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <feature.icon className="w-12 h-12 text-rose-600 mx-auto mb-4" />
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Featured Flowers
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover our most popular arrangements, carefully curated for beauty and freshness
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid products={featuredProducts || []} />
          )}

          <div className="text-center mt-12">
            <Link href="/catalog">
              <Button variant="outline" size="lg" className="border-rose-600 text-rose-700 hover:bg-rose-50">
                View All Flowers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
