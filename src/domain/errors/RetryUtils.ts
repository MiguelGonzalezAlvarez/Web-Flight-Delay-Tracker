import { isRetryableError } from './AppError';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: (new (...args: unknown[]) => Error)[];
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: [],
  onRetry: () => {},
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;
  let delay = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === opts.maxAttempts) {
        break;
      }

      const isRetryable = 
        opts.retryableErrors.some((errClass) => lastError instanceof errClass) ||
        isRetryableError(lastError);

      if (!isRetryable) {
        throw lastError;
      }

      opts.onRetry(attempt, lastError, delay);
      
      await sleep(delay);
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  throw lastError!;
}

export async function withCircuitBreaker<T>(
  operation: () => Promise<T>,
  state: CircuitBreakerState
): Promise<T> {
  if (state.status === 'open') {
    if (Date.now() - state.lastFailureTime >= state.resetTimeout) {
      state.status = 'half-open';
    } else {
      throw new Error('Circuit breaker is open');
    }
  }

  try {
    const result = await operation();
    if (state.status === 'half-open') {
      state.status = 'closed';
      state.failureCount = 0;
    }
    return result;
  } catch (error) {
    state.failureCount++;
    state.lastFailureTime = Date.now();

    if (state.failureCount >= state.failureThreshold) {
      state.status = 'open';
    }

    throw error;
  }
}

export interface CircuitBreakerState {
  status: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: number;
  failureThreshold: number;
  resetTimeout: number;
}

export function createCircuitBreakerState(
  failureThreshold: number = 5,
  resetTimeout: number = 60000
): CircuitBreakerState {
  return {
    status: 'closed',
    failureCount: 0,
    lastFailureTime: 0,
    failureThreshold,
    resetTimeout,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AsyncOperationQueue {
  private queue: Array<() => Promise<void>> = [];
  private running = false;
  private concurrency: number;
  private activeCount = 0;

  constructor(concurrency: number = 1) {
    this.concurrency = concurrency;
  }

  async enqueue<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.running || this.activeCount >= this.concurrency) {
      return;
    }

    this.running = true;

    while (this.queue.length > 0 && this.activeCount < this.concurrency) {
      this.activeCount++;
      const operation = this.queue.shift()!;
      operation().finally(() => {
        this.activeCount--;
        this.process();
      });
    }

    this.running = false;
  }

  get size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}
