import { ValidationError } from './ValidationError';
import { Result, success, failure } from './Result';

export const TIME_OF_DAY_VALUES = ['morning', 'afternoon', 'evening', 'night'] as const;
export type TimeOfDayValue = typeof TIME_OF_DAY_VALUES[number];

export class TimeOfDay {
  public readonly value: TimeOfDayValue;

  private constructor(value: TimeOfDayValue) {
    this.value = value;
  }

  static create(input: unknown): Result<TimeOfDay, ValidationError> {
    if (input === null || input === undefined) {
      return failure(ValidationError.required('TimeOfDay'));
    }

    if (typeof input !== 'string') {
      return failure(ValidationError.invalid('TimeOfDay', 'must be a string'));
    }

    const normalized = input.toLowerCase().trim() as TimeOfDayValue;

    if (!TIME_OF_DAY_VALUES.includes(normalized)) {
      return failure(
        ValidationError.invalid(
          'TimeOfDay',
          `must be one of: ${TIME_OF_DAY_VALUES.join(', ')}`
        )
      );
    }

    return success(new TimeOfDay(normalized));
  }

  static fromDate(date: Date): TimeOfDay {
    const hour = date.getHours();
    let value: TimeOfDayValue;

    if (hour >= 6 && hour < 12) {
      value = 'morning';
    } else if (hour >= 12 && hour < 18) {
      value = 'afternoon';
    } else if (hour >= 18 && hour < 22) {
      value = 'evening';
    } else {
      value = 'night';
    }

    return new TimeOfDay(value);
  }

  static createUnsafe(input: unknown): TimeOfDay {
    const result = TimeOfDay.create(input);
    if (!result.ok) {
      throw new Error(result.error.toString());
    }
    return result.value;
  }

  isMorning(): boolean {
    return this.value === 'morning';
  }

  isAfternoon(): boolean {
    return this.value === 'afternoon';
  }

  isEvening(): boolean {
    return this.value === 'evening';
  }

  isNight(): boolean {
    return this.value === 'night';
  }

  equals(other: TimeOfDay): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
