import { NextRequest, NextResponse } from 'next/server';
import { calculateDelayPrediction } from '@/lib/delay-prediction';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const airline = searchParams.get('airline');
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const scheduledTime = searchParams.get('scheduledTime');

  if (!airline) {
    return NextResponse.json(
      { error: 'Airline parameter is required' },
      { status: 400 }
    );
  }

  try {
    const prediction = await calculateDelayPrediction(
      airline,
      origin || '',
      destination || '',
      scheduledTime ? new Date(scheduledTime) : new Date()
    );

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error calculating prediction:', error);
    return NextResponse.json(
      { error: 'Failed to calculate prediction' },
      { status: 500 }
    );
  }
}
