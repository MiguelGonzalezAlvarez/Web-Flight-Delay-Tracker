import { NextRequest, NextResponse } from 'next/server';
import { calculateDelayPrediction } from '@/lib/delay-prediction';
import { rateLimit, getClientIdentifier } from '@/lib/middleware/rateLimit';
import { sanitizeString, validateCallsign } from '@/lib/middleware/validation';

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
      { status: 429 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const airline = searchParams.get('airline');
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const scheduledTimeStr = searchParams.get('scheduledTime');

  if (!airline) {
    return NextResponse.json(
      { error: 'Airline parameter is required' },
      { status: 400 }
    );
  }

  const sanitizedAirline = sanitizeString(airline);

  if (!validateCallsign(sanitizedAirline)) {
    return NextResponse.json(
      {
        error: 'Invalid airline parameter',
        message: 'Airline must be a valid airline code or name',
      },
      { status: 400 }
    );
  }

  let scheduledTime: Date;
  if (scheduledTimeStr) {
    try {
      scheduledTime = new Date(scheduledTimeStr);
      if (isNaN(scheduledTime.getTime())) {
        throw new Error('Invalid date');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid scheduledTime format', message: 'scheduledTime must be a valid ISO date string' },
        { status: 400 }
      );
    }
  } else {
    scheduledTime = new Date();
  }

  try {
    const prediction = await calculateDelayPrediction(
      sanitizedAirline,
      origin ? sanitizeString(origin) : '',
      destination ? sanitizeString(destination) : '',
      scheduledTime
    );

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error calculating prediction:', error);
    return NextResponse.json(
      { error: 'Failed to calculate prediction', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
