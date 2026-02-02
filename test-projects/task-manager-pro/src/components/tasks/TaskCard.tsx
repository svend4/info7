/**
 * Task card component
 * Beautiful card with modern design and micro-interactions
 */

'use client';

import type { Task, Category, Tag } from '@/lib/types/database';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Trash2,
  Calendar,
  Flag,
  Circle,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface TaskCardProps {
  task: Task & {
    category: Category | null;
    tags: Tag[];
  };
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'todo' | 'in_progress' | 'completed') => void;
}

export function TaskCard({ task, onDelete, onStatusChange }: TaskCardProps) {
  const priorityConfig = {
    low: { color: 'bg-green-500/10 text-green-700 border-green-500/20', icon: Flag },
    medium: { color: 'bg-amber-500/10 text-amber-700 border-amber-500/20', icon: Flag },
    high: { color: 'bg-red-500/10 text-red-700 border-red-500/20', icon: Flag },
  };

  const statusConfig = {
    todo: {
      color: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
      icon: Circle,
      label: 'To Do'
    },
    in_progress: {
      color: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
      icon: Clock,
      label: 'In Progress'
    },
    completed: {
      color: 'bg-green-500/10 text-green-700 border-green-500/20',
      icon: CheckCircle2,
      label: 'Completed'
    },
  };

  const StatusIcon = statusConfig[task.status].icon;
  const PriorityIcon = priorityConfig[task.priority].icon;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link
              href={`/dashboard/tasks/${task.id}`}
              className="text-lg font-semibold text-slate-900 hover:text-primary transition-colors line-clamp-2"
            >
              {task.title}
            </Link>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'todo')}>
                <Circle className="mr-2 h-4 w-4" />
                Mark as To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>
                <Clock className="mr-2 h-4 w-4" />
                Mark as In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'completed')}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status & Priority Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className={`${statusConfig[task.status].color} border`}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {statusConfig[task.status].label}
          </Badge>
          <Badge variant="outline" className={`${priorityConfig[task.priority].color} border`}>
            <PriorityIcon className="mr-1 h-3 w-3" />
            {task.priority}
          </Badge>
          {task.category && (
            <Badge
              variant="outline"
              className="border"
              style={{
                backgroundColor: task.category.color + '15',
                borderColor: task.category.color + '40',
                color: task.category.color
              }}
            >
              {task.category.name}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {task.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs font-normal">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Due Date */}
        {task.due_date && (
          <div className={`flex items-center gap-2 text-sm ${
            isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
          }`}>
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Due {new Date(task.due_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
