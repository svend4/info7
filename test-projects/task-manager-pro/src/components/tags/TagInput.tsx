/**
 * Tag input component
 * Add/remove tags for a task
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { Tag } from '@/lib/types/database';

interface TagInputProps {
  taskId: string;
  currentTags: Tag[];
}

export function TagInput({ taskId, currentTags }: TagInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const utils = trpc.useUtils();
  const { data: allTags } = trpc.tags.getAll.useQuery();

  const addTag = trpc.tasks.addTag.useMutation({
    onSuccess: () => {
      utils.tasks.getAll.invalidate();
      utils.tasks.getById.invalidate({ id: taskId });
    },
  });

  const removeTag = trpc.tasks.removeTag.useMutation({
    onSuccess: () => {
      utils.tasks.getAll.invalidate();
      utils.tasks.getById.invalidate({ id: taskId });
    },
  });

  const availableTags = (allTags as Tag[] | undefined)?.filter(
    (tag) => !currentTags.some((ct) => ct.id === tag.id)
  );

  const handleAddTag = async (tagId: string) => {
    await addTag.mutateAsync({ task_id: taskId, tag_id: tagId });
    setShowDropdown(false);
  };

  const handleRemoveTag = async (tagId: string) => {
    await removeTag.mutateAsync({ task_id: taskId, tag_id: tagId });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {currentTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="text-red-600 hover:text-red-800"
              disabled={removeTag.isPending}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
        >
          + Add Tag
        </button>

        {showDropdown && (
          <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg">
            {availableTags?.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">No tags available</div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {availableTags?.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
