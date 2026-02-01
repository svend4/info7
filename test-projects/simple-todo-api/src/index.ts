import express, { Request, Response } from 'express';
import {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoByIdRequest,
  TodoResponse,
  TodoListResponse,
  DeleteResponse,
  sendError,
  sendSuccess
} from './types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory storage with proper typing
let todos: Todo[] = [];

// Helper function to reset todos (for testing)
export function resetTodos(): void {
  todos = [];
}

// Get all todos
app.get('/todos', (req: Request, res: TodoListResponse) => {
  res.json(todos);
});

// Get single todo
app.get('/todos/:id', (req: TodoByIdRequest, res: TodoResponse) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return sendError(res, 404, 'Todo not found');
  }

  res.json(todo);
});

// Create todo
app.post('/todos', (req: CreateTodoRequest, res: TodoResponse) => {
  // Validate required fields
  if (!req.body.title || typeof req.body.title !== 'string') {
    return sendError(res, 400, 'Title is required and must be a string');
  }

  if (req.body.title.trim().length === 0) {
    return sendError(res, 400, 'Title cannot be empty');
  }

  const todo: Todo = {
    id: Date.now(),
    title: req.body.title.trim(),
    completed: false
  };
  todos.push(todo);
  res.status(201).json(todo);
});

// Update todo
app.put('/todos/:id', (req: UpdateTodoRequest, res: TodoResponse) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);

  // Check if todo exists
  if (index === -1) {
    return sendError(res, 404, 'Todo not found');
  }

  // Validate and build updates object
  const allowedFields = ['title', 'completed'];
  const updates: Partial<Todo> = {};

  for (const field of allowedFields) {
    if (field in req.body) {
      if (field === 'title') {
        if (typeof req.body.title !== 'string') {
          return sendError(res, 400, 'Title must be a string');
        }
        if (req.body.title.trim().length === 0) {
          return sendError(res, 400, 'Title cannot be empty');
        }
        updates.title = req.body.title.trim();
      }
      if (field === 'completed' && typeof req.body.completed !== 'boolean') {
        return sendError(res, 400, 'Completed must be a boolean');
      }
      if (field === 'completed' && typeof req.body.completed === 'boolean') {
        updates.completed = req.body.completed;
      }
    }
  }

  todos[index] = { ...todos[index], ...updates };
  res.json(todos[index]);
});

// Delete todo
app.delete('/todos/:id', (req: TodoByIdRequest, res: DeleteResponse) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(t => t.id !== id);
  res.status(204).send();
});

// Export app for testing
export default app;

// Only start server if not in test environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
