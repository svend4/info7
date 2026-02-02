/**
 * Task detail page
 * Shows detailed view of a single task with editing capabilities
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { TagInput } from '@/components/tags/TagInput';
import type { Category } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'completed'>('todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const utils = trpc.useUtils();

  const { data: task, isLoading } = trpc.tasks.getById.useQuery({ id: taskId });

  // Update form fields when task data loads
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '');
      setCategoryId(task.category_id || '');
    }
  }, [task]);

  const { data: categories } = trpc.categories.getAll.useQuery();

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.getById.invalidate({ id: taskId });
      utils.tasks.getAll.invalidate();
      setIsEditing(false);
    },
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTask.mutateAsync({
      id: taskId,
      title,
      description: description || undefined,
      status,
      priority,
      due_date: dueDate || null,
      category_id: categoryId || null,
    });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync({ id: taskId });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">Loading task...</div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Task not found</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Tasks
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {!isEditing ? (
          <>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold">{task.title}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {task.description && (
              <div>
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Status</h3>
                <p className="text-lg">{task.status.replace('_', ' ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Priority</h3>
                <p className="text-lg capitalize">{task.priority}</p>
              </div>
            </div>

            {task.category && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Category</h3>
                <span className="inline-block px-3 py-1 rounded" style={{ backgroundColor: task.category.color + '20', color: task.category.color }}>
                  {task.category.name}
                </span>
              </div>
            )}

            {task.due_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-600">Due Date</h3>
                <p className="text-lg">{new Date(task.due_date).toLocaleString()}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Tags</h3>
              <TagInput taskId={taskId} currentTags={task.tags || []} />
            </div>

            <div className="text-sm text-gray-500">
              Created: {new Date(task.created_at).toLocaleString()}
            </div>
          </>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">No Category</option>
                {(categories as Category[] | undefined)?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateTask.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {updateTask.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
