export interface OpenSkyFlight {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

export interface OpenSkyStateVector {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

export interface OpenSkyResponse {
  time: number;
  states: OpenSkyStateVector[] | null;
}

export interface OpenSkyFlightFilter {
  icao24?: string | string[];
  callsign?: string;
  time?: number;
}

export interface OpenSkyBounds {
  lamin: number;
  lomin: number;
  lamax: number;
  lomax: number;
}

export function isSpanishFlight(flight: OpenSkyStateVector): boolean {
  return flight.origin_country === 'Spain';
}

export function isSpanishIcao24(icao24: string): boolean {
  const spanishPrefixes = ['LE', 'GC'];
  return spanishPrefixes.some(prefix => icao24.toUpperCase().startsWith(prefix));
}

export function normalizeCallsign(callsign: string | null): string | null {
  if (!callsign) return null;
  const trimmed = callsign.trim();
  if (!trimmed) return null;
  return trimmed.toUpperCase().replace(/\s+/g, '');
}
