import { ValidationError } from './ValidationError';
import { Result, success, failure } from './Result';

const CALLSIGN_MIN_LENGTH = 2;
const CALLSIGN_MAX_LENGTH = 10;
const CALLSIGN_PATTERN = /^[A-Z0-9]{2,10}$/;
const AIRLINE_PATTERN = /^[A-Z]{2,3}/;

export interface CallsignParts {
  airline: string;
  number: string;
}

export class Callsign {
  public readonly value: string;
  public readonly airline: string;
  public readonly number: string;

  private constructor(value: string, airline: string, number: string) {
    this.value = value;
    this.airline = airline;
    this.number = number;
    Object.freeze(this);
  }

  static create(input: unknown): Result<Callsign, ValidationError> {
    if (input === null || input === undefined) {
      return failure(ValidationError.required('Callsign'));
    }

    if (typeof input !== 'string') {
      return failure(ValidationError.invalid('Callsign', 'must be a string'));
    }

    const trimmed = input.trim();

    if (trimmed.length === 0) {
      return failure(ValidationError.required('Callsign'));
    }

    if (trimmed.length < CALLSIGN_MIN_LENGTH) {
      return failure(ValidationError.tooShort('Callsign', CALLSIGN_MIN_LENGTH));
    }

    const sanitized = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (sanitized.length < CALLSIGN_MIN_LENGTH) {
      return failure(ValidationError.tooShort('Callsign', CALLSIGN_MIN_LENGTH));
    }

    if (sanitized.length > CALLSIGN_MAX_LENGTH) {
      return failure(ValidationError.tooLong('Callsign', CALLSIGN_MAX_LENGTH));
    }

    const truncated = sanitized.slice(0, CALLSIGN_MAX_LENGTH);

    if (!CALLSIGN_PATTERN.test(truncated)) {
      return failure(ValidationError.format('Callsign', '2-10 letters and numbers (e.g., IBE1234)'));
    }

    const airlineMatch = truncated.match(AIRLINE_PATTERN);
    const airline = airlineMatch ? airlineMatch[0] : '';
    const number = truncated.slice(airline.length);

    return success(new Callsign(truncated, airline, number));
  }

  static createUnsafe(input: unknown): Callsign {
    const result = Callsign.create(input);
    if (!result.ok) {
      throw new Error(result.error.toString());
    }
    return result.value;
  }

  hasAirlineCode(): boolean {
    return this.airline.length >= 2;
  }

  isVowelFree(): boolean {
    return !/[AEIOU]{2}/.test(this.airline);
  }

  equals(other: Callsign): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }

  toParts(): CallsignParts {
    return {
      airline: this.airline,
      number: this.number,
    };
  }

  [Symbol.toPrimitive](type: 'string' | 'number' | 'default'): string | number {
    if (type === 'string') {
      return this.value;
    }
    throw new TypeError('Cannot convert Callsign to number');
  }
}
