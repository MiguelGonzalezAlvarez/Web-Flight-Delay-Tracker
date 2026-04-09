import { DelayPrediction } from '../entities/DelayPrediction';
import { DelayPredictionRepository } from '../repositories/DelayPredictionRepository';
import { Route } from '../entities/Route';

export interface DelayStatistics {
  averageDelay: number;
  onTimePercentage: number;
  delayDistribution: Record<string, number>;
  riskLevelCounts: Record<string, number>;
  totalRecords: number;
}

export interface RouteDelayAnalysis {
  route: string;
  statistics: DelayStatistics;
  predictions: DelayPrediction[];
  reliabilityScore: number;
}

export class DelayAnalyzer {
  constructor(private readonly predictionRepository: DelayPredictionRepository) {}

  calculateOnTimeRate(predictions: DelayPrediction[]): number {
    if (predictions.length === 0) {
      return 0;
    }
    const delayedCount = predictions.filter((p) => p.riskLevel.value !== 'low').length;
    return Math.round(((predictions.length - delayedCount) / predictions.length) * 100);
  }

  getReliabilityScore(predictions: DelayPrediction[]): number {
    if (predictions.length === 0) {
      return 0;
    }
    const reliablePredictions = predictions.filter((p) => p.isReliable());
    return Math.round((reliablePredictions.length / predictions.length) * 100);
  }

  aggregateDelayStatistics(predictions: DelayPrediction[]): DelayStatistics {
    if (predictions.length === 0) {
      return {
        averageDelay: 0,
        onTimePercentage: 0,
        delayDistribution: { low: 0, medium: 0, high: 0 },
        riskLevelCounts: { low: 0, medium: 0, high: 0 },
        totalRecords: 0,
      };
    }

    const riskLevelCounts: Record<string, number> = { low: 0, medium: 0, high: 0 };
    let totalDelay = 0;

    for (const prediction of predictions) {
      riskLevelCounts[prediction.riskLevel.value]++;
      totalDelay += prediction.avgDelayMinutes;
    }

    const delayDistribution: Record<string, number> = {};
    const thresholds = [15, 30, 60, 120];
    for (const threshold of thresholds) {
      const count = predictions.filter((p) => p.avgDelayMinutes <= threshold).length;
      delayDistribution[`<=${threshold}min`] = count;
    }

    return {
      averageDelay: Math.round(totalDelay / predictions.length),
      onTimePercentage: this.calculateOnTimeRate(predictions),
      delayDistribution,
      riskLevelCounts,
      totalRecords: predictions.length,
    };
  }

  async analyzeFlightDelay(flightId: string): Promise<DelayStatistics | null> {
    const result = await this.predictionRepository.findByFlightId(flightId);
    if (!result) {
      return null;
    }

    const prediction = (result as { ok: true; value: DelayPrediction }).value;
    return this.aggregateDelayStatistics([prediction]);
  }

  async analyzeRouteDelays(origin: string, destination: string): Promise<RouteDelayAnalysis> {
    const route = Route.createUnsafe({ origin, destination });
    const predictions: DelayPrediction[] = [];

    const allResults = await this.predictionRepository.findByRiskLevel('low');
    for (const result of allResults) {
      if (result.ok) {
        predictions.push(result.value);
      }
    }

    const mediumResults = await this.predictionRepository.findByRiskLevel('medium');
    for (const result of mediumResults) {
      if (result.ok) {
        predictions.push(result.value);
      }
    }

    const highResults = await this.predictionRepository.findHighRisk();
    for (const result of highResults) {
      if (result.ok) {
        predictions.push(result.value);
      }
    }

    return {
      route: route.toString(),
      statistics: this.aggregateDelayStatistics(predictions),
      predictions,
      reliabilityScore: this.getReliabilityScore(predictions),
    };
  }

  getRiskTrend(predictions: DelayPrediction[]): 'improving' | 'stable' | 'worsening' {
    if (predictions.length < 2) {
      return 'stable';
    }

    const sorted = [...predictions].sort(
      (a, b) => a.percentage - b.percentage
    );

    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const firstAvg = firstHalf.reduce((sum, p) => sum + p.percentage, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.percentage, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (diff < -5) return 'improving';
    if (diff > 5) return 'worsening';
    return 'stable';
  }
}
