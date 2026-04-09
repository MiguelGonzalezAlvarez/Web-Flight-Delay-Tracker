import { RateLimiter, getClientIdentifier } from '@/lib/middleware/rateLimit';

describe('RateLimiter', () => {
  describe('check', () => {
    it('should allow requests within limit', async () => {
      const limiter = new RateLimiter({
        windowMs: 1000,
        maxRequests: 3,
        keyPrefix: `allow-${Date.now()}`,
      });

      const result = await limiter.check('user-1');

      expect(result.success).toBe(true);
      expect(result.total).toBe(3);
      limiter.destroy();
    });

    it('should track multiple requests from same identifier', async () => {
      const limiter = new RateLimiter({
        windowMs: 1000,
        maxRequests: 3,
        keyPrefix: `multi-${Date.now()}`,
      });

      const r1 = await limiter.check('user-1');
      expect(r1.success).toBe(true);

      const r2 = await limiter.check('user-1');
      expect(r2.success).toBe(true);

      const r3 = await limiter.check('user-1');
      expect(r3.success).toBe(true);
      expect(r3.remaining).toBe(0);

      limiter.destroy();
    });

    it('should block requests exceeding limit', async () => {
      const limiter = new RateLimiter({
        windowMs: 1000,
        maxRequests: 2,
        keyPrefix: `block-${Date.now()}`,
      });

      await limiter.check('user-1');
      await limiter.check('user-1');
      const result = await limiter.check('user-1');

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetIn).toBeGreaterThan(0);

      limiter.destroy();
    });

    it('should track different identifiers separately', async () => {
      const limiter = new RateLimiter({
        windowMs: 1000,
        maxRequests: 2,
        keyPrefix: `sep-${Date.now()}`,
      });

      await limiter.check('user-1');
      await limiter.check('user-1');
      const result1 = await limiter.check('user-2');

      expect(result1.success).toBe(true);

      limiter.destroy();
    });

    it('should reset after window expires', async () => {
      const fastLimiter = new RateLimiter({
        windowMs: 50,
        maxRequests: 1,
        keyPrefix: `reset-${Date.now()}`,
      });

      await fastLimiter.check('user-reset');
      const blocked = await fastLimiter.check('user-reset');
      expect(blocked.success).toBe(false);

      await new Promise(resolve => setTimeout(resolve, 60));

      const allowed = await fastLimiter.check('user-reset');
      expect(allowed.success).toBe(true);

      fastLimiter.destroy();
    });
  });
});

describe('getClientIdentifier', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const mockHeaders = new Map<string, string>();
    mockHeaders.set('x-forwarded-for', '192.168.1.1, 10.0.0.1');
    
    const identifier = getClientIdentifier({
      headers: {
        get: (name: string) => mockHeaders.get(name) || null,
      },
    } as Request);

    expect(identifier).toBe('192.168.1.1');
  });

  it('should return unknown when no headers present', () => {
    const identifier = getClientIdentifier({
      headers: {
        get: () => null,
      },
    } as Request);

    expect(identifier).toBe('unknown');
  });

  it('should handle single IP in x-forwarded-for', () => {
    const mockHeaders = new Map<string, string>();
    mockHeaders.set('x-forwarded-for', '192.168.1.1');
    
    const identifier = getClientIdentifier({
      headers: {
        get: (name: string) => mockHeaders.get(name) || null,
      },
    } as Request);

    expect(identifier).toBe('192.168.1.1');
  });
});
