/**
 * Common - Configuration Manager
 *
 * Centralized configuration management with environment variables and defaults
 */

import * as dotenv from 'dotenv';
import { z, ZodSchema } from 'zod';

/**
 * Configuration environment
 */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * Configuration manager
 */
export class ConfigManager {
  private config: Map<string, any> = new Map();
  private schemas: Map<string, ZodSchema> = new Map();

  constructor() {
    // Load .env file
    dotenv.config();
  }

  /**
   * Get environment
   */
  getEnvironment(): Environment {
    const env = process.env.NODE_ENV?.toLowerCase();

    switch (env) {
      case 'production':
      case 'prod':
        return Environment.PRODUCTION;
      case 'staging':
      case 'stage':
        return Environment.STAGING;
      case 'test':
        return Environment.TEST;
      default:
        return Environment.DEVELOPMENT;
    }
  }

  /**
   * Check if production
   */
  isProduction(): boolean {
    return this.getEnvironment() === Environment.PRODUCTION;
  }

  /**
   * Check if development
   */
  isDevelopment(): boolean {
    return this.getEnvironment() === Environment.DEVELOPMENT;
  }

  /**
   * Check if test
   */
  isTest(): boolean {
    return this.getEnvironment() === Environment.TEST;
  }

  /**
   * Get configuration value
   */
  get<T = any>(key: string, defaultValue?: T): T {
    // Check cached config
    if (this.config.has(key)) {
      return this.config.get(key) as T;
    }

    // Check environment variable
    const envValue = process.env[key];
    if (envValue !== undefined) {
      const parsedValue = this.parseValue(envValue);
      this.config.set(key, parsedValue);
      return parsedValue as T;
    }

    // Return default value
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Configuration key "${key}" not found and no default provided`);
  }

  /**
   * Get required configuration value (throws if not found)
   */
  getRequired<T = any>(key: string): T {
    const value = this.get<T>(key);
    if (value === undefined || value === null) {
      throw new Error(`Required configuration key "${key}" is missing`);
    }
    return value;
  }

  /**
   * Get string value
   */
  getString(key: string, defaultValue?: string): string {
    return this.get<string>(key, defaultValue);
  }

  /**
   * Get number value
   */
  getNumber(key: string, defaultValue?: number): number {
    const value = this.get<string>(key, defaultValue?.toString());
    return parseInt(value, 10);
  }

  /**
   * Get boolean value
   */
  getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.get<string>(key, defaultValue?.toString());
    return value === 'true' || value === '1' || value === 'yes';
  }

  /**
   * Get array value (comma-separated)
   */
  getArray(key: string, defaultValue?: string[]): string[] {
    const value = this.get<string>(key, defaultValue?.join(','));
    return value ? value.split(',').map(v => v.trim()) : [];
  }

  /**
   * Get JSON value
   */
  getJSON<T = any>(key: string, defaultValue?: T): T {
    const value = this.get<string>(key);
    if (!value) {
      if (defaultValue !== undefined) return defaultValue;
      throw new Error(`Configuration key "${key}" not found`);
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      throw new Error(`Failed to parse JSON for key "${key}": ${error}`);
    }
  }

  /**
   * Set configuration value
   */
  set(key: string, value: any): void {
    this.config.set(key, value);
  }

  /**
   * Set multiple values
   */
  setMany(values: Record<string, any>): void {
    for (const [key, value] of Object.entries(values)) {
      this.set(key, value);
    }
  }

  /**
   * Register validation schema for a key
   */
  registerSchema(key: string, schema: ZodSchema): void {
    this.schemas.set(key, schema);
  }

  /**
   * Validate configuration value
   */
  validate<T>(key: string, value: any): T {
    const schema = this.schemas.get(key);
    if (!schema) {
      return value as T;
    }

    const result = schema.safeParse(value);
    if (!result.success) {
      throw new Error(
        `Validation failed for key "${key}": ${result.error.message}`
      );
    }

    return result.data as T;
  }

  /**
   * Get and validate value
   */
  getValidated<T>(key: string, schema: ZodSchema, defaultValue?: T): T {
    const value = this.get(key, defaultValue);
    return this.validate<T>(key, value);
  }

  /**
   * Parse string value to appropriate type
   */
  private parseValue(value: string): any {
    // Boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Number
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return Number(value);
    }

    // JSON
    if ((value.startsWith('{') && value.endsWith('}')) ||
        (value.startsWith('[') && value.endsWith(']'))) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    return value;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.config.has(key) || process.env[key] !== undefined;
  }

  /**
   * Get all configuration
   */
  getAll(): Record<string, any> {
    const all: Record<string, any> = {};

    // From cache
    for (const [key, value] of this.config.entries()) {
      all[key] = value;
    }

    // From environment
    for (const [key, value] of Object.entries(process.env)) {
      if (!all[key]) {
        all[key] = this.parseValue(value);
      }
    }

    return all;
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.config.clear();
  }

  /**
   * Reload from environment
   */
  reload(): void {
    this.clear();
    dotenv.config();
  }
}

// Export singleton instance
export const config = new ConfigManager();

/**
 * Common configuration schema
 */
export const commonConfigSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).optional(),

  // Server
  PORT: z.coerce.number().optional().default(3000),
  HOST: z.string().optional().default('localhost'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).optional().default('json'),

  // Database
  DATABASE_URL: z.string().url().optional(),
  DATABASE_POOL_SIZE: z.coerce.number().optional().default(10),

  // Redis
  REDIS_URL: z.string().url().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // API Keys
  OPENAI_API_KEY: z.string().optional(),
  PINECONE_API_KEY: z.string().optional(),

  // Security
  JWT_SECRET: z.string().optional(),
  SESSION_SECRET: z.string().optional(),

  // Features
  ENABLE_ANALYTICS: z.coerce.boolean().optional().default(true),
  ENABLE_AUDIT_LOG: z.coerce.boolean().optional().default(true),
});

export type CommonConfig = z.infer<typeof commonConfigSchema>;

/**
 * Load and validate common configuration
 */
export function loadCommonConfig(): CommonConfig {
  return commonConfigSchema.parse(process.env);
}
