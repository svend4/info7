import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

// Define Todo interface
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// In-memory storage with proper typing
let todos: Todo[] = [];

// Get all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// Get single todo
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json(todo);
});

// Create todo
app.post('/todos', (req, res) => {
  // Validate required fields
  if (!req.body.title || typeof req.body.title !== 'string') {
    return res.status(400).json({ error: 'Title is required and must be a string' });
  }

  if (req.body.title.trim().length === 0) {
    return res.status(400).json({ error: 'Title cannot be empty' });
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
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);

  // Check if todo exists
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  // Validate and build updates object
  const allowedFields = ['title', 'completed'];
  const updates: Partial<Todo> = {};

  for (const field of allowedFields) {
    if (field in req.body) {
      if (field === 'title') {
        if (typeof req.body.title !== 'string') {
          return res.status(400).json({ error: 'Title must be a string' });
        }
        if (req.body.title.trim().length === 0) {
          return res.status(400).json({ error: 'Title cannot be empty' });
        }
        updates.title = req.body.title.trim();
      }
      if (field === 'completed' && typeof req.body.completed !== 'boolean') {
        return res.status(400).json({ error: 'Completed must be a boolean' });
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
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(t => t.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
