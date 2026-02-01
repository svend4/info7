# Simple Todo API

**Testing project for Claude Code Orchestrator Kit**

## Purpose
This is a simple Todo List API created to test various Orchestrator Kit agents:
- `bug-hunter` - Find bugs in the code
- `bug-fixer` - Fix found bugs
- `typescript-types-specialist` - Add proper TypeScript types
- `test-writer` - Write unit tests
- `code-reviewer` - Perform code review

## Project Status
⚠️ **INTENTIONALLY BUGGY** - This code contains bugs for testing purposes

## Bugs to Find
- Missing input validation
- Array access with string index
- No error handling for missing todos
- Missing TypeScript types
- No tests

## How to Run
```bash
npm install
npm run dev
```

## API Endpoints
- `GET /todos` - Get all todos
- `GET /todos/:id` - Get single todo
- `POST /todos` - Create todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo
