/**
 * Dashboard main page
 * Beautiful task management with tabs and modern UI
 */

'use client';

import { useState } from 'react';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { TagManager } from '@/components/tags/TagManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ListTodo, FolderKanban, Tags } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-slate-900">
            My Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize and track your work efficiently
          </p>
        </div>

        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your list. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <TaskForm
              onSuccess={() => setShowTaskDialog(false)}
              onCancel={() => setShowTaskDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="h-4 w-4" />
            <span>Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderKanban className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-2">
            <Tags className="h-4 w-4" />
            <span>Tags</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <TaskList />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>
                Organize your tasks with custom categories and colors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="mt-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Manage Tags</CardTitle>
              <CardDescription>
                Add labels to your tasks for better organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TagManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
