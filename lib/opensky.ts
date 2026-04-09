import { OpenSkyFlight, Flight } from '@/types';
import { SPANISH_AIRPORTS } from './airports';
import { getAirlineName } from './airports';

const OPEN_SKY_API = 'https://opensky-network.org/api';

const SPANISH_BOUNDARIES = {
  lamin: 27.0,
  lamax: 44.0,
  lomin: -19.0,
  lomax: 5.0,
};

function extractAirlineFromCallsign(callsign: string): string {
  const cleaned = callsign.trim().replace(/\s/g, '').toUpperCase();
  if (cleaned.length >= 3) {
    return getAirlineName(cleaned.substring(0, 3));
  }
  return 'Unknown';
}

export async function fetchFlightsByAirport(icao: string, type: 'departures' | 'arrivals'): Promise<Flight[]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const begin = now - 3600;
    const end = now + 7200;

    const url = `${OPEN_SKY_API}/flights/${type === 'departures' ? 'departure' : 'arrival'}?airport=${icao}&begin=${begin}&end=${end}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenSky API error: ${response.status}`);
    }

    const data: OpenSkyFlight[] = await response.json();

    return data.map(flight => ({
      id: `${flight.icao24}-${flight.last_contact}`,
      icao24: flight.icao24,
      callsign: flight.callsign || 'UNKNOWN',
      origin: type === 'arrivals' ? icao : 'Unknown',
      destination: type === 'departures' ? icao : 'Unknown',
      airline: extractAirlineFromCallsign(flight.callsign || ''),
      departureTime: flight.time_position ? new Date(flight.time_position * 1000).toISOString() : null,
      arrivalTime: null,
      estimatedTime: null,
      status: flight.on_ground ? 'scheduled' : 'departed',
      latitude: flight.lat,
      longitude: flight.long,
    }));
  } catch (error) {
    console.error(`Error fetching ${type} flights for ${icao}:`, error);
    return [];
  }
}

export async function searchFlight(callsign: string): Promise<Flight | null> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const begin = now - 86400;
    const end = now + 86400;

    const url = `${OPEN_SKY_API}/flights/callsign/${callsign.toUpperCase()}?begin=${begin}&end=${end}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data: OpenSkyFlight[] = await response.json();

    if (data.length === 0) {
      return null;
    }

    const flight = data[0];
    return {
      id: `${flight.icao24}-${flight.last_contact}`,
      icao24: flight.icao24,
      callsign: flight.callsign || callsign.toUpperCase(),
      origin: flight.icao24,
      destination: flight.icao24,
      airline: extractAirlineFromCallsign(flight.callsign || ''),
      departureTime: flight.time_position ? new Date(flight.time_position * 1000).toISOString() : null,
      arrivalTime: null,
      estimatedTime: null,
      status: flight.on_ground ? 'scheduled' : 'departed',
      latitude: flight.lat,
      longitude: flight.long,
    };
  } catch (error) {
    console.error('Error searching flight:', error);
    return null;
  }
}

export function isSpanishAirport(icao: string): boolean {
  return SPANISH_AIRPORTS.some(a => a.icao === icao);
}
