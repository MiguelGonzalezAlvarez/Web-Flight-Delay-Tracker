import { FlightPathCalculator } from '@/src/domain/services/FlightPathCalculator';
import { Airport } from '@/src/domain/entities/Airport';

describe('FlightPathCalculator', () => {
  let calculator: FlightPathCalculator;

  beforeEach(() => {
    calculator = new FlightPathCalculator();
  });

  describe('calculateBearing', () => {
    it('should calculate bearing between two points', () => {
      const origin = { latitude: 40.4983, longitude: -3.5676 };
      const destination = { latitude: 41.2974, longitude: 2.0833 };

      const bearing = calculator.calculateBearing(origin, destination);

      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });

    it('should return 0 for same point', () => {
      const point = { latitude: 40.4983, longitude: -3.5676 };

      const bearing = calculator.calculateBearing(point, point);

      expect(bearing).toBe(0);
    });
  });

  describe('calculateDistanceByCoordinates', () => {
    it('should calculate distance between coordinates', () => {
      const origin = { latitude: 40.4983, longitude: -3.5676 };
      const destination = { latitude: 41.2974, longitude: 2.0833 };

      const distance = calculator.calculateDistanceByCoordinates(origin, destination);

      expect(distance).toBeGreaterThan(0);
    });

    it('should return 0 for same coordinates', () => {
      const point = { latitude: 40.4983, longitude: -3.5676 };

      const distance = calculator.calculateDistanceByCoordinates(point, point);

      expect(distance).toBe(0);
    });
  });

  describe('findNearestAirport', () => {
    it('should return null for empty airport list', () => {
      const nearest = calculator.findNearestAirport(
        { latitude: 40.5, longitude: -3.5 },
        []
      );

      expect(nearest).toBeNull();
    });
  });
});
