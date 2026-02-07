/**
 * OpenClaw Sandbox - Resource Monitor
 * Monitors and enforces resource limits during skill execution
 */

import {
  ResourceLimits,
  ResourceMetrics,
  ResourceLimitError
} from './types.js';

/**
 * Resource monitor tracks and enforces resource usage limits
 */
export class ResourceMonitor {
  private startTime: number = 0;
  private startMemory: number = 0;
  private startCpuUsage: NodeJS.CpuUsage | null = null;
  private apiCallCounts: Map<string, number> = new Map();
  private isMonitoring: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(private limits: ResourceLimits) {}

  /**
   * Start monitoring resource usage
   */
  start(): void {
    this.isMonitoring = true;
    this.startTime = Date.now();
    this.startMemory = process.memoryUsage().heapUsed;
    this.startCpuUsage = process.cpuUsage();
    this.apiCallCounts.clear();

    // Periodic check for resource limits
    this.checkInterval = setInterval(() => {
      this.checkLimits();
    }, 100); // Check every 100ms
  }

  /**
   * Stop monitoring and return metrics
   */
  stop(): ResourceMetrics {
    this.isMonitoring = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;
    const endCpuUsage = process.cpuUsage(this.startCpuUsage || undefined);

    const executionTime = endTime - this.startTime;
    const memoryUsed = Math.max(0, endMemory - this.startMemory);
    const cpuTime = (endCpuUsage.user + endCpuUsage.system) / 1000; // Convert to ms

    return {
      executionTime,
      memoryUsed,
      cpuTime,
      apiCalls: {
        http: this.apiCallCounts.get('http') || 0,
        console: this.apiCallCounts.get('console') || 0,
        total: Array.from(this.apiCallCounts.values()).reduce((a, b) => a + b, 0)
      },
      startedAt: new Date(this.startTime),
      endedAt: new Date(endTime)
    };
  }

  /**
   * Check if resource limits are exceeded
   */
  private checkLimits(): void {
    if (!this.isMonitoring) return;

    // Check timeout
    const elapsed = Date.now() - this.startTime;
    if (elapsed > this.limits.timeout) {
      throw new ResourceLimitError(
        `Execution timeout exceeded: ${elapsed}ms > ${this.limits.timeout}ms`,
        'timeout',
        this.limits.timeout,
        elapsed
      );
    }

    // Check memory
    const memoryUsed = process.memoryUsage().heapUsed - this.startMemory;
    if (memoryUsed > this.limits.maxMemory) {
      throw new ResourceLimitError(
        `Memory limit exceeded: ${memoryUsed} bytes > ${this.limits.maxMemory} bytes`,
        'memory',
        this.limits.maxMemory,
        memoryUsed
      );
    }

    // Check CPU time
    if (this.startCpuUsage) {
      const cpuUsage = process.cpuUsage(this.startCpuUsage);
      const cpuTime = (cpuUsage.user + cpuUsage.system) / 1000;
      if (cpuTime > this.limits.maxCpuTime) {
        throw new ResourceLimitError(
          `CPU time limit exceeded: ${cpuTime}ms > ${this.limits.maxCpuTime}ms`,
          'cpu',
          this.limits.maxCpuTime,
          cpuTime
        );
      }
    }
  }

  /**
   * Record an API call and check rate limits
   */
  recordApiCall(apiType: string, maxCalls: number): void {
    if (!this.isMonitoring) return;

    const currentCount = this.apiCallCounts.get(apiType) || 0;
    const newCount = currentCount + 1;

    if (newCount > maxCalls) {
      throw new ResourceLimitError(
        `API call limit exceeded for ${apiType}: ${newCount} > ${maxCalls}`,
        `api_${apiType}`,
        maxCalls,
        newCount
      );
    }

    this.apiCallCounts.set(apiType, newCount);
  }

  /**
   * Get current API call count for a specific type
   */
  getApiCallCount(apiType: string): number {
    return this.apiCallCounts.get(apiType) || 0;
  }

  /**
   * Check if currently monitoring
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get elapsed time since start
   */
  getElapsedTime(): number {
    if (!this.isMonitoring) return 0;
    return Date.now() - this.startTime;
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage(): number {
    if (!this.isMonitoring) return 0;
    return Math.max(0, process.memoryUsage().heapUsed - this.startMemory);
  }
}
