/**
 * Task list component
 * Beautiful task display with filters and loading states
 */

'use client';

import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from './TaskCard';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, CheckCircle2, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

function TaskSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </Card>
  );
}

export function TaskList() {
  const [filters, setFilters] = useState<{
    status?: 'todo' | 'in_progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    search?: string;
  }>({});

  const { tasks, isLoading, deleteTask, updateTask } = useTasks(filters);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync({ id });
    }
  };

  const handleStatusChange = async (id: string, status: 'todo' | 'in_progress' | 'completed') => {
    await updateTask.mutateAsync({ id, status });
  };

  const clearFilters = () => setFilters({});
  const hasFilters = filters.status || filters.priority || filters.search;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 flex-wrap">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 flex-1 min-w-[200px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4 border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value === 'all' ? undefined : (value as any) })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority || 'all'}
            onValueChange={(value) =>
              setFilters({ ...filters, priority: value === 'all' ? undefined : (value as any) })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="outline" onClick={clearFilters} size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>

      {/* Task Grid */}
      {tasks.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <div className="flex flex-col items-center gap-4">
            {hasFilters ? (
              <>
                <div className="bg-muted rounded-full p-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">No tasks found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-primary/10 rounded-full p-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">
                    You have no tasks yet. Create your first task to get started.
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-container">
          {tasks.map((task, index) => (
            <div key={task.id} className="stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
              <TaskCard
                task={task}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
        </div>
      )}

      {/* Results count */}
      {tasks.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          {hasFilters && ' (filtered)'}
        </p>
      )}
    </div>
  );
}
