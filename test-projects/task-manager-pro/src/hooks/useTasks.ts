/**
 * Task operations hook
 * Provides convenience methods for common task operations
 */

'use client';

import { trpc } from '@/lib/trpc/client';

export function useTasks(filters?: {
  status?: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  category_id?: string;
  search?: string;
}) {
  const utils = trpc.useUtils();

  // Queries
  const tasksQuery = trpc.tasks.getAll.useQuery(filters ?? {});

  // Mutations
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.getAll.invalidate();
    },
  });

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.getAll.invalidate();
    },
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.getAll.invalidate();
    },
  });

  const addTag = trpc.tasks.addTag.useMutation({
    onSuccess: () => {
      utils.tasks.getAll.invalidate();
    },
  });

  const removeTag = trpc.tasks.removeTag.useMutation({
    onSuccess: () => {
      utils.tasks.getAll.invalidate();
    },
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask,
    updateTask,
    deleteTask,
    addTag,
    removeTag,
    refetch: tasksQuery.refetch,
  };
}
