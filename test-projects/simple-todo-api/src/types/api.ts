import { Request, Response } from 'express';
import { Todo, CreateTodoInput, UpdateTodoInput } from './todo';

/**
 * Generic success response wrapper
 */
export interface SuccessResponse<T> {
  data: T;
  success: true;
}

/**
 * Generic error response structure
 */
export interface ErrorResponse {
  error: string;
  success: false;
}

/**
 * Union type for all possible API responses
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Type-safe Express Request for creating a Todo
 */
export interface CreateTodoRequest extends Request {
  body: CreateTodoInput;
}

/**
 * Type-safe Express Request for updating a Todo
 */
export interface UpdateTodoRequest extends Request {
  body: UpdateTodoInput;
  params: {
    id: string;
  };
}

/**
 * Type-safe Express Request for getting/deleting a single Todo
 */
export interface TodoByIdRequest extends Request {
  params: {
    id: string;
  };
}

/**
 * Response type for single Todo operations
 */
export type TodoResponse = Response<Todo | ErrorResponse>;

/**
 * Response type for list of Todos
 */
export type TodoListResponse = Response<Todo[]>;

/**
 * Response type for delete operations (204 No Content)
 */
export type DeleteResponse = Response<void>;

/**
 * Helper function to send error response
 */
export function sendError(res: Response, statusCode: number, message: string): void {
  res.status(statusCode).json({
    error: message,
    success: false
  } as ErrorResponse);
}

/**
 * Helper function to send success response
 */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  res.status(statusCode).json({
    data,
    success: true
  } as SuccessResponse<T>);
}
