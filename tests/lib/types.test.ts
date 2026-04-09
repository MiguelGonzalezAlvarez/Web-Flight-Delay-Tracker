import { Flight, FlightStatus, DelayPrediction } from '@/types';

describe('Type Definitions', () => {
  describe('Flight', () => {
    it('should accept valid flight object', () => {
      const flight: Flight = {
        id: 'test-123',
        icao24: 'abc123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
        airline: 'Iberia',
        departureTime: '2024-01-01T10:00:00Z',
        arrivalTime: '2024-01-01T12:00:00Z',
        estimatedTime: null,
        status: 'scheduled',
      };

      expect(flight.id).toBe('test-123');
      expect(flight.callsign).toBe('IBE1234');
      expect(flight.status).toBe('scheduled');
    });

    it('should accept optional fields as null', () => {
      const flight: Flight = {
        id: 'test-123',
        icao24: 'abc123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
        airline: 'Iberia',
        departureTime: null,
        arrivalTime: null,
        estimatedTime: null,
        status: 'unknown',
      };

      expect(flight.departureTime).toBeNull();
      expect(flight.arrivalTime).toBeNull();
    });
  });

  describe('FlightStatus', () => {
    it('should accept all valid status values', () => {
      const statuses: FlightStatus[] = [
        'scheduled',
        'boarding',
        'departed',
        'arrived',
        'delayed',
        'cancelled',
        'unknown',
      ];

      expect(statuses.length).toBe(7);
    });
  });

  describe('DelayPrediction', () => {
    it('should accept valid prediction object', () => {
      const prediction: DelayPrediction = {
        percentage: 25,
        avgDelayMinutes: 15,
        basedOnRecords: 50,
        riskLevel: 'medium',
      };

      expect(prediction.percentage).toBe(25);
      expect(prediction.riskLevel).toBe('medium');
    });

    it('should accept all risk levels', () => {
      const lowRisk: DelayPrediction = { percentage: 10, avgDelayMinutes: 5, basedOnRecords: 100, riskLevel: 'low' };
      const mediumRisk: DelayPrediction = { percentage: 35, avgDelayMinutes: 20, basedOnRecords: 100, riskLevel: 'medium' };
      const highRisk: DelayPrediction = { percentage: 75, avgDelayMinutes: 45, basedOnRecords: 100, riskLevel: 'high' };

      expect(lowRisk.riskLevel).toBe('low');
      expect(mediumRisk.riskLevel).toBe('medium');
      expect(highRisk.riskLevel).toBe('high');
    });
  });
});
