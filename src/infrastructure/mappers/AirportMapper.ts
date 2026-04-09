import { Airport, AirportProps } from '../../domain/entities/Airport';
import { Result, success } from '../../domain/value-objects/Result';
import { ValidationError } from '../../domain/value-objects/ValidationError';

export interface AirportDTO {
  icao: string;
  iata: string;
  name: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export class AirportMapper {
  static toEntity(dto: AirportDTO): Result<Airport, ValidationError> {
    return Airport.create({
      icao: dto.icao,
      iata: dto.iata || undefined,
      name: dto.name,
      city: dto.city,
    });
  }

  static toDTO(entity: Airport): Omit<AirportDTO, 'latitude' | 'longitude'> {
    return {
      icao: entity.icao.toString(),
      iata: entity.iata?.toString() || '',
      name: entity.name,
      city: entity.city,
    };
  }

  static toDTOWithCoordinates(entity: Airport, latitude?: number, longitude?: number): AirportDTO {
    return {
      ...this.toDTO(entity),
      latitude,
      longitude,
    };
  }
}
