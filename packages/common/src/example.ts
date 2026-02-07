/**
 * Common Utilities - Usage Example
 *
 * Demonstrates all utility features
 */

import { z } from 'zod';
import { config, loadCommonConfig } from './config/config-manager';
import { logger, createLogger, LogLevel } from './logging/logger';
import {
  AppError,
  ValidationError,
  NotFoundError,
  ErrorHandler,
  asyncHandler,
} from './errors/app-error';
import { Validator, commonSchemas } from './validation/validator';
import {
  HealthCheckManager,
  commonHealthChecks,
  HealthStatus,
} from './health/health-check';
import { metrics, commonMetrics } from './metrics/metrics-collector';

async function main() {
  console.log('🛠️  Common Utilities - Example\n');
  console.log('=' .repeat(60));
  console.log();

  // ==========================================
  // Example 1: Configuration Management
  // ==========================================
  console.log('Example 1: Configuration Management\n');

  // Set config values
  config.set('APP_NAME', 'info7');
  config.set('PORT', 3000);
  config.set('DEBUG', true);
  config.set('FEATURES', ['analytics', 'audit', 'sso']);

  // Get config values
  console.log('Configuration:');
  console.log(`  App name: ${config.getString('APP_NAME', 'default')}`);
  console.log(`  Port: ${config.getNumber('PORT', 8080)}`);
  console.log(`  Debug: ${config.getBoolean('DEBUG', false)}`);
  console.log(`  Features: ${config.getArray('FEATURES', []).join(', ')}`);
  console.log(`  Environment: ${config.getEnvironment()}`);
  console.log(`  Is production: ${config.isProduction()}`);
  console.log();

  // Validate config
  try {
    const validatedConfig = loadCommonConfig();
    console.log('✅ Configuration validated');
  } catch (error) {
    console.log('❌ Configuration validation failed:', error);
  }
  console.log();

  console.log('=' .repeat(60));
  console.log();

  // ==========================================
  // Example 2: Advanced Logging
  // ==========================================
  console.log('Example 2: Advanced Logging\n');

  // Create component logger
  const apiLogger = createLogger('api-server');

  // Log at different levels
  apiLogger.info('Server starting', {
    port: 3000,
    environment: 'development',
  });

  apiLogger.debug('Configuration loaded', {
    configKeys: ['PORT', 'DEBUG', 'FEATURES'],
  });

  apiLogger.warn('Rate limit approaching', {
    current: 950,
    limit: 1000,
    userId: 'user-123',
  });

  // Log error with stack trace
  try {
    throw new Error('Database connection failed');
  } catch (error) {
    apiLogger.error('Critical error occurred', error, {
      component: 'database',
      action: 'connect',
    });
  }

  // Track execution time
  await apiLogger.trackExecution('process-data', async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return 'Data processed';
  });

  // Log HTTP request
  apiLogger.logRequest({
    method: 'POST',
    url: '/api/users',
    statusCode: 201,
    duration: 45,
    userId: 'user-123',
    ip: '192.168.1.1',
  });

  console.log('✅ Logging examples complete (check console output)\n');

  console.log('=' .repeat(60));
  console.log();

  // ==========================================
  // Example 3: Error Handling
  // ==========================================
  console.log('Example 3: Standardized Error Handling\n');

  console.log('Error Examples:');

  // Validation error
  try {
    throw new ValidationError('Invalid input', {
      email: ['Invalid email format'],
      password: ['Password too short', 'Missing special character'],
    });
  } catch (error) {
    console.log('  Validation Error:', (error as AppError).toHTTP());
  }

  // Not found error
  try {
    throw new NotFoundError('User', 'user-123');
  } catch (error) {
    console.log('  Not Found Error:', (error as AppError).toHTTP());
  }

  // Convert unknown error
  try {
    throw new Error('Unknown error');
  } catch (error) {
    const appError = ErrorHandler.toAppError(error);
    console.log('  Converted Error:', appError.toHTTP());
    console.log(`  Severity: ${ErrorHandler.getSeverity(appError)}`);
    console.log(`  Operational: ${ErrorHandler.isOperational(appError)}`);
  }

  // Async error wrapper
  const riskyOperation = asyncHandler(async () => {
    throw new Error('Something went wrong');
  });

  try {
    await riskyOperation();
  } catch (error) {
    console.log('  Wrapped Error:', (error as AppError).code);
  }

  console.log();
  console.log('=' .repeat(60));
  console.log();

  // ==========================================
  // Example 4: Data Validation
  // ==========================================
  console.log('Example 4: Data Validation with Zod\n');

  // Define schema
  const userSchema = z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    age: commonSchemas.positiveInt,
    website: commonSchemas.url.optional(),
  });

  // Valid data
  try {
    const validUser = Validator.validate(userSchema, {
      email: 'user@example.com',
      password: 'SecurePass123',
      age: 25,
      website: 'https://example.com',
    });
    console.log('✅ Valid user:', validUser);
  } catch (error) {
    console.log('❌ Validation failed:', error);
  }

  // Invalid data
  try {
    const invalidUser = Validator.validate(userSchema, {
      email: 'invalid-email',
      password: 'short',
      age: -5,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('❌ Invalid user:', error.metadata.fields);
    }
  }

  // Safe validation (no throw)
  const result = Validator.safeValidate(userSchema, {
    email: 'test@example.com',
    password: '12345', // Too short
    age: 30,
  });

  if (result.success) {
    console.log('✅ Validation passed');
  } else {
    console.log('❌ Validation errors:', result.errors);
  }

  console.log();
  console.log('=' .repeat(60));
  console.log();

  // ==========================================
  // Example 5: Health Checks
  // ==========================================
  console.log('Example 5: Health Check System\n');

  const healthManager = new HealthCheckManager('1.0.0');

  // Register health checks
  healthManager.registerMany({
    memory: commonHealthChecks.memory,
    cpu: commonHealthChecks.cpu,

    // Custom health check
    cache: async () => {
      return {
        status: HealthStatus.HEALTHY,
        message: 'Cache operational',
        lastCheck: Date.now(),
        metadata: {
          entries: 1250,
          hitRate: 0.87,
        },
      };
    },

    // Database check (simulated)
    database: async () => {
      const isConnected = Math.random() > 0.1; // 90% success rate

      return {
        status: isConnected ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
        message: isConnected ? 'Database connected' : 'Database unavailable',
        lastCheck: Date.now(),
        metadata: {
          connections: 5,
          maxConnections: 10,
        },
      };
    },
  });

  // Run health checks
  const healthReport = await healthManager.check();

  console.log('Health Report:');
  console.log(`  Overall Status: ${healthReport.status}`);
  console.log(`  Uptime: ${Math.round(healthReport.uptime / 1000)}s`);
  console.log(`  Version: ${healthReport.version}`);
  console.log();
  console.log('  Components:');

  for (const [name, health] of Object.entries(healthReport.components)) {
    const statusIcon =
      health.status === HealthStatus.HEALTHY ? '✅' :
      health.status === HealthStatus.DEGRADED ? '⚠️' : '❌';

    console.log(`    ${statusIcon} ${name}: ${health.status} (${health.responseTime}ms)`);
    if (health.message) {
      console.log(`       ${health.message}`);
    }
  }

  console.log();
  console.log('=' .repeat(60));
  console.log();

  // ==========================================
  // Example 6: Metrics Collection
  // ==========================================
  console.log('Example 6: Metrics Collection\n');

  // Counter metrics
  metrics.increment('api_requests_total', 1, { method: 'GET', endpoint: '/users' });
  metrics.increment('api_requests_total', 1, { method: 'POST', endpoint: '/users' });
  metrics.increment('api_requests_total', 3, { method: 'GET', endpoint: '/users' });

  // Gauge metrics
  metrics.setGauge('active_connections', 42);
  metrics.gauge('queue_size').set(150);
  metrics.gauge('queue_size').inc(10);

  // Histogram metrics
  for (let i = 0; i < 50; i++) {
    metrics.record('response_time_ms', Math.random() * 500);
  }

  // Timer metrics
  const timer = metrics.timer('operation_duration');
  const stop = timer.start();
  await new Promise((resolve) => setTimeout(resolve, 50));
  stop();

  // Track async execution
  await metrics.timeExecution('async_operation', async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  // Get all metrics
  const allMetrics = metrics.getAllMetrics();

  console.log('Metrics Summary:');
  console.log(`  Total metrics: ${allMetrics.length}`);
  console.log();

  const summary = metrics.getSummary();
  console.log('  By Type:');
  console.log(`    Counters: ${summary.counters}`);
  console.log(`    Gauges: ${summary.gauges}`);
  console.log(`    Histograms: ${summary.histograms}`);
  console.log(`    Timers: ${summary.timers}`);
  console.log();

  console.log('  Sample Metrics:');
  for (const metric of allMetrics.slice(0, 5)) {
    const tagsStr = metric.tags ? ` {${Object.entries(metric.tags).map(([k, v]) => `${k}=${v}`).join(', ')}}` : '';
    console.log(`    ${metric.name}${tagsStr}: ${metric.value} (${metric.type})`);
  }

  // Common metrics examples
  commonMetrics.httpRequest('GET', '/api/users', 200, 45);
  commonMetrics.dbQuery('SELECT', 'users', 12);
  commonMetrics.apiCall('openai', '/v1/completions', true, 350);
  commonMetrics.error('ValidationError', 'low');

  console.log();
  console.log('  Common Metrics logged');
  console.log();

  console.log('=' .repeat(60));
  console.log();

  // ==========================================
  // Final Summary
  // ==========================================
  console.log('📊 Summary\n');

  console.log('✅ Configuration: Loaded and validated');
  console.log('✅ Logging: Structured logging with winston');
  console.log('✅ Errors: Standardized error handling');
  console.log('✅ Validation: Zod schemas for data validation');
  console.log('✅ Health Checks: System health monitoring');
  console.log('✅ Metrics: Performance metrics collection');
  console.log();

  console.log('🎉 All examples complete!\n');
}

// Run example
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export { main as runCommonExample };
