import { DelayPrediction } from '../../domain/entities/DelayPrediction';
import { DelayPredictionRepository } from '../../domain/repositories/DelayPredictionRepository';
import { Result, success, failure } from '../../domain/value-objects/Result';
import { ValidationError } from '../../domain/value-objects/ValidationError';

export class InMemoryDelayPredictionRepository implements DelayPredictionRepository {
  private predictions: Map<string, DelayPrediction> = new Map();

  async findByFlightId(flightId: string): Promise<Result<DelayPrediction, ValidationError> | null> {
    const prediction = this.predictions.get(flightId);
    if (!prediction) {
      return null;
    }
    return success(prediction);
  }

  async findByRiskLevel(riskLevel: 'low' | 'medium' | 'high'): Promise<Result<DelayPrediction, ValidationError>[]> {
    const results: Result<DelayPrediction, ValidationError>[] = [];
    for (const prediction of this.predictions.values()) {
      if (prediction.riskLevel.value === riskLevel) {
        results.push(success(prediction));
      }
    }
    return results;
  }

  async findHighRisk(): Promise<Result<DelayPrediction, ValidationError>[]> {
    return this.findByRiskLevel('high');
  }

  async save(prediction: DelayPrediction, flightId: string): Promise<Result<DelayPrediction, ValidationError>> {
    this.predictions.set(flightId, prediction);
    return success(prediction);
  }

  async deleteByFlightId(flightId: string): Promise<Result<void, ValidationError>> {
    if (!this.predictions.has(flightId)) {
      return failure(ValidationError.notFound('DelayPrediction', flightId));
    }
    this.predictions.delete(flightId);
    return success(undefined);
  }

  async findReliable(): Promise<Result<DelayPrediction, ValidationError>[]> {
    const results: Result<DelayPrediction, ValidationError>[] = [];
    for (const prediction of this.predictions.values()) {
      if (prediction.isReliable()) {
        results.push(success(prediction));
      }
    }
    return results;
  }

  clear(): void {
    this.predictions.clear();
  }

  size(): number {
    return this.predictions.size;
  }
}
