import { DelayPrediction, DelayPredictionProps } from '../../domain/entities/DelayPrediction';
import { DelayPredictionRepository } from '../../domain/repositories/DelayPredictionRepository';
import { Result, success, failure } from '../../domain/value-objects/Result';
import { ValidationError } from '../../domain/value-objects/ValidationError';
import { DelayPredictionCreatedEvent, DelayRiskLevelChangedEvent, HighDelayRiskAlertEvent } from '../../domain/events';
import { EventDispatcher } from '../../domain/events/DomainEvent';

export class DelayPredictionService {
  constructor(
    private readonly predictionRepository: DelayPredictionRepository,
    private readonly eventDispatcher: EventDispatcher
  ) {}

  async createPrediction(
    flightId: string,
    props: DelayPredictionProps
  ): Promise<Result<DelayPrediction, ValidationError>> {
    const existing = await this.predictionRepository.findByFlightId(flightId);
    if (existing) {
      return failure(ValidationError.invalid('flightId', 'Prediction already exists for this flight'));
    }

    const predictionResult = DelayPrediction.create(props);
    if (!predictionResult.ok) {
      return failure(predictionResult.error);
    }

    const prediction = predictionResult.value;
    const saveResult = await this.predictionRepository.save(prediction, flightId);
    if (!saveResult.ok) {
      return failure(saveResult.error);
    }

    this.eventDispatcher.dispatch(new DelayPredictionCreatedEvent({
      flightId,
      percentage: prediction.percentage,
      riskLevel: prediction.riskLevel.value,
      avgDelayMinutes: prediction.avgDelayMinutes,
      basedOnRecords: prediction.basedOnRecords,
    }));

    if (prediction.riskLevel.value === 'high') {
      this.eventDispatcher.dispatch(new HighDelayRiskAlertEvent({
        flightId,
        percentage: prediction.percentage,
        riskLevel: prediction.riskLevel.value,
        avgDelayMinutes: prediction.avgDelayMinutes,
        basedOnRecords: prediction.basedOnRecords,
      }));
    }

    return success(prediction);
  }

  async createPredictionFromPercentage(
    flightId: string,
    percentage: number,
    avgDelayMinutes: number,
    basedOnRecords: number
  ): Promise<Result<DelayPrediction, ValidationError>> {
    const prediction = DelayPrediction.fromPercentage(percentage, avgDelayMinutes, basedOnRecords);
    const saveResult = await this.predictionRepository.save(prediction, flightId);
    
    if (!saveResult.ok) {
      return failure(saveResult.error);
    }

    this.eventDispatcher.dispatch(new DelayPredictionCreatedEvent({
      flightId,
      percentage: prediction.percentage,
      riskLevel: prediction.riskLevel.value,
      avgDelayMinutes: prediction.avgDelayMinutes,
      basedOnRecords: prediction.basedOnRecords,
    }));

    return success(prediction);
  }

  async getPrediction(flightId: string): Promise<Result<DelayPrediction, ValidationError> | null> {
    return this.predictionRepository.findByFlightId(flightId);
  }

  async updatePrediction(
    flightId: string,
    props: DelayPredictionProps
  ): Promise<Result<DelayPrediction, ValidationError>> {
    const existing = await this.predictionRepository.findByFlightId(flightId);
    if (!existing) {
      return failure(ValidationError.notFound('DelayPrediction', flightId));
    }

    const previousRiskLevel = (existing as { ok: true; value: DelayPrediction }).value.riskLevel.value;

    const predictionResult = DelayPrediction.create(props);
    if (!predictionResult.ok) {
      return failure(predictionResult.error);
    }

    const prediction = predictionResult.value;
    await this.predictionRepository.save(prediction, flightId);

    if (previousRiskLevel !== prediction.riskLevel.value) {
      this.eventDispatcher.dispatch(new DelayRiskLevelChangedEvent({
        flightId,
        percentage: prediction.percentage,
        riskLevel: prediction.riskLevel.value,
        avgDelayMinutes: prediction.avgDelayMinutes,
        basedOnRecords: prediction.basedOnRecords,
        previousRiskLevel,
        newRiskLevel: prediction.riskLevel.value,
      }));

      if (prediction.riskLevel.value === 'high') {
        this.eventDispatcher.dispatch(new HighDelayRiskAlertEvent({
          flightId,
          percentage: prediction.percentage,
          riskLevel: prediction.riskLevel.value,
          avgDelayMinutes: prediction.avgDelayMinutes,
          basedOnRecords: prediction.basedOnRecords,
        }));
      }
    }

    return success(prediction);
  }

  async getHighRiskPredictions(): Promise<Result<DelayPrediction, ValidationError>[]> {
    return this.predictionRepository.findHighRisk();
  }

  async getReliablePredictions(): Promise<Result<DelayPrediction, ValidationError>[]> {
    return this.predictionRepository.findReliable();
  }

  async deletePrediction(flightId: string): Promise<Result<void, ValidationError>> {
    return this.predictionRepository.deleteByFlightId(flightId);
  }
}
