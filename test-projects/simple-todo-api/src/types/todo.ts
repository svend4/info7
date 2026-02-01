/**
 * Core Todo entity interface
 */
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

/**
 * Input type for creating a new Todo
 * Only requires title; id and completed are set by the system
 */
export interface CreateTodoInput {
  title: string;
}

/**
 * Input type for updating an existing Todo
 * All fields are optional to support partial updates
 */
export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}

/**
 * Type guard to check if a value is a valid Todo
 */
export function isTodo(value: unknown): value is Todo {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'completed' in value &&
    typeof (value as Todo).id === 'number' &&
    typeof (value as Todo).title === 'string' &&
    typeof (value as Todo).completed === 'boolean'
  );
}
