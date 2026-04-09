import { DelayAnalyzer } from '@/src/domain/services/DelayAnalyzer';
import { InMemoryDelayPredictionRepository } from '@/src/infrastructure/persistence/InMemoryDelayPredictionRepository';
import { DelayPrediction } from '@/src/domain/entities/DelayPrediction';

describe('DelayAnalyzer', () => {
  let repository: InMemoryDelayPredictionRepository;
  let analyzer: DelayAnalyzer;

  beforeEach(() => {
    repository = new InMemoryDelayPredictionRepository();
    analyzer = new DelayAnalyzer(repository);
  });

  describe('calculateOnTimeRate', () => {
    it('should calculate correct on-time rate', () => {
      const predictions = [
        DelayPrediction.fromPercentage(15, 10, 20),
        DelayPrediction.fromPercentage(10, 5, 15),
        DelayPrediction.fromPercentage(60, 45, 25),
      ];

      const rate = analyzer.calculateOnTimeRate(predictions);

      expect(rate).toBe(67);
    });

    it('should return 0 for empty array', () => {
      const rate = analyzer.calculateOnTimeRate([]);

      expect(rate).toBe(0);
    });

    it('should return 100 for all low risk', () => {
      const predictions = [
        DelayPrediction.fromPercentage(10, 5, 20),
        DelayPrediction.fromPercentage(15, 8, 15),
      ];

      const rate = analyzer.calculateOnTimeRate(predictions);

      expect(rate).toBe(100);
    });
  });

  describe('getReliabilityScore', () => {
    it('should calculate correct reliability score', () => {
      const predictions = [
        DelayPrediction.fromPercentage(30, 20, 15),
        DelayPrediction.fromPercentage(40, 30, 25),
        DelayPrediction.fromPercentage(50, 40, 5),
        DelayPrediction.fromPercentage(60, 50, 8),
      ];

      const score = analyzer.getReliabilityScore(predictions);

      expect(score).toBe(50);
    });

    it('should return 0 for empty array', () => {
      const score = analyzer.getReliabilityScore([]);

      expect(score).toBe(0);
    });
  });

  describe('aggregateDelayStatistics', () => {
    it('should aggregate statistics correctly', () => {
      const predictions = [
        DelayPrediction.createUnsafe({ percentage: 15, riskLevel: 'low', avgDelayMinutes: 10, basedOnRecords: 20 }),
        DelayPrediction.createUnsafe({ percentage: 65, riskLevel: 'medium', avgDelayMinutes: 90, basedOnRecords: 30 }),
        DelayPrediction.createUnsafe({ percentage: 85, riskLevel: 'high', avgDelayMinutes: 120, basedOnRecords: 50 }),
      ];

      const stats = analyzer.aggregateDelayStatistics(predictions);

      expect(stats.totalRecords).toBe(3);
      expect(stats.riskLevelCounts.low).toBe(1);
      expect(stats.riskLevelCounts.medium).toBe(1);
      expect(stats.riskLevelCounts.high).toBe(1);
      expect(stats.averageDelay).toBe(73);
    });

    it('should return empty statistics for empty array', () => {
      const stats = analyzer.aggregateDelayStatistics([]);

      expect(stats.totalRecords).toBe(0);
      expect(stats.averageDelay).toBe(0);
      expect(stats.onTimePercentage).toBe(0);
    });
  });

  describe('getRiskTrend', () => {
    it('should return stable for insufficient data', () => {
      const predictions = [DelayPrediction.createUnsafe({ percentage: 50, riskLevel: 'medium', avgDelayMinutes: 30, basedOnRecords: 20 })];

      const trend = analyzer.getRiskTrend(predictions);

      expect(trend).toBe('stable');
    });

    it('should return worsening for increasing delays', () => {
      const predictions = [
        DelayPrediction.createUnsafe({ percentage: 20, riskLevel: 'low', avgDelayMinutes: 15, basedOnRecords: 20 }),
        DelayPrediction.createUnsafe({ percentage: 25, riskLevel: 'low', avgDelayMinutes: 18, basedOnRecords: 20 }),
        DelayPrediction.createUnsafe({ percentage: 50, riskLevel: 'medium', avgDelayMinutes: 40, basedOnRecords: 20 }),
        DelayPrediction.createUnsafe({ percentage: 60, riskLevel: 'medium', avgDelayMinutes: 50, basedOnRecords: 20 }),
        DelayPrediction.createUnsafe({ percentage: 75, riskLevel: 'high', avgDelayMinutes: 60, basedOnRecords: 20 }),
        DelayPrediction.createUnsafe({ percentage: 85, riskLevel: 'high', avgDelayMinutes: 70, basedOnRecords: 20 }),
      ];

      const trend = analyzer.getRiskTrend(predictions);

      expect(trend).toBe('worsening');
    });

    it('should return stable for similar delays', () => {
      const predictions = [
        DelayPrediction.createUnsafe({ percentage: 30, riskLevel: 'low', avgDelayMinutes: 20, basedOnRecords: 20 }),
        DelayPrediction.createUnsafe({ percentage: 35, riskLevel: 'low', avgDelayMinutes: 25, basedOnRecords: 20 }),
        DelayPrediction.createUnsafe({ percentage: 32, riskLevel: 'low', avgDelayMinutes: 22, basedOnRecords: 20 }),
        DelayPrediction.createUnsafe({ percentage: 33, riskLevel: 'low', avgDelayMinutes: 23, basedOnRecords: 20 }),
        DelayPrediction.createUnsafe({ percentage: 31, riskLevel: 'low', avgDelayMinutes: 21, basedOnRecords: 20 }),
        DelayPrediction.createUnsafe({ percentage: 34, riskLevel: 'low', avgDelayMinutes: 24, basedOnRecords: 20 }),
      ];

      const trend = analyzer.getRiskTrend(predictions);

      expect(trend).toBe('stable');
    });
  });
});
