import {
  AppError,
  RepositoryError,
  ServiceError,
  NetworkError,
  ExternalServiceError,
  CacheError,
  isAppError,
  isRetryableError,
} from '@/src/domain/errors/AppError';
import {
  withRetry,
  withCircuitBreaker,
  createCircuitBreakerState,
  AsyncOperationQueue,
} from '@/src/infrastructure/errors/RetryUtils';

describe('AppError', () => {
  describe('RepositoryError', () => {
    it('should create a repository error with correct properties', () => {
      const error = new RepositoryError(
        'Failed to save flight',
        'Flight',
        'create'
      );

      expect(error.message).toBe('Failed to save flight');
      expect(error.code).toBe('REPOSITORY_ERROR');
      expect(error.severity).toBe('high');
      expect(error.entityType).toBe('Flight');
      expect(error.operation).toBe('create');
      expect(error.isOperational).toBe(true);
    });

    it('should include context information', () => {
      const error = new RepositoryError(
        'Failed to find airport',
        'Airport',
        'read',
        undefined,
        { userId: 'user-123' }
      );

      expect(error.context.userId).toBe('user-123');
    });

    it('should convert to JSON correctly', () => {
      const error = new RepositoryError(
        'Test error',
        'Test',
        'read'
      );

      const json = error.toJSON();

      expect(json.name).toBe('RepositoryError');
      expect(json.message).toBe('Test error');
      expect(json.code).toBe('REPOSITORY_ERROR');
      expect(json.severity).toBe('high');
    });
  });

  describe('ServiceError', () => {
    it('should create a service error with correct properties', () => {
      const error = new ServiceError(
        'Flight service unavailable',
        'FlightService',
        'getFlight'
      );

      expect(error.message).toBe('Flight service unavailable');
      expect(error.serviceName).toBe('FlightService');
      expect(error.operation).toBe('getFlight');
      expect(error.code).toBe('SERVICE_ERROR');
    });

    it('should allow custom severity', () => {
      const error = new ServiceError(
        'Critical failure',
        'FlightService',
        'getFlight',
        'critical'
      );

      expect(error.severity).toBe('critical');
    });
  });

  describe('NetworkError', () => {
    it('should create a network error with correct properties', () => {
      const error = new NetworkError(
        'Connection failed',
        'https://api.example.com/flights',
        503
      );

      expect(error.message).toBe('Connection failed');
      expect(error.url).toBe('https://api.example.com/flights');
      expect(error.statusCode).toBe(503);
      expect(error.retryable).toBe(true);
    });

    it('should mark 5xx errors as high severity', () => {
      const error = new NetworkError(
        'Server error',
        'https://api.example.com',
        500
      );

      expect(error.severity).toBe('high');
    });

    it('should mark 4xx errors as medium severity', () => {
      const error = new NetworkError(
        'Not found',
        'https://api.example.com',
        404
      );

      expect(error.severity).toBe('medium');
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new RepositoryError('test', 'Test', 'read');
      expect(isAppError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('regular error');
      expect(isAppError(error)).toBe(false);
    });
  });

  describe('isRetryableError', () => {
    it('should return true for retryable NetworkError', () => {
      const error = new NetworkError('timeout', 'url', 503, true);
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for non-retryable NetworkError', () => {
      const error = new NetworkError('timeout', 'url', 503, false);
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for regular Error', () => {
      const error = new Error('regular error');
      expect(isRetryableError(error)).toBe(false);
    });
  });
});

describe('RetryUtils', () => {
  describe('withRetry', () => {
    it('should return result on successful operation', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withRetry(operation, { maxAttempts: 3 });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should throw non-retryable errors immediately', async () => {
      const error = new Error('not retryable');
      const operation = jest.fn().mockRejectedValue(error);
      
      await expect(withRetry(operation, { maxAttempts: 3 })).rejects.toThrow('not retryable');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const retryableError = new NetworkError('timeout', 'url', 503, true);
      const operation = jest.fn()
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce('success');
      
      const result = await withRetry(operation, { 
        maxAttempts: 3,
        initialDelayMs: 10,
      });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should call onRetry callback', async () => {
      const retryableError = new NetworkError('timeout', 'url', 503, true);
      const operation = jest.fn()
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce('success');
      const onRetry = jest.fn();
      
      await withRetry(operation, { 
        maxAttempts: 3,
        initialDelayMs: 10,
        onRetry,
      });
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('withCircuitBreaker', () => {
    it('should allow requests when circuit is closed', async () => {
      const state = createCircuitBreakerState(3, 60000);
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withCircuitBreaker(operation, state);
      
      expect(result).toBe('success');
      expect(state.status).toBe('closed');
    });

    it('should open circuit after threshold failures', async () => {
      const state = createCircuitBreakerState(2, 60000);
      const operation = jest.fn().mockRejectedValue(new Error('fail'));
      
      await expect(withCircuitBreaker(operation, state)).rejects.toThrow();
      await expect(withCircuitBreaker(operation, state)).rejects.toThrow();
      
      expect(state.status).toBe('open');
      await expect(withCircuitBreaker(operation, state)).rejects.toThrow('Circuit breaker is open');
    });

    it('should half-open circuit after timeout', async () => {
      const state = createCircuitBreakerState(1, 10);
      const operation = jest.fn().mockRejectedValue(new Error('fail'));
      
      await expect(withCircuitBreaker(operation, state)).rejects.toThrow();
      expect(state.status).toBe('open');
      
      await new Promise(resolve => setTimeout(resolve, 20));
      
      state.lastFailureTime = 0;
      const successOp = jest.fn().mockResolvedValue('success');
      const result = await withCircuitBreaker(successOp, state);
      
      expect(result).toBe('success');
      expect(state.status).toBe('closed');
    });
  });

  describe('AsyncOperationQueue', () => {
    it('should execute operations in order', async () => {
      const queue = new AsyncOperationQueue(1);
      const results: number[] = [];
      
      for (let i = 1; i <= 3; i++) {
        const value = i;
        queue.enqueue(async () => { 
          results.push(value); 
          await new Promise(resolve => setTimeout(resolve, 10));
          return value; 
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(results).toEqual([1, 2, 3]);
    });

    it('should respect concurrency limit', async () => {
      const queue = new AsyncOperationQueue(2);
      let activeCount = 0;
      let maxActive = 0;
      
      for (let i = 0; i < 5; i++) {
        queue.enqueue(async () => {
          activeCount++;
          maxActive = Math.max(maxActive, activeCount);
          await new Promise(resolve => setTimeout(resolve, 20));
          activeCount--;
          return i;
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(maxActive).toBeLessThanOrEqual(2);
    });

    it('should clear pending operations', async () => {
      const queue = new AsyncOperationQueue(1);
      
      queue.enqueue(async () => { await new Promise(r => setTimeout(r, 100)); return 1; });
      queue.enqueue(async () => { await new Promise(r => setTimeout(r, 100)); return 2; });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(queue.size).toBeLessThanOrEqual(2);
      
      queue.clear();
      
      expect(queue.size).toBe(0);
    });
  });
});
