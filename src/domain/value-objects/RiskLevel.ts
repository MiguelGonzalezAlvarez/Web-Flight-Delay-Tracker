import { ValidationError } from './ValidationError';
import { Result, success, failure } from './Result';

export const RISK_LEVEL_VALUES = ['low', 'medium', 'high'] as const;

export type RiskLevelValue = typeof RISK_LEVEL_VALUES[number];

export const RISK_LEVEL_LABELS: Record<RiskLevelValue, string> = {
  low: 'Bajo riesgo',
  medium: 'Riesgo medio',
  high: 'Alto riesgo',
};

export const RISK_LEVEL_THRESHOLDS = {
  LOW_MAX: 20,
  MEDIUM_MAX: 50,
} as const;

export class RiskLevel {
  public readonly value: RiskLevelValue;
  public readonly label: string;
  public readonly percentage: number;

  private constructor(value: RiskLevelValue, percentage: number) {
    this.value = value;
    this.label = RISK_LEVEL_LABELS[value];
    this.percentage = percentage;
    Object.freeze(this);
  }

  static create(input: unknown): Result<RiskLevel, ValidationError> {
    if (input === null || input === undefined) {
      return failure(ValidationError.required('RiskLevel'));
    }

    if (typeof input !== 'string') {
      return failure(ValidationError.invalid('RiskLevel', 'must be a string'));
    }

    const normalized = input.toLowerCase().trim() as RiskLevelValue;

    if (!RISK_LEVEL_VALUES.includes(normalized)) {
      return failure(
        ValidationError.invalid(
          'RiskLevel',
          `must be one of: ${RISK_LEVEL_VALUES.join(', ')}`
        )
      );
    }

    return success(new RiskLevel(normalized, 0));
  }

  static fromPercentage(percentage: number): RiskLevel {
    const clampedPercentage = Math.max(0, Math.min(100, Math.round(percentage)));

    let value: RiskLevelValue;
    if (clampedPercentage <= RISK_LEVEL_THRESHOLDS.LOW_MAX) {
      value = 'low';
    } else if (clampedPercentage <= RISK_LEVEL_THRESHOLDS.MEDIUM_MAX) {
      value = 'medium';
    } else {
      value = 'high';
    }

    return new RiskLevel(value, clampedPercentage);
  }

  static createUnsafe(input: unknown): RiskLevel {
    const result = RiskLevel.create(input);
    if (!result.ok) {
      throw new Error(result.error.toString());
    }
    return result.value;
  }

  static low(): RiskLevel {
    return new RiskLevel('low', 0);
  }

  static medium(): RiskLevel {
    return new RiskLevel('medium', 0);
  }

  static high(): RiskLevel {
    return new RiskLevel('high', 0);
  }

  requiresWarning(): boolean {
    return this.value !== 'low';
  }

  requiresAction(): boolean {
    return this.value === 'high';
  }

  getColor(): 'green' | 'amber' | 'red' {
    switch (this.value) {
      case 'low':
        return 'green';
      case 'medium':
        return 'amber';
      case 'high':
        return 'red';
    }
  }

  equals(other: RiskLevel): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }

  toLocaleString(locale: string = 'es-ES'): string {
    if (locale.startsWith('es')) {
      return this.label;
    }
    return this.value;
  }

  compareTo(other: RiskLevel): number {
    const order = { low: 0, medium: 1, high: 2 };
    return order[this.value] - order[other.value];
  }
}
