import { FlightAggregate } from '@/src/domain/aggregates/FlightAggregate';

describe('FlightAggregate', () => {
  describe('create', () => {
    it('should create a valid flight aggregate', () => {
      const props = {
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'scheduled' as const,
        },
      };

      const result = FlightAggregate.create(props);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.flight.id).toBe('flight-1');
        expect(result.value.flight.status.toString()).toBe('scheduled');
      }
    });

    it('should return failure when origin equals destination', () => {
      const props = {
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEMD',
          status: 'scheduled' as const,
        },
      };

      const result = FlightAggregate.create(props);

      expect(result.ok).toBe(false);
    });

    it('should return failure when arrival is before departure', () => {
      const props = {
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          departureTime: new Date('2024-03-15T14:00:00Z'),
          arrivalTime: new Date('2024-03-15T12:00:00Z'),
          status: 'scheduled' as const,
        },
      };

      const result = FlightAggregate.create(props);

      expect(result.ok).toBe(false);
    });
  });

  describe('isValidTransition', () => {
    it('should allow valid transition from scheduled to boarding', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'scheduled' as const,
        },
      });

      expect(aggregate.isValidTransition('boarding')).toBe(true);
    });

    it('should allow valid transition from boarding to departed', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'boarding' as const,
        },
      });

      expect(aggregate.isValidTransition('departed')).toBe(true);
    });

    it('should not allow invalid transition from arrived to departed', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'arrived' as const,
        },
      });

      expect(aggregate.isValidTransition('departed')).toBe(false);
    });

    it('should not allow transition from cancelled to boarding', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'cancelled' as const,
        },
      });

      expect(aggregate.isValidTransition('boarding')).toBe(false);
    });
  });

  describe('changeStatus', () => {
    it('should change status with valid transition', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'scheduled' as const,
        },
      });

      const result = aggregate.changeStatus('boarding');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.flight.status.toString()).toBe('boarding');
      }
    });

    it('should return failure with invalid transition', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'arrived' as const,
        },
      });

      const result = aggregate.changeStatus('boarding');

      expect(result.ok).toBe(false);
    });
  });

  describe('attachPrediction', () => {
    it('should attach prediction to active flight', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'scheduled' as const,
        },
      });

      const result = aggregate.attachPrediction({
        percentage: 65,
        riskLevel: 'medium',
        avgDelayMinutes: 90,
        basedOnRecords: 30,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.prediction?.percentage).toBe(65);
      }
    });

    it('should not attach prediction to arrived flight', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'arrived' as const,
        },
      });

      const result = aggregate.attachPrediction({
        percentage: 65,
        riskLevel: 'medium',
        avgDelayMinutes: 90,
        basedOnRecords: 30,
      });

      expect(result.ok).toBe(false);
    });
  });

  describe('getDelayRisk', () => {
    it('should return unknown when no prediction', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'scheduled' as const,
        },
      });

      expect(aggregate.getDelayRisk()).toBe('unknown');
    });

    it('should return risk level from prediction', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'scheduled' as const,
          delayPrediction: {
            percentage: 80,
            riskLevel: 'high',
            avgDelayMinutes: 120,
            basedOnRecords: 50,
          },
        },
      });

      expect(aggregate.getDelayRisk()).toBe('high');
    });
  });

  describe('getFlightDurationMinutes', () => {
    it('should return null when times are not set', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'scheduled' as const,
        },
      });

      expect(aggregate.getFlightDurationMinutes()).toBeNull();
    });

    it('should return duration in minutes', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          departureTime: new Date('2024-03-15T10:00:00Z'),
          arrivalTime: new Date('2024-03-15T11:30:00Z'),
          status: 'scheduled' as const,
        },
      });

      expect(aggregate.getFlightDurationMinutes()).toBe(90);
    });
  });

  describe('route', () => {
    it('should return Route value object', () => {
      const aggregate = FlightAggregate.createUnsafe({
        flight: {
          id: 'flight-1',
          callsign: 'IBE1234',
          airline: 'Iberia',
          origin: 'LEMD',
          destination: 'LEBL',
          status: 'scheduled' as const,
        },
      });

      expect(aggregate.route.origin.toString()).toBe('LEMD');
      expect(aggregate.route.destination.toString()).toBe('LEBL');
    });
  });
});
