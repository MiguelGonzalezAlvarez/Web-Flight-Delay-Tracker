import { NextRequest, NextResponse } from 'next/server';
import { fetchFlightsByAirport } from '@/lib/opensky';
import { calculateDelayPrediction } from '@/lib/delay-prediction';
import { getAirlineName } from '@/lib/airports';
import { Flight } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const airport = searchParams.get('airport');
  const type = searchParams.get('type') as 'departures' | 'arrivals';

  if (!airport) {
    return NextResponse.json(
      { error: 'Airport parameter is required' },
      { status: 400 }
    );
  }

  if (!type || !['departures', 'arrivals'].includes(type)) {
    return NextResponse.json(
      { error: 'Type parameter is required (departures or arrivals)' },
      { status: 400 }
    );
  }

  try {
    const flights = await fetchFlightsByAirport(airport.toUpperCase(), type);

    const flightsWithPrediction = await Promise.all(
      flights.map(async (flight) => {
        const prediction = await calculateDelayPrediction(
          flight.airline,
          type === 'departures' ? airport.toUpperCase() : flight.origin,
          type === 'arrivals' ? airport.toUpperCase() : flight.destination,
          flight.departureTime ? new Date(flight.departureTime) : new Date()
        );
        return {
          ...flight,
          delayPrediction: prediction,
        };
      })
    );

    return NextResponse.json({
      airport,
      type,
      count: flightsWithPrediction.length,
      flights: flightsWithPrediction,
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flights' },
      { status: 500 }
    );
  }
}
