import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/middleware/rateLimit';
import { getCorsHeaders, isCorsPreflightRequest } from '@/lib/cors';

export interface WithRateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
}

export function withRateLimit(
  handler: (request: NextRequest, context: { identifier: string }) => Promise<NextResponse>,
  options: WithRateLimitOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (isCorsPreflightRequest(request)) {
      return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(request),
      });
    }

    const identifier = getClientIdentifier(request);
    const result = await rateLimit(request, {
      maxRequests: options.maxRequests,
      windowMs: options.windowMs,
    });

    const headers = getCorsHeaders(request);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil(result.resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': String(Math.ceil(result.resetIn / 1000)),
            'X-RateLimit-Limit': String(result.total),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(Date.now() + result.resetIn),
          },
        }
      );
    }

    const response = await handler(request, { identifier });

    response.headers.set('X-RateLimit-Limit', String(result.total));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(Date.now() + result.resetIn));

    return response;
  };
}
