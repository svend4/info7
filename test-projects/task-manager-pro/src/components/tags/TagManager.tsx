/**
 * Tag manager component
 * Beautiful tag management with modern UI
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { Tag } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2, X, Tag as TagIcon } from 'lucide-react';

export function TagManager() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();
  const { data: tags } = trpc.tags.getAll.useQuery();

  const createTag = trpc.tags.create.useMutation({
    onSuccess: () => {
      utils.tags.getAll.invalidate();
      setName('');
      setError('');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const deleteTag = trpc.tags.delete.useMutation({
    onSuccess: () => {
      utils.tags.getAll.invalidate();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    await createTag.mutateAsync({ name });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this tag? It will be removed from all tasks.')) {
      await deleteTag.mutateAsync({ id });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tag-name">Tag Name</Label>
          <Input
            id="tag-name"
            type="text"
            placeholder="e.g., important, review, bug"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            disabled={createTag.isPending}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={createTag.isPending} className="w-full">
          {createTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {createTag.isPending ? 'Creating...' : 'Create Tag'}
        </Button>
      </form>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium">Your Tags</h4>
        </div>
        {tags?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tags yet. Create one above!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(tags as Tag[] | undefined)?.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="pl-3 pr-2 py-1.5 text-sm hover:bg-secondary/80 transition-colors"
              >
                {tag.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleDelete(tag.id)}
                  disabled={deleteTag.isPending}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
