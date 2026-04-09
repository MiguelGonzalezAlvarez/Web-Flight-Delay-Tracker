import { MetricsCollector, getMetrics, resetMetrics } from '@/src/lib/metrics';

describe('MetricsCollector', () => {
  let metrics: MetricsCollector;

  beforeEach(() => {
    resetMetrics();
    metrics = new MetricsCollector();
  });

  describe('counters', () => {
    it('should increment counter', () => {
      metrics.incCounter('requests');
      expect(metrics.getCounter('requests')?.value).toBe(1);
    });

    it('should increment counter by value', () => {
      metrics.incCounter('requests', 5);
      expect(metrics.getCounter('requests')?.value).toBe(5);
    });

    it('should increment existing counter', () => {
      metrics.incCounter('requests');
      metrics.incCounter('requests');
      expect(metrics.getCounter('requests')?.value).toBe(2);
    });

    it('should track labeled counters separately', () => {
      metrics.incCounter('requests', 1, { method: 'GET' });
      metrics.incCounter('requests', 1, { method: 'POST' });
      expect(metrics.getCounter('requests', { method: 'GET' })?.value).toBe(1);
      expect(metrics.getCounter('requests', { method: 'POST' })?.value).toBe(1);
    });
  });

  describe('gauges', () => {
    it('should set gauge value', () => {
      metrics.setGauge('memory_usage', 75.5);
      expect(metrics.getGauge('memory_usage')?.value).toBe(75.5);
    });

    it('should update gauge value', () => {
      metrics.setGauge('memory_usage', 75);
      metrics.setGauge('memory_usage', 80);
      expect(metrics.getGauge('memory_usage')?.value).toBe(80);
    });

    it('should track labeled gauges separately', () => {
      metrics.setGauge('memory_usage', 75, { server: 'primary' });
      metrics.setGauge('memory_usage', 60, { server: 'secondary' });
      expect(metrics.getGauge('memory_usage', { server: 'primary' })?.value).toBe(75);
      expect(metrics.getGauge('memory_usage', { server: 'secondary' })?.value).toBe(60);
    });
  });

  describe('histograms', () => {
    it('should record histogram values', () => {
      metrics.recordHistogram('request_duration', 100);
      const histogram = metrics.getHistogram('request_duration');
      expect(histogram?.count).toBe(1);
      expect(histogram?.sum).toBe(100);
      expect(histogram?.min).toBe(100);
      expect(histogram?.max).toBe(100);
    });

    it('should calculate correct statistics', () => {
      metrics.recordHistogram('request_duration', 50);
      metrics.recordHistogram('request_duration', 100);
      metrics.recordHistogram('request_duration', 150);
      const histogram = metrics.getHistogram('request_duration');
      expect(histogram?.count).toBe(3);
      expect(histogram?.sum).toBe(300);
      expect(histogram?.min).toBe(50);
      expect(histogram?.max).toBe(150);
    });

    it('should track histogram buckets', () => {
      metrics.recordHistogram('latency', 0.005);
      metrics.recordHistogram('latency', 0.01);
      metrics.recordHistogram('latency', 0.02);
      const histogram = metrics.getHistogram('latency');
      expect(histogram?.buckets['0.005']).toBe(1);
      expect(histogram?.buckets['0.01']).toBe(2);
      expect(histogram?.buckets['0.025']).toBe(3);
    });
  });

  describe('timers', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should measure duration', () => {
      const endTimer = metrics.startTimer('operation');
      jest.advanceTimersByTime(100);
      endTimer();
      const histogram = metrics.getHistogram('operation_duration');
      expect(histogram?.count).toBe(1);
    });
  });

  describe('getAllMetrics', () => {
    it('should return all metrics', () => {
      metrics.incCounter('requests');
      metrics.setGauge('memory', 50);
      metrics.recordHistogram('latency', 100);

      const allMetrics = metrics.getAllMetrics();
      expect(allMetrics.length).toBe(3);
      expect(allMetrics.some(m => m.name === 'requests')).toBe(true);
      expect(allMetrics.some(m => m.name === 'memory')).toBe(true);
      expect(allMetrics.some(m => m.name === 'latency')).toBe(true);
    });
  });

  describe('toPrometheusFormat', () => {
    it('should format counters correctly', () => {
      metrics.incCounter('http_requests_total', 42);
      const output = metrics.toPrometheusFormat();
      expect(output).toContain('# TYPE http_requests_total counter');
      expect(output).toContain('http_requests_total 42');
    });

    it('should format gauges correctly', () => {
      metrics.setGauge('process_memory_bytes', 1024000);
      const output = metrics.toPrometheusFormat();
      expect(output).toContain('# TYPE process_memory_bytes gauge');
      expect(output).toContain('process_memory_bytes 1024000');
    });

    it('should format histograms correctly', () => {
      metrics.recordHistogram('request_duration_seconds', 0.5);
      const output = metrics.toPrometheusFormat();
      expect(output).toContain('# TYPE request_duration_seconds histogram');
      expect(output).toContain('request_duration_seconds_bucket');
      expect(output).toContain('request_duration_seconds_sum');
      expect(output).toContain('request_duration_seconds_count');
    });

    it('should format labeled metrics correctly', () => {
      metrics.incCounter('requests', 10, { method: 'GET', status: '200' });
      const output = metrics.toPrometheusFormat();
      expect(output).toContain('method="GET"');
      expect(output).toContain('status="200"');
    });
  });

  describe('reset', () => {
    it('should clear all metrics', () => {
      metrics.incCounter('requests');
      metrics.setGauge('memory', 50);
      metrics.recordHistogram('latency', 100);

      metrics.reset();

      expect(metrics.getCounter('requests')).toBeUndefined();
      expect(metrics.getGauge('memory')).toBeUndefined();
      expect(metrics.getHistogram('latency')).toBeUndefined();
    });
  });

  describe('getMetrics singleton', () => {
    it('should return same instance', () => {
      const m1 = getMetrics();
      const m2 = getMetrics();
      expect(m1).toBe(m2);
    });

    it('should reset singleton', () => {
      getMetrics().incCounter('test');
      resetMetrics();
      const fresh = getMetrics();
      expect(fresh.getCounter('test')).toBeUndefined();
    });
  });
});
