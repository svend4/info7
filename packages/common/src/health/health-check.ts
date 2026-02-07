/**
 * Common - Health Check System
 *
 * Monitor system health and component status
 */

/**
 * Health status
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

/**
 * Component health
 */
export interface ComponentHealth {
  status: HealthStatus;
  message?: string;
  lastCheck: number;
  responseTime?: number;
  metadata?: Record<string, any>;
}

/**
 * Overall health report
 */
export interface HealthReport {
  status: HealthStatus;
  timestamp: number;
  uptime: number;
  version?: string;
  components: Record<string, ComponentHealth>;
  metadata?: Record<string, any>;
}

/**
 * Health check function
 */
export type HealthCheckFunction = () => Promise<ComponentHealth>;

/**
 * Health check manager
 */
export class HealthCheckManager {
  private checks: Map<string, HealthCheckFunction> = new Map();
  private results: Map<string, ComponentHealth> = new Map();
  private startTime: number = Date.now();
  private version?: string;

  constructor(version?: string) {
    this.version = version;
  }

  /**
   * Register health check
   */
  register(name: string, check: HealthCheckFunction): void {
    this.checks.set(name, check);
  }

  /**
   * Register multiple checks
   */
  registerMany(checks: Record<string, HealthCheckFunction>): void {
    for (const [name, check] of Object.entries(checks)) {
      this.register(name, check);
    }
  }

  /**
   * Unregister health check
   */
  unregister(name: string): void {
    this.checks.delete(name);
    this.results.delete(name);
  }

  /**
   * Run all health checks
   */
  async check(): Promise<HealthReport> {
    const components: Record<string, ComponentHealth> = {};

    // Run all checks in parallel
    const checkPromises = Array.from(this.checks.entries()).map(
      async ([name, check]) => {
        try {
          const startTime = Date.now();
          const result = await Promise.race([
            check(),
            this.timeout(5000), // 5 second timeout
          ]);
          const responseTime = Date.now() - startTime;

          const health: ComponentHealth = {
            ...result,
            responseTime,
            lastCheck: Date.now(),
          };

          this.results.set(name, health);
          components[name] = health;
        } catch (error) {
          const health: ComponentHealth = {
            status: HealthStatus.UNHEALTHY,
            message: error instanceof Error ? error.message : 'Health check failed',
            lastCheck: Date.now(),
          };

          this.results.set(name, health);
          components[name] = health;
        }
      }
    );

    await Promise.all(checkPromises);

    // Determine overall status
    const statuses = Object.values(components).map((c) => c.status);
    const overallStatus = this.determineOverallStatus(statuses);

    return {
      status: overallStatus,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      version: this.version,
      components,
    };
  }

  /**
   * Get cached results (no new checks)
   */
  getCached(): HealthReport {
    const components: Record<string, ComponentHealth> = {};

    for (const [name, health] of this.results.entries()) {
      components[name] = health;
    }

    const statuses = Object.values(components).map((c) => c.status);
    const overallStatus = this.determineOverallStatus(statuses);

    return {
      status: overallStatus,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      version: this.version,
      components,
    };
  }

  /**
   * Check specific component
   */
  async checkComponent(name: string): Promise<ComponentHealth> {
    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Health check '${name}' not found`);
    }

    try {
      const startTime = Date.now();
      const result = await check();
      const responseTime = Date.now() - startTime;

      const health: ComponentHealth = {
        ...result,
        responseTime,
        lastCheck: Date.now(),
      };

      this.results.set(name, health);
      return health;
    } catch (error) {
      const health: ComponentHealth = {
        status: HealthStatus.UNHEALTHY,
        message: error instanceof Error ? error.message : 'Health check failed',
        lastCheck: Date.now(),
      };

      this.results.set(name, health);
      return health;
    }
  }

  /**
   * Determine overall status from component statuses
   */
  private determineOverallStatus(statuses: HealthStatus[]): HealthStatus {
    if (statuses.length === 0) {
      return HealthStatus.HEALTHY;
    }

    if (statuses.some((s) => s === HealthStatus.UNHEALTHY)) {
      return HealthStatus.UNHEALTHY;
    }

    if (statuses.some((s) => s === HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }

  /**
   * Timeout helper
   */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), ms);
    });
  }

  /**
   * Start periodic health checks
   */
  startPeriodicChecks(intervalMs: number = 60000): () => void {
    const interval = setInterval(() => {
      this.check().catch(console.error);
    }, intervalMs);

    return () => clearInterval(interval);
  }
}

/**
 * Common health checks
 */
export const commonHealthChecks = {
  /**
   * Memory check
   */
  memory: (): Promise<ComponentHealth> => {
    return Promise.resolve({
      status: HealthStatus.HEALTHY,
      lastCheck: Date.now(),
      metadata: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    });
  },

  /**
   * CPU check
   */
  cpu: (): Promise<ComponentHealth> => {
    const usage = process.cpuUsage();
    const uptime = process.uptime();

    return Promise.resolve({
      status: HealthStatus.HEALTHY,
      lastCheck: Date.now(),
      metadata: {
        user: Math.round(usage.user / 1000),
        system: Math.round(usage.system / 1000),
        uptime: Math.round(uptime),
      },
    });
  },

  /**
   * Database check (example template)
   */
  database: (checkConnection: () => Promise<boolean>): HealthCheckFunction => {
    return async () => {
      try {
        const isConnected = await checkConnection();

        return {
          status: isConnected ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
          message: isConnected ? 'Database connected' : 'Database disconnected',
          lastCheck: Date.now(),
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'Database error',
          lastCheck: Date.now(),
        };
      }
    };
  },

  /**
   * Redis check (example template)
   */
  redis: (ping: () => Promise<string>): HealthCheckFunction => {
    return async () => {
      try {
        const result = await ping();

        return {
          status: result === 'PONG' ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
          message: result === 'PONG' ? 'Redis connected' : 'Redis degraded',
          lastCheck: Date.now(),
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'Redis error',
          lastCheck: Date.now(),
        };
      }
    };
  },

  /**
   * External API check (example template)
   */
  externalAPI: (
    name: string,
    checkEndpoint: () => Promise<boolean>
  ): HealthCheckFunction => {
    return async () => {
      try {
        const isAvailable = await checkEndpoint();

        return {
          status: isAvailable ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
          message: isAvailable
            ? `${name} API available`
            : `${name} API unavailable`,
          lastCheck: Date.now(),
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : `${name} API error`,
          lastCheck: Date.now(),
        };
      }
    };
  },

  /**
   * Disk space check
   */
  diskSpace: async (): Promise<ComponentHealth> => {
    // This would require a library like 'check-disk-space' in production
    return {
      status: HealthStatus.HEALTHY,
      message: 'Disk space OK',
      lastCheck: Date.now(),
      metadata: {
        // Example data
        free: 50000, // MB
        size: 100000, // MB
        used: 50000, // MB
      },
    };
  },
};

/**
 * Create health check manager with common checks
 */
export function createHealthCheckManager(version?: string): HealthCheckManager {
  const manager = new HealthCheckManager(version);

  // Register common checks
  manager.register('memory', commonHealthChecks.memory);
  manager.register('cpu', commonHealthChecks.cpu);

  return manager;
}
