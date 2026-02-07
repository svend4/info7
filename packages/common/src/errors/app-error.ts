/**
 * Common - Application Errors
 *
 * Standardized error handling with error codes and metadata
 */

/**
 * Error code enum
 */
export enum ErrorCode {
  // General errors (1xxx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Authentication errors (2xxx)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  MFA_REQUIRED = 'MFA_REQUIRED',

  // Authorization errors (3xxx)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_ACCESS_DENIED = 'RESOURCE_ACCESS_DENIED',

  // Resource errors (4xxx)
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',

  // Validation errors (5xxx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  VALUE_OUT_OF_RANGE = 'VALUE_OUT_OF_RANGE',

  // Rate limiting errors (6xxx)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // External service errors (7xxx)
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  EXTERNAL_SERVICE_TIMEOUT = 'EXTERNAL_SERVICE_TIMEOUT',
  EXTERNAL_SERVICE_UNAVAILABLE = 'EXTERNAL_SERVICE_UNAVAILABLE',

  // Database errors (8xxx)
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DUPLICATE_KEY = 'DUPLICATE_KEY',

  // Network errors (9xxx)
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
}

/**
 * Error severity
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Base application error
 */
export class AppError extends Error {
  public readonly code: ErrorCode | string;
  public readonly statusCode: number;
  public readonly severity: ErrorSeverity;
  public readonly metadata: Record<string, any>;
  public readonly timestamp: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode | string = ErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    metadata: Record<string, any> = {},
    isOperational: boolean = true
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.severity = severity;
    this.metadata = metadata;
    this.timestamp = Date.now();
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      severity: this.severity,
      metadata: this.metadata,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Convert to HTTP response format
   */
  toHTTP() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(Object.keys(this.metadata).length > 0 && { metadata: this.metadata }),
      },
    };
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    fields?: Record<string, string[]>,
    metadata: Record<string, any> = {}
  ) {
    super(
      message,
      ErrorCode.VALIDATION_ERROR,
      400,
      ErrorSeverity.LOW,
      { fields, ...metadata }
    );
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication failed',
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
    metadata: Record<string, any> = {}
  ) {
    super(message, code, 401, ErrorSeverity.MEDIUM, metadata);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Insufficient permissions',
    code: ErrorCode = ErrorCode.FORBIDDEN,
    metadata: Record<string, any> = {}
  ) {
    super(message, code, 403, ErrorSeverity.MEDIUM, metadata);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string,
    id?: string,
    metadata: Record<string, any> = {}
  ) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;

    super(
      message,
      ErrorCode.RESOURCE_NOT_FOUND,
      404,
      ErrorSeverity.LOW,
      { resource, id, ...metadata }
    );
  }
}

/**
 * Conflict error
 */
export class ConflictError extends AppError {
  constructor(
    message: string,
    metadata: Record<string, any> = {}
  ) {
    super(
      message,
      ErrorCode.RESOURCE_CONFLICT,
      409,
      ErrorSeverity.MEDIUM,
      metadata
    );
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    metadata: Record<string, any> = {}
  ) {
    super(
      message,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      429,
      ErrorSeverity.LOW,
      { retryAfter, ...metadata }
    );
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string,
    originalError?: Error,
    metadata: Record<string, any> = {}
  ) {
    super(
      `External service error (${service}): ${message}`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      502,
      ErrorSeverity.HIGH,
      {
        service,
        originalError: originalError?.message,
        ...metadata,
      }
    );
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    operation?: string,
    originalError?: Error,
    metadata: Record<string, any> = {}
  ) {
    super(
      message,
      ErrorCode.DATABASE_ERROR,
      500,
      ErrorSeverity.HIGH,
      {
        operation,
        originalError: originalError?.message,
        ...metadata,
      },
      false // Not operational - might indicate systemic issue
    );
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends AppError {
  constructor(
    operation: string,
    timeout: number,
    metadata: Record<string, any> = {}
  ) {
    super(
      `Operation ${operation} timed out after ${timeout}ms`,
      ErrorCode.TIMEOUT,
      408,
      ErrorSeverity.MEDIUM,
      { operation, timeout, ...metadata }
    );
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  /**
   * Check if error is operational
   */
  static isOperational(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  /**
   * Check if error is trusted (known error type)
   */
  static isTrusted(error: Error): boolean {
    return error instanceof AppError;
  }

  /**
   * Get error severity
   */
  static getSeverity(error: Error): ErrorSeverity {
    if (error instanceof AppError) {
      return error.severity;
    }
    return ErrorSeverity.HIGH;
  }

  /**
   * Convert unknown error to AppError
   */
  static toAppError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(
        error.message,
        ErrorCode.INTERNAL_ERROR,
        500,
        ErrorSeverity.HIGH,
        { originalError: error.name },
        false
      );
    }

    return new AppError(
      'An unknown error occurred',
      ErrorCode.INTERNAL_ERROR,
      500,
      ErrorSeverity.HIGH,
      { error: String(error) },
      false
    );
  }

  /**
   * Log error with appropriate level
   */
  static logError(error: AppError, logger: any): void {
    const logData = {
      code: error.code,
      message: error.message,
      severity: error.severity,
      metadata: error.metadata,
      stack: error.stack,
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        logger.error('Application Error', error, logData);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn('Application Warning', logData);
        break;
      case ErrorSeverity.LOW:
        logger.info('Application Info', logData);
        break;
    }
  }
}

/**
 * Async error wrapper
 */
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw ErrorHandler.toAppError(error);
    }
  };
}

/**
 * Assert condition or throw error
 */
export function assert(
  condition: boolean,
  message: string,
  ErrorClass: typeof AppError = AppError
): asserts condition {
  if (!condition) {
    throw new ErrorClass(message);
  }
}

/**
 * Assert value is not null/undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string = 'Value is required'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new ValidationError(message);
  }
}
