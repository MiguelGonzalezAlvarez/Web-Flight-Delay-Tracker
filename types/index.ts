export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface Flight {
  id: string;
  icao24: string;
  callsign: string;
  origin: string;
  destination: string;
  airline: string;
  departureTime: string | null;
  arrivalTime: string | null;
  estimatedTime: string | null;
  status: FlightStatus;
  latitude?: number;
  longitude?: number;
  delayPrediction?: DelayPrediction;
}

export type FlightStatus = 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'delayed' | 'cancelled' | 'unknown';

export interface DelayPrediction {
  percentage: number;
  avgDelayMinutes: number;
  basedOnRecords: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface OpenSkyFlight {
  icao24: string;
  callsign: string;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  long: number;
  lat: number;
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

export interface OpenSkyState {
  icao24: string;
  callsign: string;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  long: number;
  lat: number;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

export interface FlightFilters {
  airport: string;
  type: 'departures' | 'arrivals';
  airline?: string;
  date?: string;
}
