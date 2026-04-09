export class ValidationError {
  public readonly field: string;
  public readonly message: string;
  public readonly code: string;

  private constructor(field: string, message: string, code: string) {
    this.field = field;
    this.message = message;
    this.code = code;
    Object.freeze(this);
  }

  static required(field: string): ValidationError {
    return new ValidationError(field, `${field} is required`, 'REQUIRED');
  }

  static invalid(field: string, details?: string): ValidationError {
    const message = details 
      ? `Invalid ${field}: ${details}`
      : `Invalid ${field}`;
    return new ValidationError(field, message, 'INVALID');
  }

  static tooShort(field: string, minLength: number): ValidationError {
    return new ValidationError(
      field,
      `${field} must be at least ${minLength} characters`,
      'TOO_SHORT'
    );
  }

  static tooLong(field: string, maxLength: number): ValidationError {
    return new ValidationError(
      field,
      `${field} must be at most ${maxLength} characters`,
      'TOO_LONG'
    );
  }

  static format(field: string, expected: string): ValidationError {
    return new ValidationError(
      field,
      `${field} must be in format: ${expected}`,
      'INVALID_FORMAT'
    );
  }

  equals(other: ValidationError): boolean {
    return this.code === other.code && this.field === other.field;
  }

  toString(): string {
    return `[${this.code}] ${this.field}: ${this.message}`;
  }
}
