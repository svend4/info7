/**
 * Category selector component
 * Dropdown for selecting a category
 */

'use client';

import { trpc } from '@/lib/trpc/client';
import type { Category } from '@/lib/types/database';

interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
}

export function CategorySelector({ value, onChange, disabled }: CategorySelectorProps) {
  const { data: categories, isLoading } = trpc.categories.getAll.useQuery();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading categories...</div>;
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded"
    >
      <option value="">No Category</option>
      {(categories as Category[] | undefined)?.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
