'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { CategoryForm } from '@/components/admin/CategoryForm';

export const dynamic = 'force-dynamic';

export default function AdminCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { data: categories, isLoading } = trpc.categories.getAll.useQuery();
  const utils = trpc.useUtils();

  const deleteCategory = trpc.admin.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.getAll.invalidate();
    },
  });

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory.mutate({ id });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories Management</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-white rounded shadow">
          <CategoryForm
            category={editingCategory}
            onSuccess={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div>Loading categories...</div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Slug</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((category) => (
                <tr key={category.id} className="border-t">
                  <td className="p-4">{category.name}</td>
                  <td className="p-4">{category.slug}</td>
                  <td className="p-4">{category.description || '-'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
