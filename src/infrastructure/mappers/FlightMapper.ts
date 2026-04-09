import { Flight, FlightProps } from '../../domain/entities/Flight';
import { DelayPrediction } from '../../domain/entities/DelayPrediction';
import { Result, success, failure } from '../../domain/value-objects/Result';
import { ValidationError } from '../../domain/value-objects/ValidationError';

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
  status: string;
  latitude?: number;
  longitude?: number;
  delayPrediction?: {
    percentage: number;
    riskLevel: 'low' | 'medium' | 'high';
    avgDelayMinutes: number;
    basedOnRecords: number;
  };
}

export class FlightMapper {
  static toEntity(dto: FlightDTO): Result<Flight, ValidationError> {
    const props: FlightProps = {
      id: dto.id,
      callsign: dto.callsign,
      airline: dto.airline,
      origin: dto.origin,
      destination: dto.destination,
      departureTime: dto.departureTime ? new Date(dto.departureTime) : undefined,
      arrivalTime: dto.arrivalTime ? new Date(dto.arrivalTime) : undefined,
      status: dto.status as FlightProps['status'],
    };

    if (dto.delayPrediction) {
      props.delayPrediction = dto.delayPrediction;
    }

    return Flight.create(props);
  }

  static toDTO(entity: Flight): FlightDTO {
    const dto = entity.toPlainObject();
    return {
      id: dto.id,
      icao24: dto.callsign,
      callsign: dto.callsign,
      origin: dto.origin,
      destination: dto.destination,
      airline: dto.airline,
      departureTime: dto.departureTime?.toISOString() || null,
      arrivalTime: dto.arrivalTime?.toISOString() || null,
      estimatedTime: null,
      status: dto.status || 'unknown',
      delayPrediction: dto.delayPrediction,
    };
  }

  static fromRawOpenSky(data: {
    icao24: string;
    callsign: string;
    origin?: string;
    destination?: string;
    airline?: string;
    time_position?: number;
    on_ground?: boolean;
    lat?: number;
    long?: number;
  }): FlightDTO {
    return {
      id: `${data.icao24}-${Date.now()}`,
      icao24: data.icao24,
      callsign: data.callsign || 'UNKNOWN',
      origin: data.origin || 'Unknown',
      destination: data.destination || 'Unknown',
      airline: data.airline || 'Unknown',
      departureTime: data.time_position ? new Date(data.time_position * 1000).toISOString() : null,
      arrivalTime: null,
      estimatedTime: null,
      status: data.on_ground ? 'scheduled' : 'departed',
      latitude: data.lat,
      longitude: data.long,
    };
  }
}
