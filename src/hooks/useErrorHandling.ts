'use client';

import { useState, useCallback } from 'react';

export interface ErrorState {
  error: Error | null;
  errorMessage: string | null;
  errorCode: string | null;
  isError: boolean;
}

export interface ErrorActions {
  setError: (error: Error | null) => void;
  setErrorMessage: (message: string, code?: string) => void;
  clearError: () => void;
  withErrorHandling: <T>(operation: () => Promise<T>, fallbackMessage?: string) => Promise<T | null>;
}

export function useErrorHandling(initialError: Error | null = null): [ErrorState, ErrorActions] {
  const [error, setError] = useState<Error | null>(initialError);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setErrorMessage = useCallback((message: string, code?: string) => {
    const customError = new Error(message);
    customError.name = code || 'Error';
    setError(customError);
  }, []);

  const withErrorHandling = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      fallbackMessage: string = 'An unexpected error occurred'
    ): Promise<T | null> => {
      try {
        const result = await operation();
        clearError();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(fallbackMessage);
        setError(error);
        return null;
      }
    },
    [clearError]
  );

  const errorState: ErrorState = {
    error,
    errorMessage: error?.message || null,
    errorCode: error?.name || null,
    isError: error !== null,
  };

  return [errorState, { setError, setErrorMessage, clearError, withErrorHandling }];
}

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): AsyncState<T> & { execute: () => Promise<void>; reset: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  if (immediate && isLoading && error === null) {
    execute();
  }

  return { data, isLoading, error, execute, reset };
}

export function useTimeoutError(timeoutMs: number = 5000): {
  checkTimeout: <T>(promise: Promise<T>, operationName?: string) => Promise<T>;
} {
  const checkTimeout = useCallback(async <T,>(
    promise: Promise<T>,
    operationName: string = 'Operation'
  ): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }, [timeoutMs]);

  return { checkTimeout };
}
