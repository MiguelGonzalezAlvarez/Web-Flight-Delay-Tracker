export interface FlightDTO {
  id: string;
  icao24: string;
  callsign: string;
  origin: string;
  destination: string;
  airline: string;
  departureTime: string | null;
  arrivalTime: string | null;
  estimatedTime: string | null;
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'delayed' | 'cancelled' | 'unknown';
  latitude?: number;
  longitude?: number;
}

export interface DelayPredictionDTO {
  percentage: number;
  avgDelayMinutes: number;
  basedOnRecords: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface FlightWithPredictionDTO extends FlightDTO {
  delayPrediction: DelayPredictionDTO;
}

export interface FlightsResponseDTO {
  airport: string;
  type: 'departures' | 'arrivals';
  count: number;
  flights: FlightWithPredictionDTO[];
}

export interface PredictionRequestDTO {
  airline: string;
  origin?: string;
  destination?: string;
  scheduledTime?: string;
}

export interface ApiErrorDTO {
  error: string;
  message: string;
  retryAfter?: number;
}

export interface RateLimitHeaders {
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After'?: string;
}
