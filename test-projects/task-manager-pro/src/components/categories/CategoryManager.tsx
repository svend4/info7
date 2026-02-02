/**
 * Category manager component
 * Beautiful category management with color picker
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { Category } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2, Trash2, Palette } from 'lucide-react';

const colorPresets = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#000000'
];

export function CategoryManager() {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();
  const { data: categories } = trpc.categories.getAll.useQuery();

  const createCategory = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.getAll.invalidate();
      setName('');
      setColor('#3B82F6');
      setError('');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const deleteCategory = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.getAll.invalidate();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    await createCategory.mutateAsync({ name, color });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category? Tasks will not be deleted.')) {
      await deleteCategory.mutateAsync({ id });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">Category Name</Label>
          <Input
            id="category-name"
            type="text"
            placeholder="e.g., Work, Personal, Urgent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={createCategory.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-3">
            <Input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-11 w-20 cursor-pointer"
              disabled={createCategory.isPending}
            />
            <Input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              pattern="^#[0-9A-Fa-f]{6}$"
              className="flex-1 font-mono"
              disabled={createCategory.isPending}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {colorPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                className="w-8 h-8 rounded border-2 border-transparent hover:border-primary transition-colors"
                style={{ backgroundColor: preset }}
                disabled={createCategory.isPending}
              />
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={createCategory.isPending} className="w-full">
          {createCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {createCategory.isPending ? 'Creating...' : 'Create Category'}
        </Button>
      </form>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium">Your Categories</h4>
        </div>
        {categories?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet. Create one above!</p>
        ) : (
          <div className="grid gap-2">
            {(categories as Category[] | undefined)?.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(category.id)}
                  disabled={deleteCategory.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
