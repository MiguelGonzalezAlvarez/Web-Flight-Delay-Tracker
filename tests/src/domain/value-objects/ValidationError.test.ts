import { ValidationError } from '@/src/domain/value-objects/ValidationError';

describe('ValidationError', () => {
  describe('required', () => {
    it('should create a required error with correct properties', () => {
      const error = ValidationError.required('Email');

      expect(error.field).toBe('Email');
      expect(error.message).toBe('Email is required');
      expect(error.code).toBe('REQUIRED');
    });
  });

  describe('invalid', () => {
    it('should create an invalid error with default message', () => {
      const error = ValidationError.invalid('Email');

      expect(error.field).toBe('Email');
      expect(error.message).toBe('Invalid Email');
      expect(error.code).toBe('INVALID');
    });

    it('should create an invalid error with details', () => {
      const error = ValidationError.invalid('Email', 'must be a valid email address');

      expect(error.field).toBe('Email');
      expect(error.message).toBe('Invalid Email: must be a valid email address');
      expect(error.code).toBe('INVALID');
    });
  });

  describe('tooShort', () => {
    it('should create a too short error', () => {
      const error = ValidationError.tooShort('Password', 8);

      expect(error.field).toBe('Password');
      expect(error.message).toBe('Password must be at least 8 characters');
      expect(error.code).toBe('TOO_SHORT');
    });
  });

  describe('tooLong', () => {
    it('should create a too long error', () => {
      const error = ValidationError.tooLong('Username', 20);

      expect(error.field).toBe('Username');
      expect(error.message).toBe('Username must be at most 20 characters');
      expect(error.code).toBe('TOO_LONG');
    });
  });

  describe('format', () => {
    it('should create a format error', () => {
      const error = ValidationError.format('ICAO', '4 uppercase letters');

      expect(error.field).toBe('ICAO');
      expect(error.message).toBe('ICAO must be in format: 4 uppercase letters');
      expect(error.code).toBe('INVALID_FORMAT');
    });
  });

  describe('equals', () => {
    it('should return true for equal errors', () => {
      const error1 = ValidationError.required('Name');
      const error2 = ValidationError.required('Name');

      expect(error1.equals(error2)).toBe(true);
    });

    it('should return false for errors with different codes', () => {
      const error1 = ValidationError.required('Name');
      const error2 = ValidationError.invalid('Name');

      expect(error1.equals(error2)).toBe(false);
    });

    it('should return false for errors with different fields', () => {
      const error1 = ValidationError.required('Name');
      const error2 = ValidationError.required('Email');

      expect(error1.equals(error2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const error = ValidationError.invalid('Email', 'not an email');

      expect(error.toString()).toBe('[INVALID] Email: Invalid Email: not an email');
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const error = ValidationError.required('Name');

      expect(Object.isFrozen(error)).toBe(true);
    });

    it('should throw on modification attempt', () => {
      const error = ValidationError.required('Name');

      expect(() => {
        (error as any).field = 'NewField';
      }).toThrow();
    });
  });
});
