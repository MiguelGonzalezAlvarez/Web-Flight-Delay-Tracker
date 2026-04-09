const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

export function rateLimit(identifier: string): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now - record.lastReset > WINDOW_MS) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return { success: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  if (record.count >= MAX_REQUESTS) {
    const resetIn = WINDOW_MS - (now - record.lastReset);
    return { success: false, remaining: 0, resetIn };
  }

  record.count++;
  return {
    success: true,
    remaining: MAX_REQUESTS - record.count,
    resetIn: WINDOW_MS - (now - record.lastReset),
  };
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.lastReset > WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}, WINDOW_MS);
