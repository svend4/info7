'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

interface Category {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

interface CategoryFormProps {
  category?: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<Category>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
  });

  const utils = trpc.useUtils();

  const createCategory = trpc.admin.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.getAll.invalidate();
      onSuccess();
    },
  });

  const updateCategory = trpc.admin.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.getAll.invalidate();
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (category?.id) {
      updateCategory.mutate({
        id: category.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        imageUrl: formData.image_url,
      });
    } else {
      createCategory.mutate({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        imageUrl: formData.image_url,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold">
        {category ? 'Edit Category' : 'Create Category'}
      </h3>

      <div>
        <label className="block mb-2">Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-2">Slug *</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-2">Image URL</label>
        <input
          type="url"
          value={formData.image_url}
          onChange={(e) =>
            setFormData({ ...formData, image_url: e.target.value })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createCategory.isPending || updateCategory.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {createCategory.isPending || updateCategory.isPending
            ? 'Saving...'
            : 'Save'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
