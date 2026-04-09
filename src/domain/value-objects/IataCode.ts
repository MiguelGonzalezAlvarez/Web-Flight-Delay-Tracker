import { ValidationError } from './ValidationError';
import { Result, success, failure } from './Result';

const IATA_PATTERN = /^[A-Z]{2,3}$/;
const IATA_MIN_LENGTH = 2;
const IATA_MAX_LENGTH = 3;

export class IataCode {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static create(input: unknown): Result<IataCode, ValidationError> {
    if (input === null || input === undefined) {
      return failure(ValidationError.required('IATA code'));
    }

    if (typeof input !== 'string') {
      return failure(ValidationError.invalid('IATA code', 'must be a string'));
    }

    const trimmed = input.trim();

    if (trimmed.length === 0) {
      return failure(ValidationError.required('IATA code'));
    }

    const sanitized = trimmed.toUpperCase().replace(/[^A-Z]/g, '');

    if (sanitized.length < IATA_MIN_LENGTH) {
      return failure(ValidationError.tooShort('IATA code', IATA_MIN_LENGTH));
    }

    if (sanitized.length > IATA_MAX_LENGTH) {
      return failure(ValidationError.tooLong('IATA code', IATA_MAX_LENGTH));
    }

    const truncated = sanitized.slice(0, IATA_MAX_LENGTH);

    if (!IATA_PATTERN.test(truncated)) {
      return failure(ValidationError.format('IATA code', '2-3 uppercase letters (e.g., MAD, BCN)'));
    }

    return success(new IataCode(truncated));
  }

  static createUnsafe(input: unknown): IataCode {
    const result = IataCode.create(input);
    if (!result.ok) {
      throw new Error(result.error.toString());
    }
    return result.value;
  }

  isAirport(): boolean {
    return this.value.length === 3;
  }

  isCountryCode(): boolean {
    return this.value.length === 2;
  }

  equals(other: IataCode): boolean {
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
    throw new TypeError('Cannot convert IataCode to number');
  }
}
