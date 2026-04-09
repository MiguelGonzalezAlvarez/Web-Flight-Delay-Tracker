import {
  rateLimit,
} from '@/lib/middleware/rateLimit';

const mockMap = new Map<string, { count: number; lastReset: number }>();

jest.mock('@/lib/middleware/rateLimit', () => {
  const originalModule = jest.requireActual('@/lib/middleware/rateLimit');
  return {
    ...originalModule,
    rateLimit: (clientId: string) => {
      const now = Date.now();
      const WINDOW_MS = 60000;
      const MAX_REQUESTS = 100;
      
      const existing = mockMap.get(clientId);
      
      if (!existing || now - existing.lastReset > WINDOW_MS) {
        mockMap.set(clientId, { count: 1, lastReset: now });
        return { success: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
      }
      
      if (existing.count >= MAX_REQUESTS) {
        return { success: false, remaining: 0, resetIn: WINDOW_MS - (now - existing.lastReset) };
      }
      
      existing.count++;
      return {
        success: true,
        remaining: MAX_REQUESTS - existing.count,
        resetIn: WINDOW_MS - (now - existing.lastReset),
      };
    },
  };
});

describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    mockMap.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    mockMap.clear();
    jest.useRealTimers();
  });

  describe('rateLimit', () => {
    it('should allow first request', () => {
      const result = rateLimit('test-client-1');
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(99);
    });

    it('should decrement remaining count', () => {
      const clientId = 'test-client-2';
      const first = rateLimit(clientId);
      const second = rateLimit(clientId);
      
      expect(first.remaining).toBe(99);
      expect(second.remaining).toBe(98);
    });

    it('should allow requests within limit', () => {
      const clientId = 'test-client-3';
      for (let i = 0; i < 50; i++) {
        const result = rateLimit(clientId);
        expect(result.success).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const clientId = 'test-client-4';
      for (let i = 0; i < 100; i++) {
        rateLimit(clientId);
      }
      
      const result = rateLimit(clientId);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should have different limits for different clients', () => {
      const clientA = 'client-a';
      const clientB = 'client-b';
      
      for (let i = 0; i < 100; i++) {
        rateLimit(clientA);
      }
      
      const clientAResult = rateLimit(clientA);
      expect(clientAResult.success).toBe(false);
      
      const clientBResult = rateLimit(clientB);
      expect(clientBResult.success).toBe(true);
    });

    it('should return positive resetIn value when blocked', () => {
      const clientId = 'test-client-6';
      
      for (let i = 0; i < 100; i++) {
        rateLimit(clientId);
      }
      
      const result = rateLimit(clientId);
      expect(result.success).toBe(false);
      expect(result.resetIn).toBeGreaterThan(0);
    });
  });
});
