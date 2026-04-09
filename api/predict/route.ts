import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter, getClientIdentifier } from '@/lib/middleware/rateLimit';
import { sanitizeString, validateCallsign } from '@/lib/middleware/validation';
import { getPredictionApiService } from '@/src/api/FlightApiService';
import type { DelayPredictionDTO, ApiErrorDTO } from '@/src/api/dto';

const rateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyPrefix: 'predict',
});

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const result = await rateLimiter.check(clientId);

  if (!result.success) {
    const errorResponse: ApiErrorDTO = {
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(result.resetIn / 1000),
    };

    return NextResponse.json(
      errorResponse,
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
          'Retry-After': Math.ceil(result.resetIn / 1000).toString(),
        },
      }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const airline = searchParams.get('airline');
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const scheduledTimeStr = searchParams.get('scheduledTime');

  if (!airline) {
    const errorResponse: ApiErrorDTO = {
      error: 'Airline parameter is required',
      message: 'The airline parameter is required.',
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const sanitizedAirline = sanitizeString(airline);

  if (!validateCallsign(sanitizedAirline)) {
    const errorResponse: ApiErrorDTO = {
      error: 'Invalid airline parameter',
      message: 'Airline must be a valid airline code or name',
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  let scheduledTime: Date;
  if (scheduledTimeStr) {
    try {
      scheduledTime = new Date(scheduledTimeStr);
      if (isNaN(scheduledTime.getTime())) {
        throw new Error('Invalid date');
      }
    } catch {
      const errorResponse: ApiErrorDTO = {
        error: 'Invalid scheduledTime format',
        message: 'scheduledTime must be a valid ISO date string',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
  } else {
    scheduledTime = new Date();
  }

  try {
    const predictionService = getPredictionApiService();
    const prediction = await predictionService.getPrediction(
      sanitizedAirline,
      origin ? sanitizeString(origin) : '',
      destination ? sanitizeString(destination) : '',
      scheduledTime
    );

    const typedResponse = prediction as DelayPredictionDTO;
    return NextResponse.json(typedResponse);
  } catch (error) {
    console.error('Error calculating prediction:', error);
    const errorResponse: ApiErrorDTO = {
      error: 'Failed to calculate prediction',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
