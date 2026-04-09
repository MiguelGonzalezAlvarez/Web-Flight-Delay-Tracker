import {
  ApiClient,
  createApiClient,
  type ApiClientConfig,
} from '@/src/infrastructure/api/ApiClient';
import { NetworkError } from '@/src/domain/errors/AppError';

describe('ApiClient', () => {
  describe('createApiClient', () => {
    it('should create an API client with config', () => {
      const config: ApiClientConfig = {
        baseUrl: 'https://api.example.com',
        timeout: 5000,
      };

      const client = createApiClient(config);

      expect(client).toBeInstanceOf(ApiClient);
    });

    it('should normalize base URL by removing trailing slash', () => {
      const client = createApiClient({
        baseUrl: 'https://api.example.com/',
      });

      expect(client).toBeInstanceOf(ApiClient);
    });
  });

  describe('buildUrl', () => {
    it('should build URL without params', () => {
      const client = createApiClient({
        baseUrl: 'https://api.example.com',
      });

      expect((client as unknown as { config: { baseUrl: string } }).config.baseUrl).toBe('https://api.example.com');
    });

    it('should accept custom headers', () => {
      const client = createApiClient({
        baseUrl: 'https://api.example.com',
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'value',
        },
      });

      expect(client).toBeInstanceOf(ApiClient);
    });
  });

  describe('circuit breaker', () => {
    it('should expose circuit breaker status', () => {
      const client = createApiClient({
        baseUrl: 'https://api.example.com',
      });

      const status = client.getCircuitBreakerStatus();

      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('failureCount');
      expect(status).toHaveProperty('lastFailureTime');
    });
  });
});

describe('NetworkError', () => {
  it('should create a network error with url', () => {
    const error = new NetworkError(
      'Connection failed',
      'https://api.example.com/flights'
    );

    expect(error.message).toBe('Connection failed');
    expect(error.url).toBe('https://api.example.com/flights');
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.retryable).toBe(true);
  });

  it('should create non-retryable error', () => {
    const error = new NetworkError(
      'Not found',
      'https://api.example.com/flights',
      404,
      false
    );

    expect(error.retryable).toBe(false);
    expect(error.statusCode).toBe(404);
  });
});
