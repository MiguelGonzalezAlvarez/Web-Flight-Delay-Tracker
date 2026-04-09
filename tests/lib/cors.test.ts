import { getCorsHeaders, isCorsPreflightRequest } from '@/lib/cors';

function createMockRequest(options: {
  method?: string;
  origin?: string;
  headers?: Record<string, string>;
}): Request {
  return {
    method: options.method || 'GET',
    headers: {
      get: (name: string) => {
        const headerMap: Record<string, string> = {
          origin: options.origin || '',
          ...options.headers,
        };
        return headerMap[name.toLowerCase()] || headerMap[name] || null;
      },
      has: (name: string) => {
        const headerMap: Record<string, string> = {
          origin: options.origin || '',
          ...options.headers,
        };
        return name.toLowerCase() in headerMap || name in headerMap;
      },
    },
  } as unknown as Request;
}

describe('CORS utilities', () => {
  describe('getCorsHeaders', () => {
    it('should return default CORS headers', () => {
      const request = createMockRequest({
        origin: 'http://localhost:3000',
      });

      const headers = getCorsHeaders(request);

      expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
      expect(headers['Access-Control-Allow-Methods']).toContain('GET');
      expect(headers['Access-Control-Allow-Methods']).toContain('POST');
      expect(headers['Access-Control-Allow-Headers']).toContain('Content-Type');
    });

    it('should allow custom methods', () => {
      const request = createMockRequest({
        origin: 'http://localhost:3000',
      });

      const headers = getCorsHeaders(request, {
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
      });

      expect(headers['Access-Control-Allow-Methods']).toBe('GET, POST, PUT, DELETE');
    });

    it('should allow custom headers', () => {
      const request = createMockRequest({
        origin: 'http://localhost:3000',
      });

      const headers = getCorsHeaders(request, {
        headers: ['Authorization', 'X-Custom-Header'],
      });

      expect(headers['Access-Control-Allow-Headers']).toBe('Authorization, X-Custom-Header');
    });

    it('should set max age header', () => {
      const request = createMockRequest({
        origin: 'http://localhost:3000',
      });

      const headers = getCorsHeaders(request, {
        maxAge: 3600,
      });

      expect(headers['Access-Control-Max-Age']).toBe('3600');
    });

    it('should allow credentials by default', () => {
      const request = createMockRequest({
        origin: 'http://localhost:3000',
      });

      const headers = getCorsHeaders(request);

      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });

    it('should not allow credentials when disabled', () => {
      const request = createMockRequest({
        origin: 'http://localhost:3000',
      });

      const headers = getCorsHeaders(request, {
        credentials: false,
      });

      expect(headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });

    it('should block disallowed origins', () => {
      const request = createMockRequest({
        origin: 'http://malicious-site.com',
      });

      const headers = getCorsHeaders(request);

      expect(headers['Access-Control-Allow-Origin']).toBe('');
    });
  });

  describe('isCorsPreflightRequest', () => {
    it('should identify OPTIONS request with Access-Control-Request-Method', () => {
      const request = createMockRequest({
        method: 'OPTIONS',
        headers: { 'Access-Control-Request-Method': 'POST' },
      });

      expect(isCorsPreflightRequest(request)).toBe(true);
    });

    it('should return false for GET request', () => {
      const request = createMockRequest({
        method: 'GET',
      });

      expect(isCorsPreflightRequest(request)).toBe(false);
    });

    it('should return false for POST request', () => {
      const request = createMockRequest({
        method: 'POST',
      });

      expect(isCorsPreflightRequest(request)).toBe(false);
    });

    it('should return false for OPTIONS without Access-Control header', () => {
      const request = createMockRequest({
        method: 'OPTIONS',
      });

      expect(isCorsPreflightRequest(request)).toBe(false);
    });
  });
});
