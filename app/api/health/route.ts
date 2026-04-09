import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/api-utils';

async function handler(
  request: NextRequest,
  _context: { identifier: string }
): Promise<NextResponse> {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}

export const GET = withRateLimit(handler, {
  maxRequests: 60,
  windowMs: 60 * 1000,
});

export const OPTIONS = withRateLimit(handler, {
  maxRequests: 60,
  windowMs: 60 * 1000,
});
