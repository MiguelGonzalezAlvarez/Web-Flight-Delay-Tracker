import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter, getClientIdentifier } from '@/lib/middleware/rateLimit';
import { sanitizeIcao, validateIcao, validateFlightType } from '@/lib/middleware/validation';
import { getFlightApiService } from '@/src/api/FlightApiService';
import type { FlightsResponseDTO, ApiErrorDTO } from '@/src/api/dto';

const rateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyPrefix: 'flights',
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
  const airportParam = searchParams.get('airport');
  const typeParam = searchParams.get('type');

  if (!airportParam) {
    const errorResponse: ApiErrorDTO = {
      error: 'Airport parameter is required',
      message: 'The airport parameter is required.',
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const airport = sanitizeIcao(airportParam);

  if (!validateIcao(airport)) {
    const errorResponse: ApiErrorDTO = {
      error: 'Invalid airport code',
      message: 'Airport must be a valid 4-character ICAO code',
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  if (!typeParam || !validateFlightType(typeParam)) {
    const errorResponse: ApiErrorDTO = {
      error: 'Type parameter is required',
      message: 'Type must be "departures" or "arrivals"',
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  try {
    const flightService = getFlightApiService();
    const response = await flightService.getFlights({
      airport,
      type: typeParam as 'departures' | 'arrivals',
    });

    const typedResponse = response as FlightsResponseDTO;

    return NextResponse.json(
      typedResponse,
      {
        headers: {
          'X-RateLimit-Remaining': result.remaining.toString(),
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching flights:', error);
    const errorResponse: ApiErrorDTO = {
      error: 'Failed to fetch flights',
      message: 'An unexpected error occurred while fetching flights',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
