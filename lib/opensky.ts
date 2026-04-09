import { OpenSkyService, OPENSKY_BOUNDS_SPAIN, FlightTrackerConfig } from '@/src/infrastructure/api/OpenSkyService';
import { OpenSkyStateVector } from '@/src/infrastructure/api/OpenSkyTypes';
import { getAirlineName } from '@/src/domain/services/AirlineService';

const SPANISH_AIRPORT_CODES = [
  'LEMD', 'LEBL', 'LEAL', 'LEMG', 'LEVX', 'LEJR', 'LEIB', 'LEAM', 'LEZL', 'LEPA',
  'LERS', 'LEGR', 'LEAS', 'LEBB', 'LEPP', 'LECO', 'LEST', 'LEXJ', 'LEVT', 'LEBA',
  'LERI', 'LEMO', 'LEGE', 'LETO', 'LEFA', 'GCRR', 'GCXO', 'GCTS', 'GCGM', 'GCLP',
  'LEAB', 'LEMR', 'LERG'
];

let serviceInstance: OpenSkyService | null = null;

function getService(): OpenSkyService {
  if (!serviceInstance) {
    serviceInstance = new OpenSkyService();
  }
  return serviceInstance;
}

export function configureOpenSkyService(config: FlightTrackerConfig): void {
  serviceInstance = new OpenSkyService(config);
}

function extractAirlineFromCallsign(callsign: string): string {
  return getAirlineName(callsign);
}

export async function fetchFlightsByAirport(icao: string, type: 'departures' | 'arrivals'): Promise<import('@/types').Flight[]> {
  try {
    const service = getService();
    const now = Math.floor(Date.now() / 1000);
    const begin = now - 3600;
    const end = now + 7200;

    let result;
    if (type === 'departures') {
      result = await service.getDeparturesByAirport(icao, begin, end);
    } else {
      result = await service.getArrivalsByAirport(icao, begin, end);
    }

    if (!result.ok) {
      console.error(`OpenSky API error for ${icao}:`, result.error);
      return [];
    }

    return result.value.map((flight) => {
      const callsign = flight.callsign || 'UNKNOWN';
      return {
        id: `${flight.icao24}-${flight.last_contact}`,
        icao24: flight.icao24,
        callsign: callsign,
        origin: type === 'arrivals' ? icao : (flight.icao24 || 'Unknown'),
        destination: type === 'departures' ? icao : (flight.icao24 || 'Unknown'),
        airline: extractAirlineFromCallsign(callsign),
        departureTime: flight.time_position ? new Date(flight.time_position * 1000).toISOString() : null,
        arrivalTime: null,
        estimatedTime: null,
        status: flight.on_ground ? 'scheduled' : 'departed',
        latitude: flight.latitude ?? undefined,
        longitude: flight.longitude ?? undefined,
      };
    });
  } catch (error) {
    console.error(`Error fetching ${type} flights for ${icao}:`, error);
    return [];
  }
}

export async function searchFlight(callsign: string): Promise<import('@/types').Flight | null> {
  try {
    const service = getService();
    const normalized = callsign.toUpperCase().replace(/\s/g, '');
    const now = Math.floor(Date.now() / 1000);
    const begin = now - 86400;
    const end = now + 86400;

    const departures = await service.getDeparturesByAirport('', begin, end);
    const arrivals = await service.getArrivalsByAirport('', begin, end);

    if (!departures.ok || !arrivals.ok) {
      return null;
    }

    const allFlights = [...departures.value, ...arrivals.value];
    const matches = allFlights.filter(
      (f) => f.callsign && f.callsign.toUpperCase().replace(/\s/g, '').startsWith(normalized)
    );

    if (matches.length === 0) {
      return null;
    }

    const flight = matches[0];
    const flightCallsign = flight.callsign || callsign.toUpperCase();
    return {
      id: `${flight.icao24}-${flight.last_contact}`,
      icao24: flight.icao24,
      callsign: flightCallsign,
      origin: flight.icao24,
      destination: flight.icao24,
      airline: extractAirlineFromCallsign(flightCallsign),
      departureTime: flight.time_position ? new Date(flight.time_position * 1000).toISOString() : null,
      arrivalTime: null,
      estimatedTime: null,
      status: flight.on_ground ? 'scheduled' : 'departed',
      latitude: flight.latitude ?? undefined,
      longitude: flight.longitude ?? undefined,
    };
  } catch (error) {
    console.error('Error searching flight:', error);
    return null;
  }
}

export function isSpanishAirport(icao: string): boolean {
  return SPANISH_AIRPORT_CODES.includes(icao.toUpperCase());
}

export function resetOpenSkyService(): void {
  serviceInstance = null;
}

export { OPENSKY_BOUNDS_SPAIN };
export type { FlightTrackerConfig };
