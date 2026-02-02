'use client';

import { trpc } from '@/lib/trpc/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductFiltersProps {
  categoryId?: string;
  onCategoryChange: (categoryId?: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function ProductFilters({
  categoryId,
  onCategoryChange,
  search,
  onSearchChange,
}: ProductFiltersProps) {
  const { data: categories, isLoading } = trpc.categories.getAll.useQuery();

  const hasFilters = categoryId || search;

  const clearFilters = () => {
    onCategoryChange(undefined);
    onSearchChange('');
  };

  return (
    <Card className="p-6 border-rose-100 bg-white/80 backdrop-blur-sm sticky top-24">
      <div className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search Flowers
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-rose-200 focus-visible:ring-rose-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Categories</Label>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => onCategoryChange(undefined)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  !categoryId
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                All Flowers
              </button>

              {categories?.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    categoryId === category.id
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full border-rose-600 text-rose-700 hover:bg-rose-50"
          >
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </Card>
  );
}
