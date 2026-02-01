/**
 * Barrel export file for all type definitions
 * Provides a single import point for all types in the application
 */

// Export all Todo-related types
export type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput
} from './todo';

export { isTodo } from './todo';

// Export all API-related types
export type {
  SuccessResponse,
  ErrorResponse,
  ApiResponse,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoByIdRequest,
  TodoResponse,
  TodoListResponse,
  DeleteResponse
} from './api';

export { sendError, sendSuccess } from './api';
