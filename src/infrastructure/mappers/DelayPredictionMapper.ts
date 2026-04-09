import { DelayPrediction, DelayPredictionProps } from '../../domain/entities/DelayPrediction';
import { Result, success, failure } from '../../domain/value-objects/Result';
import { ValidationError } from '../../domain/value-objects/ValidationError';

export interface DelayPredictionDTO {
  percentage: number;
  avgDelayMinutes: number;
  basedOnRecords: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export class DelayPredictionMapper {
  static toEntity(dto: DelayPredictionDTO): Result<DelayPrediction, ValidationError> {
    return DelayPrediction.create({
      percentage: dto.percentage,
      riskLevel: dto.riskLevel,
      avgDelayMinutes: dto.avgDelayMinutes,
      basedOnRecords: dto.basedOnRecords,
    });
  }

  static toDTO(entity: DelayPrediction): DelayPredictionDTO {
    return entity.toPlainObject();
  }

  static fromPercentage(percentage: number, avgDelayMinutes: number, basedOnRecords: number): DelayPrediction {
    return DelayPrediction.fromPercentage(percentage, avgDelayMinutes, basedOnRecords);
  }

  static noData(): DelayPrediction {
    return DelayPrediction.noData();
  }
}
