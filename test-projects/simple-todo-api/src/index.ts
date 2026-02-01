import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory storage
let todos = [];

// Get all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// Get single todo - BUG: No validation
app.get('/todos/:id', (req, res) => {
  const todo = todos[req.params.id]; // BUG: Array access with string
  res.json(todo);
});

// Create todo - BUG: No input validation
app.post('/todos', (req, res) => {
  const todo = {
    id: Date.now(),
    title: req.body.title,
    completed: false
  };
  todos.push(todo);
  res.json(todo);
});

// Update todo - BUG: findIndex returns -1 if not found
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  todos[index] = { ...todos[index], ...req.body }; // BUG: No check if index exists
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
