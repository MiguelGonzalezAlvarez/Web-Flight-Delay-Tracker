import { FlightDTO, FlightWithPredictionDTO, DelayPredictionDTO, FlightsResponseDTO } from './dto';
import { fetchFlightsByAirport } from '../../lib/opensky';
import { calculateDelayPrediction } from '../../lib/delay-prediction';
import { Flight } from '../domain/entities/Flight';
import { DelayPrediction } from '../domain/entities/DelayPrediction';
import { FlightMapper } from '../infrastructure/mappers/FlightMapper';
import { DelayPredictionMapper } from '../infrastructure/mappers/DelayPredictionMapper';
import { Result } from '../domain/value-objects/Result';
import { ValidationError } from '../domain/value-objects/ValidationError';

export interface FlightSearchParams {
  airport: string;
  type: 'departures' | 'arrivals';
}

export class FlightApiService {
  async getFlights(params: FlightSearchParams): Promise<FlightsResponseDTO> {
    const { airport, type } = params;

    const rawFlights = await fetchFlightsByAirport(airport, type);

    const flightsWithPrediction = await Promise.all(
      rawFlights.slice(0, 100).map(async (rawFlight) => {
        const prediction = await calculateDelayPrediction(
          rawFlight.airline,
          type === 'departures' ? airport : rawFlight.origin,
          type === 'arrivals' ? airport : rawFlight.destination,
          rawFlight.departureTime ? new Date(rawFlight.departureTime) : new Date()
        );

        const flightDTO: FlightDTO = {
          id: rawFlight.id,
          icao24: rawFlight.icao24,
          callsign: rawFlight.callsign,
          origin: rawFlight.origin,
          destination: rawFlight.destination,
          airline: rawFlight.airline,
          departureTime: rawFlight.departureTime,
          arrivalTime: rawFlight.arrivalTime,
          estimatedTime: rawFlight.estimatedTime,
          status: rawFlight.status,
          latitude: rawFlight.latitude,
          longitude: rawFlight.longitude,
        };

        const flightWithPrediction: FlightWithPredictionDTO = {
          ...flightDTO,
          delayPrediction: prediction,
        };

        return flightWithPrediction;
      })
    );

    return {
      airport,
      type,
      count: flightsWithPrediction.length,
      flights: flightsWithPrediction,
    };
  }

  async searchFlight(callsign: string): Promise<FlightDTO | null> {
    const { searchFlight } = await import('../../lib/opensky');
    const rawFlight = await searchFlight(callsign);

    if (!rawFlight) {
      return null;
    }

    return {
      id: rawFlight.id,
      icao24: rawFlight.icao24,
      callsign: rawFlight.callsign,
      origin: rawFlight.origin,
      destination: rawFlight.destination,
      airline: rawFlight.airline,
      departureTime: rawFlight.departureTime,
      arrivalTime: rawFlight.arrivalTime,
      estimatedTime: rawFlight.estimatedTime,
      status: rawFlight.status,
      latitude: rawFlight.latitude,
      longitude: rawFlight.longitude,
    };
  }

  toFlightEntity(dto: FlightDTO): Result<Flight, ValidationError> {
    return FlightMapper.toEntity(dto);
  }

  toDelayPredictionEntity(dto: DelayPredictionDTO): Result<DelayPrediction, ValidationError> {
    return DelayPredictionMapper.toEntity(dto);
  }
}

export class PredictionApiService {
  async getPrediction(
    airline: string,
    origin: string,
    destination: string,
    scheduledTime: Date
  ): Promise<DelayPredictionDTO> {
    return calculateDelayPrediction(airline, origin, destination, scheduledTime);
  }
}

let flightApiServiceInstance: FlightApiService | null = null;
let predictionApiServiceInstance: PredictionApiService | null = null;

export function getFlightApiService(): FlightApiService {
  if (!flightApiServiceInstance) {
    flightApiServiceInstance = new FlightApiService();
  }
  return flightApiServiceInstance;
}

export function getPredictionApiService(): PredictionApiService {
  if (!predictionApiServiceInstance) {
    predictionApiServiceInstance = new PredictionApiService();
  }
  return predictionApiServiceInstance;
}
