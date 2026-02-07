/**
 * Common - Metrics Collector
 *
 * Collect and track performance metrics
 */

/**
 * Metric type
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer',
}

/**
 * Metric data
 */
export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

/**
 * Counter metric (increments only)
 */
export class Counter {
  private value: number = 0;

  constructor(
    private name: string,
    private tags: Record<string, string> = {}
  ) {}

  /**
   * Increment counter
   */
  inc(amount: number = 1): void {
    this.value += amount;
  }

  /**
   * Get current value
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Reset counter
   */
  reset(): void {
    this.value = 0;
  }

  /**
   * Convert to metric
   */
  toMetric(): Metric {
    return {
      name: this.name,
      type: MetricType.COUNTER,
      value: this.value,
      timestamp: Date.now(),
      tags: this.tags,
    };
  }
}

/**
 * Gauge metric (can go up and down)
 */
export class Gauge {
  private value: number = 0;

  constructor(
    private name: string,
    private tags: Record<string, string> = {}
  ) {}

  /**
   * Set gauge value
   */
  set(value: number): void {
    this.value = value;
  }

  /**
   * Increment gauge
   */
  inc(amount: number = 1): void {
    this.value += amount;
  }

  /**
   * Decrement gauge
   */
  dec(amount: number = 1): void {
    this.value -= amount;
  }

  /**
   * Get current value
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Convert to metric
   */
  toMetric(): Metric {
    return {
      name: this.name,
      type: MetricType.GAUGE,
      value: this.value,
      timestamp: Date.now(),
      tags: this.tags,
    };
  }
}

/**
 * Histogram metric (track distribution)
 */
export class Histogram {
  private values: number[] = [];
  private buckets: number[] = [];

  constructor(
    private name: string,
    private tags: Record<string, string> = {},
    buckets: number[] = [10, 50, 100, 500, 1000, 5000]
  ) {
    this.buckets = buckets.sort((a, b) => a - b);
  }

  /**
   * Observe value
   */
  observe(value: number): void {
    this.values.push(value);

    // Keep only last 1000 values
    if (this.values.length > 1000) {
      this.values.shift();
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    count: number;
    sum: number;
    min: number;
    max: number;
    mean: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    if (this.values.length === 0) {
      return {
        count: 0,
        sum: 0,
        min: 0,
        max: 0,
        mean: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }

    const sorted = [...this.values].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      count,
      sum,
      min: sorted[0],
      max: sorted[count - 1],
      mean: sum / count,
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
    };
  }

  /**
   * Get bucket distribution
   */
  getBuckets(): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const bucket of this.buckets) {
      const count = this.values.filter((v) => v <= bucket).length;
      distribution[`<= ${bucket}`] = count;
    }

    distribution[`> ${this.buckets[this.buckets.length - 1]}`] =
      this.values.filter((v) => v > this.buckets[this.buckets.length - 1]).length;

    return distribution;
  }

  /**
   * Convert to metric
   */
  toMetric(): Metric {
    const stats = this.getStats();

    return {
      name: this.name,
      type: MetricType.HISTOGRAM,
      value: stats.mean,
      timestamp: Date.now(),
      tags: {
        ...this.tags,
        count: stats.count.toString(),
        p50: stats.p50.toString(),
        p95: stats.p95.toString(),
        p99: stats.p99.toString(),
      },
    };
  }

  /**
   * Reset histogram
   */
  reset(): void {
    this.values = [];
  }
}

/**
 * Timer metric (track duration)
 */
export class Timer {
  private histogram: Histogram;

  constructor(
    name: string,
    tags: Record<string, string> = {}
  ) {
    this.histogram = new Histogram(`${name}_duration`, tags);
  }

  /**
   * Start timer
   */
  start(): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.histogram.observe(duration);
    };
  }

  /**
   * Time async function
   */
  async time<T>(fn: () => Promise<T>): Promise<T> {
    const stop = this.start();
    try {
      return await fn();
    } finally {
      stop();
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return this.histogram.getStats();
  }

  /**
   * Convert to metric
   */
  toMetric(): Metric {
    return this.histogram.toMetric();
  }

  /**
   * Reset timer
   */
  reset(): void {
    this.histogram.reset();
  }
}

/**
 * Metrics collector
 */
export class MetricsCollector {
  private counters: Map<string, Counter> = new Map();
  private gauges: Map<string, Gauge> = new Map();
  private histograms: Map<string, Histogram> = new Map();
  private timers: Map<string, Timer> = new Map();

  /**
   * Get or create counter
   */
  counter(name: string, tags: Record<string, string> = {}): Counter {
    const key = this.getKey(name, tags);
    let counter = this.counters.get(key);

    if (!counter) {
      counter = new Counter(name, tags);
      this.counters.set(key, counter);
    }

    return counter;
  }

  /**
   * Get or create gauge
   */
  gauge(name: string, tags: Record<string, string> = {}): Gauge {
    const key = this.getKey(name, tags);
    let gauge = this.gauges.get(key);

    if (!gauge) {
      gauge = new Gauge(name, tags);
      this.gauges.set(key, gauge);
    }

    return gauge;
  }

  /**
   * Get or create histogram
   */
  histogram(
    name: string,
    tags: Record<string, string> = {},
    buckets?: number[]
  ): Histogram {
    const key = this.getKey(name, tags);
    let histogram = this.histograms.get(key);

    if (!histogram) {
      histogram = new Histogram(name, tags, buckets);
      this.histograms.set(key, histogram);
    }

    return histogram;
  }

  /**
   * Get or create timer
   */
  timer(name: string, tags: Record<string, string> = {}): Timer {
    const key = this.getKey(name, tags);
    let timer = this.timers.get(key);

    if (!timer) {
      timer = new Timer(name, tags);
      this.timers.set(key, timer);
    }

    return timer;
  }

  /**
   * Increment counter
   */
  increment(name: string, amount: number = 1, tags: Record<string, string> = {}): void {
    this.counter(name, tags).inc(amount);
  }

  /**
   * Set gauge value
   */
  setGauge(name: string, value: number, tags: Record<string, string> = {}): void {
    this.gauge(name, tags).set(value);
  }

  /**
   * Record histogram value
   */
  record(name: string, value: number, tags: Record<string, string> = {}): void {
    this.histogram(name, tags).observe(value);
  }

  /**
   * Time function execution
   */
  async timeExecution<T>(
    name: string,
    fn: () => Promise<T>,
    tags: Record<string, string> = {}
  ): Promise<T> {
    return this.timer(name, tags).time(fn);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Metric[] {
    const metrics: Metric[] = [];

    for (const counter of this.counters.values()) {
      metrics.push(counter.toMetric());
    }

    for (const gauge of this.gauges.values()) {
      metrics.push(gauge.toMetric());
    }

    for (const histogram of this.histograms.values()) {
      metrics.push(histogram.toMetric());
    }

    for (const timer of this.timers.values()) {
      metrics.push(timer.toMetric());
    }

    return metrics;
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): Metric[] {
    return this.getAllMetrics().filter((m) => m.name === name);
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: MetricType): Metric[] {
    return this.getAllMetrics().filter((m) => m.type === type);
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    for (const counter of this.counters.values()) {
      counter.reset();
    }

    for (const histogram of this.histograms.values()) {
      histogram.reset();
    }

    for (const timer of this.timers.values()) {
      timer.reset();
    }
  }

  /**
   * Get summary
   */
  getSummary(): {
    counters: number;
    gauges: number;
    histograms: number;
    timers: number;
    total: number;
  } {
    return {
      counters: this.counters.size,
      gauges: this.gauges.size,
      histograms: this.histograms.size,
      timers: this.timers.size,
      total:
        this.counters.size +
        this.gauges.size +
        this.histograms.size +
        this.timers.size,
    };
  }

  /**
   * Generate unique key for metric with tags
   */
  private getKey(name: string, tags: Record<string, string>): string {
    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');

    return tagString ? `${name}{${tagString}}` : name;
  }
}

// Export singleton instance
export const metrics = new MetricsCollector();

/**
 * Common metrics
 */
export const commonMetrics = {
  /**
   * HTTP request metrics
   */
  httpRequest: (method: string, path: string, statusCode: number, duration: number) => {
    metrics.increment('http_requests_total', 1, {
      method,
      path,
      status: statusCode.toString(),
    });

    metrics.record('http_request_duration_ms', duration, {
      method,
      path,
    });
  },

  /**
   * Database query metrics
   */
  dbQuery: (operation: string, table: string, duration: number) => {
    metrics.increment('db_queries_total', 1, {
      operation,
      table,
    });

    metrics.record('db_query_duration_ms', duration, {
      operation,
      table,
    });
  },

  /**
   * API call metrics
   */
  apiCall: (service: string, endpoint: string, success: boolean, duration: number) => {
    metrics.increment('api_calls_total', 1, {
      service,
      endpoint,
      success: success.toString(),
    });

    metrics.record('api_call_duration_ms', duration, {
      service,
      endpoint,
    });
  },

  /**
   * Error metrics
   */
  error: (type: string, severity: string) => {
    metrics.increment('errors_total', 1, {
      type,
      severity,
    });
  },
};
