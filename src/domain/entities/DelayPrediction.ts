import { ValidationError } from '../value-objects/ValidationError';
import { Result, success, failure } from '../value-objects/Result';
import { RiskLevel } from '../value-objects/RiskLevel';

export interface DelayPredictionProps {
  percentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  avgDelayMinutes: number;
  basedOnRecords: number;
}

export class DelayPrediction {
  public readonly percentage: number;
  public readonly riskLevel: RiskLevel;
  public readonly avgDelayMinutes: number;
  public readonly basedOnRecords: number;

  private constructor(props: {
    percentage: number;
    riskLevel: RiskLevel;
    avgDelayMinutes: number;
    basedOnRecords: number;
  }) {
    this.percentage = props.percentage;
    this.riskLevel = props.riskLevel;
    this.avgDelayMinutes = props.avgDelayMinutes;
    this.basedOnRecords = props.basedOnRecords;
    Object.freeze(this);
  }

  static create(props: DelayPredictionProps): Result<DelayPrediction, ValidationError> {
    const errors: ValidationError[] = [];

    if (typeof props.percentage !== 'number' || isNaN(props.percentage)) {
      errors.push(ValidationError.invalid('DelayPrediction percentage', 'must be a number'));
    } else if (props.percentage < 0 || props.percentage > 100) {
      errors.push(ValidationError.invalid('DelayPrediction percentage', 'must be between 0 and 100'));
    }

    const riskLevelResult = RiskLevel.create(props.riskLevel);
    if (!riskLevelResult.ok) {
      errors.push(riskLevelResult.error);
    }
    const riskLevel = riskLevelResult as { ok: true; value: RiskLevel; error?: undefined };

    if (typeof props.avgDelayMinutes !== 'number' || isNaN(props.avgDelayMinutes)) {
      errors.push(ValidationError.invalid('DelayPrediction avgDelayMinutes', 'must be a number'));
    } else if (props.avgDelayMinutes < 0) {
      errors.push(ValidationError.invalid('DelayPrediction avgDelayMinutes', 'must be non-negative'));
    }

    if (typeof props.basedOnRecords !== 'number' || !Number.isInteger(props.basedOnRecords)) {
      errors.push(ValidationError.invalid('DelayPrediction basedOnRecords', 'must be an integer'));
    } else if (props.basedOnRecords < 0) {
      errors.push(ValidationError.invalid('DelayPrediction basedOnRecords', 'must be non-negative'));
    }

    if (errors.length > 0) {
      return failure(errors[0]);
    }

    return success(
      new DelayPrediction({
        percentage: Math.round(props.percentage),
        riskLevel: riskLevel.value,
        avgDelayMinutes: Math.round(props.avgDelayMinutes),
        basedOnRecords: props.basedOnRecords,
      })
    );
  }

  static createUnsafe(props: DelayPredictionProps): DelayPrediction {
    const result = DelayPrediction.create(props);
    if (!result.ok) {
      throw new Error(result.error.toString());
    }
    return result.value;
  }

  static fromPercentage(
    percentage: number,
    avgDelayMinutes: number,
    basedOnRecords: number
  ): DelayPrediction {
    const riskLevel = RiskLevel.fromPercentage(percentage);
    return new DelayPrediction({
      percentage: Math.round(percentage),
      riskLevel,
      avgDelayMinutes: Math.round(avgDelayMinutes),
      basedOnRecords,
    });
  }

  static noData(): DelayPrediction {
    return new DelayPrediction({
      percentage: 0,
      riskLevel: RiskLevel.low(),
      avgDelayMinutes: 0,
      basedOnRecords: 0,
    });
  }

  requiresWarning(): boolean {
    return this.riskLevel.requiresWarning();
  }

  requiresAction(): boolean {
    return this.riskLevel.requiresAction();
  }

  isReliable(): boolean {
    return this.basedOnRecords >= 10;
  }

  isHighConfidence(): boolean {
    return this.basedOnRecords >= 50;
  }

  getConfidenceLevel(): 'low' | 'medium' | 'high' {
    if (this.basedOnRecords >= 50) return 'high';
    if (this.basedOnRecords >= 10) return 'medium';
    return 'low';
  }

  getFormattedDelay(): string {
    if (this.avgDelayMinutes < 60) {
      return `${this.avgDelayMinutes} min`;
    }
    const hours = Math.floor(this.avgDelayMinutes / 60);
    const minutes = this.avgDelayMinutes % 60;
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  }

  equals(other: DelayPrediction): boolean {
    return (
      this.percentage === other.percentage &&
      this.riskLevel.equals(other.riskLevel) &&
      this.avgDelayMinutes === other.avgDelayMinutes &&
      this.basedOnRecords === other.basedOnRecords
    );
  }

  toString(): string {
    return `${this.percentage}% risk (based on ${this.basedOnRecords} flights)`;
  }

  toPlainObject(): DelayPredictionProps {
    return {
      percentage: this.percentage,
      riskLevel: this.riskLevel.value,
      avgDelayMinutes: this.avgDelayMinutes,
      basedOnRecords: this.basedOnRecords,
    };
  }
}
