import { ValidationError } from './ValidationError';
import { Result, success, failure } from './Result';

export const FLIGHT_STATUS_VALUES = [
  'scheduled',
  'boarding',
  'departed',
  'arrived',
  'delayed',
  'cancelled',
  'unknown',
] as const;

export type FlightStatusValue = typeof FLIGHT_STATUS_VALUES[number];

export const FLIGHT_STATUS_LABELS: Record<FlightStatusValue, string> = {
  scheduled: 'Programado',
  boarding: 'Embarcando',
  departed: 'Despegado',
  arrived: 'Llegado',
  delayed: 'Retrasado',
  cancelled: 'Cancelado',
  unknown: 'Desconocido',
};

export class FlightStatus {
  public readonly value: FlightStatusValue;
  public readonly label: string;

  private constructor(value: FlightStatusValue) {
    this.value = value;
    this.label = FLIGHT_STATUS_LABELS[value];
    Object.freeze(this);
  }

  static create(input: unknown): Result<FlightStatus, ValidationError> {
    if (input === null || input === undefined) {
      return failure(ValidationError.required('FlightStatus'));
    }

    if (typeof input !== 'string') {
      return failure(ValidationError.invalid('FlightStatus', 'must be a string'));
    }

    const normalized = input.toLowerCase().trim() as FlightStatusValue;

    if (!FLIGHT_STATUS_VALUES.includes(normalized)) {
      return failure(
        ValidationError.invalid(
          'FlightStatus',
          `must be one of: ${FLIGHT_STATUS_VALUES.join(', ')}`
        )
      );
    }

    return success(new FlightStatus(normalized));
  }

  static createUnsafe(input: unknown): FlightStatus {
    const result = FlightStatus.create(input);
    if (!result.ok) {
      throw new Error(result.error.toString());
    }
    return result.value;
  }

  static scheduled(): FlightStatus {
    return new FlightStatus('scheduled');
  }

  static delayed(): FlightStatus {
    return new FlightStatus('delayed');
  }

  static cancelled(): FlightStatus {
    return new FlightStatus('cancelled');
  }

  isActive(): boolean {
    return ['scheduled', 'boarding', 'departed', 'delayed'].includes(this.value);
  }

  isCompleted(): boolean {
    return ['arrived', 'cancelled'].includes(this.value);
  }

  isDelayed(): boolean {
    return this.value === 'delayed';
  }

  requiresAttention(): boolean {
    return ['boarding', 'delayed', 'cancelled'].includes(this.value);
  }

  equals(other: FlightStatus): boolean {
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
}
