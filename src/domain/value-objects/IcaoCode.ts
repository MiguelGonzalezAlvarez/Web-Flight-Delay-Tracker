import { ValidationError } from './ValidationError';
import { Result, success, failure } from './Result';

const ICAO_PATTERN = /^[A-Z0-9]{4}$/;
const ICAO_MIN_LENGTH = 4;
const ICAO_MAX_LENGTH = 4;

export class IcaoCode {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static create(input: unknown): Result<IcaoCode, ValidationError> {
    if (input === null || input === undefined) {
      return failure(ValidationError.required('ICAO code'));
    }

    if (typeof input !== 'string') {
      return failure(ValidationError.invalid('ICAO code', 'must be a string'));
    }

    const trimmed = input.trim();

    if (trimmed.length === 0) {
      return failure(ValidationError.required('ICAO code'));
    }

    if (trimmed.length < ICAO_MIN_LENGTH) {
      return failure(ValidationError.tooShort('ICAO code', ICAO_MIN_LENGTH));
    }

    const sanitized = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (sanitized.length < ICAO_MIN_LENGTH) {
      return failure(ValidationError.tooShort('ICAO code', ICAO_MIN_LENGTH));
    }

    const truncated = sanitized.slice(0, ICAO_MAX_LENGTH);

    if (!ICAO_PATTERN.test(truncated)) {
      return failure(ValidationError.format('ICAO code', '4 uppercase letters or numbers (e.g., LEMD, EGLL)'));
    }

    return success(new IcaoCode(truncated));
  }

  static createUnsafe(input: unknown): IcaoCode {
    const result = IcaoCode.create(input);
    if (!result.ok) {
      throw new Error(result.error.toString());
    }
    return result.value;
  }

  get iata(): string {
    return this.value.slice(-3);
  }

  equals(other: IcaoCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }

  [Symbol.toPrimitive](type: 'string' | 'number' | 'default'): string | number {
    if (type === 'string') {
      return this.value;
    }
    throw new TypeError('Cannot convert IcaoCode to number');
  }
}
