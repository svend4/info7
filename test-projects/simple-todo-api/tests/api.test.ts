import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app, { resetTodos } from '../src/index';
import { Todo } from '../src/types';

describe('Todo API Tests', () => {
  // Reset todos before each test to ensure test isolation
  beforeEach(() => {
    resetTodos();
  });

  describe('GET /todos - Get all todos', () => {
    it('should return empty array initially', async () => {
      const response = await request(app).get('/todos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return all todos after adding some', async () => {
      // Create first todo
      const todo1 = await request(app)
        .post('/todos')
        .send({ title: 'First Todo' });

      // Create second todo
      const todo2 = await request(app)
        .post('/todos')
        .send({ title: 'Second Todo' });

      // Get all todos
      const response = await request(app).get('/todos');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('First Todo');
      expect(response.body[1].title).toBe('Second Todo');
      expect(response.body[0].completed).toBe(false);
      expect(response.body[1].completed).toBe(false);
    });

    it('should return todos with proper structure', async () => {
      await request(app)
        .post('/todos')
        .send({ title: 'Test Todo' });

      const response = await request(app).get('/todos');

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('completed');
      expect(typeof response.body[0].id).toBe('number');
      expect(typeof response.body[0].title).toBe('string');
      expect(typeof response.body[0].completed).toBe('boolean');
    });
  });

  describe('GET /todos/:id - Get single todo', () => {
    it('should return todo when it exists', async () => {
      // Create a todo
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Test Todo' });

      const todoId = createResponse.body.id;

      // Get the todo by ID
      const response = await request(app).get(`/todos/${todoId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(todoId);
      expect(response.body.title).toBe('Test Todo');
      expect(response.body.completed).toBe(false);
    });

    it('should return 404 when todo not found', async () => {
      const response = await request(app).get('/todos/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Todo not found');
    });

    it('should handle invalid id format', async () => {
      // Note: parseInt handles invalid strings by returning NaN,
      // which won't match any todo, resulting in 404
      const response = await request(app).get('/todos/invalid');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });

    it('should handle negative id', async () => {
      const response = await request(app).get('/todos/-1');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });
  });

  describe('POST /todos - Create todo', () => {
    it('should create todo with valid data', async () => {
      const newTodo = { title: 'New Todo Item' };

      const response = await request(app)
        .post('/todos')
        .send(newTodo);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('New Todo Item');
      expect(response.body.completed).toBe(false);
      expect(typeof response.body.id).toBe('number');
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/todos')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required and must be a string');
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when title is empty string', async () => {
      const response = await request(app)
        .post('/todos')
        .send({ title: '' });

      expect(response.status).toBe(400);
      // Empty string is falsy, so it triggers the "required" check first
      expect(response.body.error).toBe('Title is required and must be a string');
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when title is only whitespace', async () => {
      const response = await request(app)
        .post('/todos')
        .send({ title: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title cannot be empty');
      expect(response.body.success).toBe(false);
    });

    it('should trim whitespace from title', async () => {
      const response = await request(app)
        .post('/todos')
        .send({ title: '  Trimmed Todo  ' });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Trimmed Todo');
    });

    it('should return 400 when title is not a string', async () => {
      const response = await request(app)
        .post('/todos')
        .send({ title: 123 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required and must be a string');
    });

    it('should return 400 when title is null', async () => {
      const response = await request(app)
        .post('/todos')
        .send({ title: null });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required and must be a string');
    });

    it('should create multiple todos with unique IDs', async () => {
      const response1 = await request(app)
        .post('/todos')
        .send({ title: 'First' });

      const response2 = await request(app)
        .post('/todos')
        .send({ title: 'Second' });

      expect(response1.body.id).not.toBe(response2.body.id);
      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
    });

    it('should persist todos across requests', async () => {
      await request(app)
        .post('/todos')
        .send({ title: 'Persistent Todo' });

      const response = await request(app).get('/todos');

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Persistent Todo');
    });
  });

  describe('PUT /todos/:id - Update todo', () => {
    it('should update todo title', async () => {
      // Create a todo
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Original Title' });

      const todoId = createResponse.body.id;

      // Update the title
      const response = await request(app)
        .put(`/todos/${todoId}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(todoId);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.completed).toBe(false);
    });

    it('should update completed status', async () => {
      // Create a todo
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Test Todo' });

      const todoId = createResponse.body.id;

      // Mark as completed
      const response = await request(app)
        .put(`/todos/${todoId}`)
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(todoId);
      expect(response.body.completed).toBe(true);
      expect(response.body.title).toBe('Test Todo');
    });

    it('should update both title and completed status', async () => {
      // Create a todo
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Original' });

      const todoId = createResponse.body.id;

      // Update both fields
      const response = await request(app)
        .put(`/todos/${todoId}`)
        .send({ title: 'Updated', completed: true });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated');
      expect(response.body.completed).toBe(true);
    });

    it('should return 404 when todo not found', async () => {
      const response = await request(app)
        .put('/todos/99999')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
      expect(response.body.success).toBe(false);
    });

    it('should validate title type', async () => {
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Test' });

      const todoId = createResponse.body.id;

      const response = await request(app)
        .put(`/todos/${todoId}`)
        .send({ title: 123 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title must be a string');
    });

    it('should validate completed type', async () => {
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Test' });

      const todoId = createResponse.body.id;

      const response = await request(app)
        .put(`/todos/${todoId}`)
        .send({ completed: 'true' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Completed must be a boolean');
    });

    it('should reject empty title', async () => {
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Test' });

      const todoId = createResponse.body.id;

      const response = await request(app)
        .put(`/todos/${todoId}`)
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title cannot be empty');
    });

    it('should reject whitespace-only title', async () => {
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Test' });

      const todoId = createResponse.body.id;

      const response = await request(app)
        .put(`/todos/${todoId}`)
        .send({ title: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title cannot be empty');
    });

    it('should trim whitespace from updated title', async () => {
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Test' });

      const todoId = createResponse.body.id;

      const response = await request(app)
        .put(`/todos/${todoId}`)
        .send({ title: '  Trimmed Update  ' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Trimmed Update');
    });

    it('should ignore invalid fields', async () => {
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Test' });

      const todoId = createResponse.body.id;

      const response = await request(app)
        .put(`/todos/${todoId}`)
        .send({
          title: 'Updated',
          invalidField: 'should be ignored',
          anotherInvalid: 123
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated');
      expect(response.body).not.toHaveProperty('invalidField');
      expect(response.body).not.toHaveProperty('anotherInvalid');
    });

    it('should allow partial updates (title only)', async () => {
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Test' });

      const todoId = createResponse.body.id;

      const response = await request(app)
        .put(`/todos/${todoId}`)
        .send({ title: 'Only Title Updated' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Only Title Updated');
      expect(response.body.completed).toBe(false);
    });

    it('should allow partial updates (completed only)', async () => {
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Test' });

      const todoId = createResponse.body.id;

      const response = await request(app)
        .put(`/todos/${todoId}`)
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test');
      expect(response.body.completed).toBe(true);
    });

    it('should handle updating non-existent todo with invalid id', async () => {
      const response = await request(app)
        .put('/todos/invalid')
        .send({ title: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });
  });

  describe('DELETE /todos/:id - Delete todo', () => {
    it('should delete todo when it exists', async () => {
      // Create a todo
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'To Be Deleted' });

      const todoId = createResponse.body.id;

      // Delete the todo
      const deleteResponse = await request(app).delete(`/todos/${todoId}`);

      expect(deleteResponse.status).toBe(204);
      expect(deleteResponse.body).toEqual({});

      // Verify it's deleted
      const getResponse = await request(app).get(`/todos/${todoId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 204 status for successful deletion', async () => {
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Test' });

      const todoId = createResponse.body.id;

      const response = await request(app).delete(`/todos/${todoId}`);

      expect(response.status).toBe(204);
    });

    it('should remove todo from list after deletion', async () => {
      // Create multiple todos
      await request(app).post('/todos').send({ title: 'Todo 1' });
      const todo2Response = await request(app).post('/todos').send({ title: 'Todo 2' });
      await request(app).post('/todos').send({ title: 'Todo 3' });

      // Delete the middle one
      await request(app).delete(`/todos/${todo2Response.body.id}`);

      // Verify list
      const listResponse = await request(app).get('/todos');
      expect(listResponse.body).toHaveLength(2);
      expect(listResponse.body.find((t: Todo) => t.title === 'Todo 2')).toBeUndefined();
    });

    it('should handle deleting non-existent todo gracefully', async () => {
      // Delete a non-existent todo (should still return 204)
      const response = await request(app).delete('/todos/99999');

      expect(response.status).toBe(204);
    });

    it('should handle invalid id format', async () => {
      const response = await request(app).delete('/todos/invalid');

      expect(response.status).toBe(204);
    });

    it('should successfully delete multiple todos', async () => {
      // Create todos
      const todo1 = await request(app).post('/todos').send({ title: 'First' });
      const todo2 = await request(app).post('/todos').send({ title: 'Second' });

      // Delete both
      await request(app).delete(`/todos/${todo1.body.id}`);
      await request(app).delete(`/todos/${todo2.body.id}`);

      // Verify empty list
      const listResponse = await request(app).get('/todos');
      expect(listResponse.body).toHaveLength(0);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle multiple operations in sequence', async () => {
      // Create
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Sequential Test' });

      const todoId = createResponse.body.id;

      // Read
      const getResponse = await request(app).get(`/todos/${todoId}`);
      expect(getResponse.body.title).toBe('Sequential Test');

      // Update
      const updateResponse = await request(app)
        .put(`/todos/${todoId}`)
        .send({ completed: true });
      expect(updateResponse.body.completed).toBe(true);

      // Delete
      const deleteResponse = await request(app).delete(`/todos/${todoId}`);
      expect(deleteResponse.status).toBe(204);

      // Verify deletion
      const finalGetResponse = await request(app).get(`/todos/${todoId}`);
      expect(finalGetResponse.status).toBe(404);
    });

    it('should handle concurrent todo creation', async () => {
      const promises = [
        request(app).post('/todos').send({ title: 'Concurrent 1' }),
        request(app).post('/todos').send({ title: 'Concurrent 2' }),
        request(app).post('/todos').send({ title: 'Concurrent 3' }),
      ];

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      const listResponse = await request(app).get('/todos');
      expect(listResponse.body).toHaveLength(3);
    });

    it('should maintain data integrity across operations', async () => {
      // Create initial todo
      const todo1 = await request(app)
        .post('/todos')
        .send({ title: 'First' });

      // Create second todo
      const todo2 = await request(app)
        .post('/todos')
        .send({ title: 'Second' });

      // Update first todo
      await request(app)
        .put(`/todos/${todo1.body.id}`)
        .send({ completed: true });

      // Verify second todo is unchanged
      const getSecond = await request(app).get(`/todos/${todo2.body.id}`);
      expect(getSecond.body.title).toBe('Second');
      expect(getSecond.body.completed).toBe(false);
    });

    it('should handle special characters in title', async () => {
      const specialTitle = 'Todo with special chars: !@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';

      const response = await request(app)
        .post('/todos')
        .send({ title: specialTitle });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(specialTitle);
    });

    it('should handle very long title', async () => {
      const longTitle = 'A'.repeat(1000);

      const response = await request(app)
        .post('/todos')
        .send({ title: longTitle });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(longTitle);
    });

    it('should handle unicode characters in title', async () => {
      const unicodeTitle = '测试 тест 테스트 🎉 emoji test';

      const response = await request(app)
        .post('/todos')
        .send({ title: unicodeTitle });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(unicodeTitle);
    });
  });

  describe('API Response Format', () => {
    it('should return consistent error format', async () => {
      const response = await request(app)
        .post('/todos')
        .send({ title: '' });

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(typeof response.body.error).toBe('string');
    });

    it('should return consistent success format for list', async () => {
      const response = await request(app).get('/todos');

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return consistent success format for single todo', async () => {
      const createResponse = await request(app)
        .post('/todos')
        .send({ title: 'Test' });

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body).toHaveProperty('title');
      expect(createResponse.body).toHaveProperty('completed');
    });

    it('should set correct content-type headers', async () => {
      const response = await request(app).get('/todos');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
