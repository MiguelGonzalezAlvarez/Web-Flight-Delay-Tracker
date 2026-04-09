import { DelayPrediction } from '../entities/DelayPrediction';
import { Result } from '../value-objects/Result';
import { ValidationError } from '../value-objects/ValidationError';

export interface DelayPredictionRepository {
  findByFlightId(flightId: string): Promise<Result<DelayPrediction, ValidationError> | null>;
  findByRiskLevel(riskLevel: 'low' | 'medium' | 'high'): Promise<Result<DelayPrediction, ValidationError>[]>;
  findHighRisk(): Promise<Result<DelayPrediction, ValidationError>[]>;
  save(prediction: DelayPrediction, flightId: string): Promise<Result<DelayPrediction, ValidationError>>;
  deleteByFlightId(flightId: string): Promise<Result<void, ValidationError>>;
  findReliable(): Promise<Result<DelayPrediction, ValidationError>[]>;
}
