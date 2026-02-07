/**
 * Common - Advanced Logger
 *
 * Structured logging with winston - production-ready logging system
 */

import winston from 'winston';
import { config } from '../config/config-manager';

/**
 * Log level
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Log context (metadata)
 */
export interface LogContext {
  userId?: string;
  tenantId?: string;
  requestId?: string;
  component?: string;
  [key: string]: any;
}

/**
 * Logger options
 */
export interface LoggerOptions {
  level?: LogLevel;
  format?: 'json' | 'pretty';
  includeTimestamp?: boolean;
  includeMetadata?: boolean;
}

/**
 * Advanced Logger class
 */
export class Logger {
  private winston: winston.Logger;
  private context: LogContext = {};

  constructor(options: LoggerOptions = {}) {
    const level = options.level ?? config.getString('LOG_LEVEL', 'info');
    const format = options.format ?? config.getString('LOG_FORMAT', 'json');

    // Create formats
    const formats = [
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
    ];

    if (format === 'pretty') {
      formats.push(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let log = `${timestamp} [${level}] ${message}`;
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          return log;
        })
      );
    } else {
      formats.push(winston.format.json());
    }

    // Create logger
    this.winston = winston.createLogger({
      level,
      format: winston.format.combine(...formats),
      transports: [
        new winston.transports.Console(),
        // File transports (optional)
        ...(config.isProduction()
          ? [
              new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
              }),
              new winston.transports.File({
                filename: 'logs/combined.log',
              }),
            ]
          : []),
      ],
    });
  }

  /**
   * Set context for all subsequent logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Create child logger with additional context
   */
  child(context: LogContext): Logger {
    const child = new Logger();
    child.winston = this.winston.child(context);
    child.context = { ...this.context, ...context };
    return child;
  }

  /**
   * Log error
   */
  error(message: string, error?: Error | unknown, meta?: LogContext): void {
    const logMeta: any = { ...this.context, ...meta };

    if (error instanceof Error) {
      logMeta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      logMeta.error = error;
    }

    this.winston.error(message, logMeta);
  }

  /**
   * Log warning
   */
  warn(message: string, meta?: LogContext): void {
    this.winston.warn(message, { ...this.context, ...meta });
  }

  /**
   * Log info
   */
  info(message: string, meta?: LogContext): void {
    this.winston.info(message, { ...this.context, ...meta });
  }

  /**
   * Log debug
   */
  debug(message: string, meta?: LogContext): void {
    this.winston.debug(message, { ...this.context, ...meta });
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, meta?: LogContext): void {
    this.winston.log(level, message, { ...this.context, ...meta });
  }

  /**
   * Start a timer (for performance tracking)
   */
  startTimer(): () => void {
    const start = Date.now();

    return () => {
      const duration = Date.now() - start;
      return duration;
    };
  }

  /**
   * Log function execution time
   */
  async trackExecution<T>(
    operation: string,
    fn: () => Promise<T>,
    meta?: LogContext
  ): Promise<T> {
    const timer = this.startTimer();
    this.debug(`Starting: ${operation}`, meta);

    try {
      const result = await fn();
      const duration = timer();
      this.info(`Completed: ${operation}`, {
        ...meta,
        duration,
        status: 'success',
      });
      return result;
    } catch (error) {
      const duration = timer();
      this.error(`Failed: ${operation}`, error, {
        ...meta,
        duration,
        status: 'error',
      });
      throw error;
    }
  }

  /**
   * Log HTTP request
   */
  logRequest(req: {
    method: string;
    url: string;
    statusCode?: number;
    duration?: number;
    userId?: string;
    ip?: string;
  }): void {
    this.info('HTTP Request', {
      component: 'http',
      method: req.method,
      url: req.url,
      statusCode: req.statusCode,
      duration: req.duration,
      userId: req.userId,
      ip: req.ip,
    });
  }

  /**
   * Log database query
   */
  logQuery(query: {
    operation: string;
    table?: string;
    duration: number;
    rowsAffected?: number;
  }): void {
    this.debug('Database Query', {
      component: 'database',
      ...query,
    });
  }

  /**
   * Log external API call
   */
  logAPICall(call: {
    service: string;
    method: string;
    endpoint: string;
    statusCode?: number;
    duration: number;
    error?: string;
  }): void {
    const level = call.error ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, 'External API Call', {
      component: 'api-client',
      ...call,
    });
  }

  /**
   * Log metric
   */
  logMetric(metric: {
    name: string;
    value: number;
    unit?: string;
    tags?: Record<string, string>;
  }): void {
    this.debug('Metric', {
      component: 'metrics',
      ...metric,
    });
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.winston.level = level;
  }

  /**
   * Get log level
   */
  getLevel(): string {
    return this.winston.level;
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Create logger with component name
 */
export function createLogger(component: string, options?: LoggerOptions): Logger {
  const log = new Logger(options);
  log.setContext({ component });
  return log;
}

/**
 * Request logging middleware helper
 */
export function createRequestLogger(requestId: string, userId?: string) {
  return logger.child({
    requestId,
    userId,
    component: 'request',
  });
}
