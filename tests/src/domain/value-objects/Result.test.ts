import { success, failure, isSuccess, isFailure, map, flatMap, getOrElse, getOrThrow } from '@/src/domain/value-objects/Result';
import { ValidationError } from '@/src/domain/value-objects/ValidationError';

describe('Result', () => {
  describe('success', () => {
    it('should create a success result', () => {
      const result = success(42);

      expect(result.ok).toBe(true);
      expect(result.value).toBe(42);
    });
  });

  describe('failure', () => {
    it('should create a failure result', () => {
      const error = ValidationError.required('Name');
      const result = failure(error);

      expect(result.ok).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('isSuccess', () => {
    it('should return true for success results', () => {
      const result = success(42);

      expect(isSuccess(result)).toBe(true);
      expect(isFailure(result)).toBe(false);
    });

    it('should narrow type to success', () => {
      const result: { ok: true; value: number } = success(42);

      if (isSuccess(result)) {
        expect(result.value).toBe(42);
      }
    });
  });

  describe('isFailure', () => {
    it('should return true for failure results', () => {
      const error = ValidationError.required('Name');
      const result = failure(error);

      expect(isFailure(result)).toBe(true);
      expect(isSuccess(result)).toBe(false);
    });

    it('should narrow type to failure', () => {
      const error = ValidationError.required('Name');
      const result: { ok: false; error: ValidationError } = failure(error);

      if (isFailure(result)) {
        expect(result.error).toBe(error);
      }
    });
  });

  describe('map', () => {
    it('should transform success value', () => {
      const result = success(5);
      const mapped = map(result, (x) => x * 2);

      expect(isSuccess(mapped)).toBe(true);
      if (isSuccess(mapped)) {
        expect(mapped.value).toBe(10);
      }
    });

    it('should pass through failure', () => {
      const error = ValidationError.required('Name');
      const result: { ok: false; error: ValidationError } = failure(error);
      const mapped = map(result, (x: number) => x * 2);

      expect(isFailure(mapped)).toBe(true);
      if (isFailure(mapped)) {
        expect(mapped.error).toBe(error);
      }
    });
  });

  describe('flatMap', () => {
    it('should flat map success value', () => {
      const result = success(5);
      const flatMapped = flatMap(result, (x) => success(x * 2));

      expect(isSuccess(flatMapped)).toBe(true);
      if (isSuccess(flatMapped)) {
        expect(flatMapped.value).toBe(10);
      }
    });

    it('should flatten nested failures', () => {
      const result = success(5);
      const error = ValidationError.required('test');
      const flatMapped = flatMap(result, () => failure<number>(error));

      expect(isFailure(flatMapped)).toBe(true);
      if (isFailure(flatMapped)) {
        expect(flatMapped.error).toBe(error);
      }
    });

    it('should pass through failure', () => {
      const error = ValidationError.required('Name');
      const result: { ok: false; error: ValidationError } = failure(error);
      const flatMapped = flatMap(result, (x: number) => success(x * 2));

      expect(isFailure(flatMapped)).toBe(true);
    });
  });

  describe('getOrElse', () => {
    it('should return value for success', () => {
      const result = success(42);

      expect(getOrElse(result, 0)).toBe(42);
    });

    it('should return default for failure', () => {
      const error = ValidationError.required('Name');
      const result: { ok: false; error: ValidationError } = failure(error);

      expect(getOrElse(result, 0)).toBe(0);
    });
  });

  describe('getOrThrow', () => {
    it('should return value for success', () => {
      const result = success(42);

      expect(getOrThrow(result)).toBe(42);
    });

    it('should throw for failure', () => {
      const error = ValidationError.required('Name');
      const result: { ok: false; error: ValidationError } = failure(error);

      expect(() => getOrThrow(result)).toThrow(error.toString());
    });
  });

  describe('type narrowing', () => {
    it('should properly narrow success type', () => {
      const result = success<number, ValidationError>(42);

      if (result.ok) {
        const _: number = result.value;
        expect(_).toBe(42);
      }
    });

    it('should properly narrow failure type', () => {
      const error = ValidationError.required('test');
      const result: { ok: false; error: ValidationError } = failure(error);

      if (!result.ok) {
        const _: ValidationError = result.error;
        expect(_.code).toBe('REQUIRED');
      }
    });
  });
});
