'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';

interface Product {
  id?: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  is_available: boolean;
  is_featured: boolean;
}

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    category_id: product?.category_id || '',
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price || 0,
    image_url: product?.image_url || '',
    stock_quantity: product?.stock_quantity || 0,
    is_available: product?.is_available ?? true,
    is_featured: product?.is_featured ?? false,
  });

  const { data: categories } = trpc.categories.getAll.useQuery();
  const utils = trpc.useUtils();

  const createProduct = trpc.admin.products.create.useMutation({
    onSuccess: () => {
      utils.products.getAll.invalidate();
      onSuccess();
    },
  });

  const updateProduct = trpc.admin.products.update.useMutation({
    onSuccess: () => {
      utils.products.getAll.invalidate();
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (product?.id) {
      updateProduct.mutate({
        id: product.id,
        categoryId: formData.category_id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: formData.price,
        imageUrl: formData.image_url,
        stockQuantity: formData.stock_quantity,
        isAvailable: formData.is_available,
        isFeatured: formData.is_featured,
      });
    } else {
      createProduct.mutate({
        categoryId: formData.category_id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: formData.price,
        imageUrl: formData.image_url,
        stockQuantity: formData.stock_quantity,
        isAvailable: formData.is_available,
        isFeatured: formData.is_featured,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold">
        {product ? 'Edit Product' : 'Create Product'}
      </h3>

      <div>
        <label className="block mb-2">Category *</label>
        <select
          value={formData.category_id}
          onChange={(e) =>
            setFormData({ ...formData, category_id: e.target.value })
          }
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select category</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

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
        <label className="block mb-2">Price *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
          }
          required
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

      <div>
        <label className="block mb-2">Stock Quantity *</label>
        <input
          type="number"
          min="0"
          value={formData.stock_quantity}
          onChange={(e) =>
            setFormData({
              ...formData,
              stock_quantity: parseInt(e.target.value) || 0,
            })
          }
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_available"
          checked={formData.is_available}
          onChange={(e) =>
            setFormData({ ...formData, is_available: e.target.checked })
          }
        />
        <label htmlFor="is_available">Available</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_featured"
          checked={formData.is_featured}
          onChange={(e) =>
            setFormData({ ...formData, is_featured: e.target.checked })
          }
        />
        <label htmlFor="is_featured">Featured</label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createProduct.isPending || updateProduct.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {createProduct.isPending || updateProduct.isPending
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
