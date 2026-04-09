import { withRetry, withCircuitBreaker, createCircuitBreakerState } from '../../domain/errors/RetryUtils';
import { NetworkError } from '../../domain/errors/AppError';

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message?: string;
}

export type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: NetworkError };

export function apiSuccess<T>(value: T): ApiResult<T> {
  return { ok: true, value };
}

export function apiFailure<T>(error: NetworkError): ApiResult<T> {
  return { ok: false, error };
}

export class ApiClient {
  private config: Required<ApiClientConfig>;
  private circuitBreaker = createCircuitBreakerState(5, 60000);

  constructor(config: ApiClientConfig) {
    this.config = {
      baseUrl: config.baseUrl.replace(/\/$/, ''),
      timeout: config.timeout ?? 30000,
      headers: config.headers ?? {},
      retries: config.retries ?? 3,
    };
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<ApiResult<T>> {
    const url = this.buildUrl(endpoint, params);
    
    try {
      const result = await withRetry(
        () => withCircuitBreaker(
          () => this.request<T>('GET', url),
          this.circuitBreaker
        ),
        {
          maxAttempts: this.config.retries,
          initialDelayMs: 1000,
          onRetry: (attempt, error) => {
            console.warn(`Retry attempt ${attempt} for ${url}:`, error.message);
          },
        }
      );

      return apiSuccess(result);
    } catch (error) {
      if (error instanceof NetworkError) {
        return apiFailure(error);
      }
      return apiFailure(new NetworkError(
        error instanceof Error ? error.message : 'Unknown error',
        url
      ));
    }
  }

  async post<T, B = unknown>(
    endpoint: string,
    body?: B
  ): Promise<ApiResult<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    try {
      const result = await withRetry(
        () => withCircuitBreaker(
          () => this.request<T>('POST', url, body),
          this.circuitBreaker
        ),
        {
          maxAttempts: this.config.retries,
          initialDelayMs: 1000,
        }
      );

      return apiSuccess(result);
    } catch (error) {
      if (error instanceof NetworkError) {
        return apiFailure(error);
      }
      return apiFailure(new NetworkError(
        error instanceof Error ? error.message : 'Unknown error',
        url
      ));
    }
  }

  private async request<T>(
    method: 'GET' | 'POST',
    url: string,
    body?: unknown
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new NetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          url,
          response.status,
          response.status >= 500
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('Request timeout', url, undefined, true);
      }

      if (error instanceof NetworkError) {
        throw error;
      }

      throw new NetworkError(
        error instanceof Error ? error.message : 'Network request failed',
        url
      );
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    if (!params) {
      return url;
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.append(key, String(value));
    }

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  getCircuitBreakerStatus(): typeof this.circuitBreaker {
    return this.circuitBreaker;
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
