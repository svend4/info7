/**
 * Task filters component
 * Provides filtering controls for task list
 */

'use client';

import { trpc } from '@/lib/trpc/client';
import type { Category } from '@/lib/types/database';

interface TaskFiltersProps {
  onFilterChange: (filters: {
    status?: 'todo' | 'in_progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    category_id?: string;
    search?: string;
  }) => void;
  filters: {
    status?: 'todo' | 'in_progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    category_id?: string;
    search?: string;
  };
}

export function TaskFilters({ onFilterChange, filters }: TaskFiltersProps) {
  const { data: categories } = trpc.categories.getAll.useQuery();

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded">
      <h3 className="font-medium">Filters</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value as any || undefined })}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">All</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <select
          value={filters.priority || ''}
          onChange={(e) => onFilterChange({ ...filters, priority: e.target.value as any || undefined })}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={filters.category_id || ''}
          onChange={(e) => onFilterChange({ ...filters, category_id: e.target.value || undefined })}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">All</option>
          {(categories as Category[] | undefined)?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Search</label>
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value || undefined })}
          placeholder="Search tasks..."
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <button
        onClick={() => onFilterChange({})}
        className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-300 rounded"
      >
        Clear Filters
      </button>
    </div>
  );
}
