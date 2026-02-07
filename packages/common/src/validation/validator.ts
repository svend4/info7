/**
 * Common - Validator
 *
 * Data validation utilities with Zod schemas
 */

import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/app-error';

/**
 * Validation result
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Validator class
 */
export class Validator {
  /**
   * Validate data against schema
   */
  static validate<T>(schema: ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const fields = this.formatZodErrors(error);
        throw new ValidationError('Validation failed', fields);
      }
      throw error;
    }
  }

  /**
   * Safe validate (returns result instead of throwing)
   */
  static safeValidate<T>(
    schema: ZodSchema<T>,
    data: unknown
  ): ValidationResult<T> {
    const result = schema.safeParse(data);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }

    return {
      success: false,
      errors: this.formatZodErrors(result.error),
    };
  }

  /**
   * Format Zod errors
   */
  private static formatZodErrors(error: ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    for (const issue of error.issues) {
      const path = issue.path.join('.');
      if (!formatted[path]) {
        formatted[path] = [];
      }
      formatted[path].push(issue.message);
    }

    return formatted;
  }

  /**
   * Validate array of objects
   */
  static validateArray<T>(
    schema: ZodSchema<T>,
    data: unknown[]
  ): T[] {
    return data.map((item, index) => {
      try {
        return this.validate(schema, item);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(
            `Validation failed at index ${index}`,
            error.metadata.fields
          );
        }
        throw error;
      }
    });
  }

  /**
   * Validate partial object (all fields optional)
   */
  static validatePartial<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
    data: unknown
  ): Partial<z.infer<z.ZodObject<T>>> {
    return this.validate(schema.partial(), data);
  }
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  /** Email address */
  email: z.string().email('Invalid email address'),

  /** URL */
  url: z.string().url('Invalid URL'),

  /** UUID */
  uuid: z.string().uuid('Invalid UUID'),

  /** Phone number (simple validation) */
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),

  /** Password (minimum 8 characters, at least one letter and one number) */
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  /** Strong password (additional special character requirement) */
  strongPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),

  /** Date string (ISO 8601) */
  dateString: z.string().datetime('Invalid date format'),

  /** Positive integer */
  positiveInt: z.number().int().positive('Must be a positive integer'),

  /** Non-negative integer */
  nonNegativeInt: z.number().int().min(0, 'Must be non-negative'),

  /** Port number */
  port: z.number().int().min(1).max(65535, 'Invalid port number'),

  /** IP address */
  ipAddress: z.string().ip('Invalid IP address'),

  /** Credit card number (Luhn algorithm) */
  creditCard: z.string().regex(/^\d{13,19}$/, 'Invalid credit card number'),

  /** Slug (URL-friendly string) */
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),

  /** Hex color */
  hexColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),

  /** JWT token */
  jwtToken: z
    .string()
    .regex(/^[\w-]+\.[\w-]+\.[\w-]+$/, 'Invalid JWT token'),

  /** Pagination params */
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),

  /** Sort params */
  sort: z.object({
    field: z.string(),
    order: z.enum(['asc', 'desc']).default('asc'),
  }),

  /** Date range */
  dateRange: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }).refine(
    (data) => data.end >= data.start,
    'End date must be after start date'
  ),
};

/**
 * Validation decorators
 */

/**
 * Validate method parameters
 */
export function ValidateParams(
  ...schemas: (ZodSchema | undefined)[]
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Validate each parameter
      for (let i = 0; i < schemas.length; i++) {
        const schema = schemas[i];
        if (schema) {
          try {
            args[i] = Validator.validate(schema, args[i]);
          } catch (error) {
            if (error instanceof ValidationError) {
              throw new ValidationError(
                `Parameter ${i} validation failed: ${error.message}`,
                error.metadata.fields
              );
            }
            throw error;
          }
        }
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Validate method return value
 */
export function ValidateReturn<T>(schema: ZodSchema<T>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      return Validator.validate(schema, result);
    };

    return descriptor;
  };
}

/**
 * Create validator function from schema
 */
export function createValidator<T>(schema: ZodSchema<T>) {
  return (data: unknown): T => {
    return Validator.validate(schema, data);
  };
}

/**
 * Create safe validator function from schema
 */
export function createSafeValidator<T>(schema: ZodSchema<T>) {
  return (data: unknown): ValidationResult<T> => {
    return Validator.safeValidate(schema, data);
  };
}

/**
 * Validate object keys
 */
export function validateKeys<T extends Record<string, any>>(
  obj: T,
  allowedKeys: string[]
): void {
  const objKeys = Object.keys(obj);
  const invalidKeys = objKeys.filter((key) => !allowedKeys.includes(key));

  if (invalidKeys.length > 0) {
    throw new ValidationError(
      `Invalid keys: ${invalidKeys.join(', ')}`,
      { invalidKeys: invalidKeys.map((key) => `Key '${key}' is not allowed`) }
    );
  }
}

/**
 * Sanitize string (remove HTML tags, trim)
 */
export function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize object (recursively sanitize all string values)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object'
          ? sanitizeObject(item)
          : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
