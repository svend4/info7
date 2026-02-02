/**
 * Task form component
 * Beautiful form for creating and editing tasks
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { Category } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface TaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TaskForm({ onSuccess, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'completed'>('todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.getAll.invalidate();
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate('');
      setCategoryId('');
      onSuccess?.();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const { data: categories } = trpc.categories.getAll.useQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    await createTask.mutateAsync({
      title,
      description: description || undefined,
      status,
      priority,
      due_date: dueDate || undefined,
      category_id: categoryId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="task-title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="task-title"
          type="text"
          placeholder="Enter task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={createTask.isPending}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="task-description">Description</Label>
        <Textarea
          id="task-description"
          placeholder="Add more details about this task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={createTask.isPending}
        />
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="task-status">Status</Label>
          <Select
            value={status}
            onValueChange={(value: any) => setStatus(value)}
            disabled={createTask.isPending}
          >
            <SelectTrigger id="task-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-priority">Priority</Label>
          <Select
            value={priority}
            onValueChange={(value: any) => setPriority(value)}
            disabled={createTask.isPending}
          >
            <SelectTrigger id="task-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label htmlFor="task-due-date">Due Date</Label>
        <Input
          id="task-due-date"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={createTask.isPending}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="task-category">Category</Label>
        <Select
          value={categoryId || 'none'}
          onValueChange={(value) => setCategoryId(value === 'none' ? '' : value)}
          disabled={createTask.isPending}
        >
          <SelectTrigger id="task-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Category</SelectItem>
            {(categories as Category[] | undefined)?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={createTask.isPending} className="flex-1">
          {createTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {createTask.isPending ? 'Creating...' : 'Create Task'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createTask.isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
