export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timer';

export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

export interface Counter {
  name: string;
  value: number;
  labels?: Record<string, string>;
}

export interface Gauge {
  name: string;
  value: number;
  labels?: Record<string, string>;
}

export interface Histogram {
  name: string;
  count: number;
  sum: number;
  min: number;
  max: number;
  buckets: Record<number, number>;
  labels?: Record<string, string>;
}

export class MetricsCollector {
  private counters: Map<string, Counter> = new Map();
  private gauges: Map<string, Gauge> = new Map();
  private histograms: Map<string, Histogram> = new Map();
  private timers: Map<string, number> = new Map();

  private getKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels).sort().map(([k, v]) => `${k}:${v}`).join(',');
    return `${name}{${labelStr}}`;
  }

  incCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    const existing = this.counters.get(key);
    if (existing) {
      existing.value += value;
    } else {
      this.counters.set(key, { name, value, labels });
    }
  }

  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    this.gauges.set(key, { name, value, labels });
  }

  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    const existing = this.histograms.get(key);
    if (existing) {
      existing.count++;
      existing.sum += value;
      existing.min = Math.min(existing.min, value);
      existing.max = Math.max(existing.max, value);
      this.updateHistogramBuckets(existing, value);
    } else {
      const buckets: Record<number, number> = {};
      this.getDefaultBuckets().forEach(b => buckets[b] = 0);
      this.histograms.set(key, {
        name,
        count: 1,
        sum: value,
        min: value,
        max: value,
        buckets,
        labels,
      });
      this.updateHistogramBuckets(this.histograms.get(key)!, value);
    }
  }

  private updateHistogramBuckets(histogram: Histogram, value: number): void {
    for (const bucketStr of Object.keys(histogram.buckets)) {
      const threshold = parseFloat(bucketStr);
      if (value <= threshold) {
        histogram.buckets[threshold]++;
      }
    }
  }

  private getDefaultBuckets(): number[] {
    return [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
  }

  startTimer(name: string, labels?: Record<string, string>): () => void {
    const key = this.getKey(name, labels);
    this.timers.set(key, Date.now());
    return () => {
      const startTime = this.timers.get(key);
      if (startTime !== undefined) {
        const duration = Date.now() - startTime;
        this.recordHistogram(`${name}_duration`, duration, labels);
        this.timers.delete(key);
      }
    };
  }

  getCounter(name: string, labels?: Record<string, string>): Counter | undefined {
    return this.counters.get(this.getKey(name, labels));
  }

  getGauge(name: string, labels?: Record<string, string>): Gauge | undefined {
    return this.gauges.get(this.getKey(name, labels));
  }

  getHistogram(name: string, labels?: Record<string, string>): Histogram | undefined {
    return this.histograms.get(this.getKey(name, labels));
  }

  getAllMetrics(): Metric[] {
    const metrics: Metric[] = [];

    this.counters.forEach(counter => {
      metrics.push({
        name: counter.name,
        type: 'counter',
        value: counter.value,
        timestamp: new Date(),
        labels: counter.labels,
      });
    });

    this.gauges.forEach(gauge => {
      metrics.push({
        name: gauge.name,
        type: 'gauge',
        value: gauge.value,
        timestamp: new Date(),
        labels: gauge.labels,
      });
    });

    this.histograms.forEach(histogram => {
      metrics.push({
        name: histogram.name,
        type: 'histogram',
        value: histogram.sum / histogram.count,
        timestamp: new Date(),
        labels: histogram.labels,
      });
    });

    return metrics;
  }

  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.timers.clear();
  }

  toPrometheusFormat(): string {
    let output = '';
    const now = Date.now() / 1000;

    this.counters.forEach(counter => {
      const labels = this.formatLabels(counter.labels);
      output += `# TYPE ${counter.name} counter\n`;
      output += `${counter.name}${labels} ${counter.value} ${now}\n`;
    });

    this.gauges.forEach(gauge => {
      const labels = this.formatLabels(gauge.labels);
      output += `# TYPE ${gauge.name} gauge\n`;
      output += `${gauge.name}${labels} ${gauge.value} ${now}\n`;
    });

    this.histograms.forEach(histogram => {
      const labels = this.formatLabels(histogram.labels);
      output += `# TYPE ${histogram.name} histogram\n`;
      for (const [bucket, count] of Object.entries(histogram.buckets)) {
        output += `${histogram.name}_bucket{le="${bucket}"${labels}} ${count} ${now}\n`;
      }
      output += `${histogram.name}_bucket{le="+Inf"${labels}} ${histogram.count} ${now}\n`;
      output += `${histogram.name}_sum${labels} ${histogram.sum} ${now}\n`;
      output += `${histogram.name}_count${labels} ${histogram.count} ${now}\n`;
    });

    return output;
  }

  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) return '';
    return `{${Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`;
  }
}

let metricsInstance: MetricsCollector | null = null;

export function getMetrics(): MetricsCollector {
  if (!metricsInstance) {
    metricsInstance = new MetricsCollector();
  }
  return metricsInstance;
}

export function resetMetrics(): void {
  if (metricsInstance) {
    metricsInstance.reset();
  }
  metricsInstance = null;
}
