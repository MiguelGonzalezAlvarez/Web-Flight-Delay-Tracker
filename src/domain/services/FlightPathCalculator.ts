import { Airport } from '../entities/Airport';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface FlightPathResult {
  distanceKm: number;
  estimatedDurationMinutes: number;
  bearing: number;
}

export class FlightPathCalculator {
  private static readonly EARTH_RADIUS_KM = 6371;
  private static readonly AVERAGE_SPEED_KMH = 800;

  calculateDistance(origin: Airport, destination: Airport): number {
    const originCoords = origin.getCoordinates();
    const destCoords = destination.getCoordinates();
    if (!originCoords || !destCoords) {
      return 0;
    }
    return this.calculateDistanceBetweenCoordinates(originCoords, destCoords);
  }

  calculateDistanceByCoordinates(origin: Coordinates, destination: Coordinates): number {
    return this.calculateDistanceBetweenCoordinates(origin, destination);
  }

  private calculateDistanceBetweenCoordinates(origin: Coordinates, destination: Coordinates): number {
    const lat1Rad = this.toRadians(origin.latitude);
    const lat2Rad = this.toRadians(destination.latitude);
    const deltaLat = this.toRadians(destination.latitude - origin.latitude);
    const deltaLon = this.toRadians(destination.longitude - origin.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return FlightPathCalculator.EARTH_RADIUS_KM * c;
  }

  calculateFlightPath(
    origin: Airport,
    destination: Airport,
    averageSpeedKmh: number = FlightPathCalculator.AVERAGE_SPEED_KMH
  ): FlightPathResult {
    const originCoords = origin.getCoordinates();
    const destCoords = destination.getCoordinates();
    if (!originCoords || !destCoords) {
      return {
        distanceKm: 0,
        estimatedDurationMinutes: 0,
        bearing: 0,
      };
    }

    const distance = this.calculateDistanceBetweenCoordinates(originCoords, destCoords);
    const duration = (distance / averageSpeedKmh) * 60;
    const bearing = this.calculateBearing(originCoords, destCoords);

    return {
      distanceKm: Math.round(distance),
      estimatedDurationMinutes: Math.round(duration),
      bearing: Math.round(bearing),
    };
  }

  calculateBearing(origin: Coordinates, destination: Coordinates): number {
    const lat1 = this.toRadians(origin.latitude);
    const lat2 = this.toRadians(destination.latitude);
    const deltaLon = this.toRadians(destination.longitude - origin.longitude);

    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

    let bearing = this.toDegrees(Math.atan2(y, x));
    bearing = (bearing + 360) % 360;

    return bearing;
  }

  findNearestAirport(coordinates: Coordinates, airports: Airport[]): Airport | null {
    if (airports.length === 0) {
      return null;
    }

    let nearest: Airport | null = null;
    let minDistance = Infinity;

    for (const airport of airports) {
      const airportCoords = airport.getCoordinates();
      if (!airportCoords) {
        continue;
      }
      const distance = this.calculateDistanceBetweenCoordinates(coordinates, airportCoords);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = airport;
      }
    }

    return nearest;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }
}
