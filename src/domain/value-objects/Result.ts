import { ValidationError } from './ValidationError';

export type Result<T, E extends ValidationError = ValidationError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function success<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function failure<E extends ValidationError>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isSuccess<T, E extends ValidationError>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok === true;
}

export function isFailure<T, E extends ValidationError>(result: Result<T, E>): result is { ok: false; error: E } {
  return result.ok === false;
}

export function map<T, U, E extends ValidationError>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (isSuccess(result)) {
    return success(fn(result.value));
  }
  return failure(result.error);
}

export function flatMap<T, U, E extends ValidationError>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (isSuccess(result)) {
    return fn(result.value);
  }
  return failure(result.error);
}

export function getOrElse<T, E extends ValidationError>(
  result: Result<T, E>,
  defaultValue: T
): T {
  if (isSuccess(result)) {
    return result.value;
  }
  return defaultValue;
}

export function getOrThrow<T, E extends ValidationError>(result: Result<T, E>): T {
  if (isFailure(result)) {
    throw new Error(result.error.toString());
  }
  return result.value;
}
