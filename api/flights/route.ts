import { NextRequest, NextResponse } from 'next/server';
import { fetchFlightsByAirport } from '@/lib/opensky';
import { calculateDelayPrediction } from '@/lib/delay-prediction';
import { rateLimit, getClientIdentifier } from '@/lib/middleware/rateLimit';
import { sanitizeIcao, validateIcao, validateFlightType } from '@/lib/middleware/validation';

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const { success, remaining, resetIn } = rateLimit(clientId);

  if (!success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(resetIn / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(resetIn / 1000).toString(),
          'Retry-After': Math.ceil(resetIn / 1000).toString(),
        },
      }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const airportParam = searchParams.get('airport');
  const typeParam = searchParams.get('type');

  if (!airportParam) {
    return NextResponse.json(
      { error: 'Airport parameter is required' },
      { status: 400 }
    );
  }

  const airport = sanitizeIcao(airportParam);

  if (!validateIcao(airport)) {
    return NextResponse.json(
      {
        error: 'Invalid airport code',
        message: 'Airport must be a valid 4-character ICAO code',
      },
      { status: 400 }
    );
  }

  if (!typeParam || !validateFlightType(typeParam)) {
    return NextResponse.json(
      { error: 'Type parameter is required', message: 'Type must be "departures" or "arrivals"' },
      { status: 400 }
    );
  }

  try {
    const flights = await fetchFlightsByAirport(airport, typeParam);

    const flightsWithPrediction = await Promise.all(
      flights.slice(0, 100).map(async (flight) => {
        const prediction = await calculateDelayPrediction(
          flight.airline,
          typeParam === 'departures' ? airport : flight.origin,
          typeParam === 'arrivals' ? airport : flight.destination,
          flight.departureTime ? new Date(flight.departureTime) : new Date()
        );
        return {
          ...flight,
          delayPrediction: prediction,
        };
      })
    );

    return NextResponse.json(
      {
        airport,
        type: typeParam,
        count: flightsWithPrediction.length,
        flights: flightsWithPrediction,
      },
      {
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Error fetching flights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flights', message: 'An unexpected error occurred while fetching flights' },
      { status: 500 }
    );
  }
}
