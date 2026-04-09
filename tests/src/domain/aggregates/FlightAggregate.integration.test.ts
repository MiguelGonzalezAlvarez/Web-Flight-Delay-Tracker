import { FlightAggregate } from '@/src/domain/aggregates/FlightAggregate';
import { Flight } from '@/src/domain/entities/Flight';
import { Route } from '@/src/domain/entities/Route';
import { DelayPrediction } from '@/src/domain/entities/DelayPrediction';

describe('FlightAggregate Integration', () => {
  const createFlightProps = (overrides = {}) => ({
    id: 'aggregate-flight',
    callsign: 'IBE1234',
    airline: 'Iberia',
    origin: 'LEMD',
    destination: 'LEBL',
    departureTime: new Date('2024-03-15T10:00:00Z'),
    arrivalTime: new Date('2024-03-15T11:30:00Z'),
    status: 'scheduled',
    ...overrides,
  });

  describe('create', () => {
    it('should create aggregate with flight', () => {
      const result = FlightAggregate.create({ flight: createFlightProps() });

      expect(result.ok).toBe(true);
      expect(result.value.flight.id).toBe('aggregate-flight');
      expect(result.value.flight.callsign.toString()).toBe('IBE1234');
    });

    it('should create aggregate with flight and prediction', () => {
      const props = createFlightProps({
        delayPrediction: {
          percentage: 45,
          riskLevel: 'medium',
          avgDelayMinutes: 20,
          basedOnRecords: 10,
        },
      });

      const result = FlightAggregate.create({ flight: props });

      expect(result.ok).toBe(true);
      expect(result.value.prediction).not.toBeNull();
      expect(result.value.prediction!.percentage).toBe(45);
    });

    it('should fail if arrival time is before departure time', () => {
      const props = createFlightProps({
        departureTime: new Date('2024-03-15T12:00:00Z'),
        arrivalTime: new Date('2024-03-15T10:00:00Z'),
      });

      const result = FlightAggregate.create({ flight: props });

      expect(result.ok).toBe(false);
      expect(result.error.message).toContain('Arrival time must be after departure time');
    });
  });

  describe('createFromFlight', () => {
    it('should create aggregate from existing flight', () => {
      const flight = Flight.createUnsafe(createFlightProps());

      const aggregate = FlightAggregate.createFromFlight(flight);

      expect(aggregate.flight.id).toBe('aggregate-flight');
      expect(aggregate.prediction).toBeNull();
    });

    it('should create aggregate with prediction', () => {
      const flight = Flight.createUnsafe(createFlightProps());
      const prediction = DelayPrediction.fromPercentage(60, 30, 15);

      const aggregate = FlightAggregate.createFromFlight(flight, prediction);

      expect(aggregate.flight.id).toBe('aggregate-flight');
      expect(aggregate.prediction).not.toBeNull();
      expect(aggregate.prediction!.percentage).toBe(60);
    });
  });

  describe('route', () => {
    it('should return route from flight origin and destination', () => {
      const result = FlightAggregate.create({ flight: createFlightProps() });

      expect(result.value.route).toBeInstanceOf(Route);
      expect(result.value.route.origin.toString()).toBe('LEMD');
      expect(result.value.route.destination.toString()).toBe('LEBL');
    });
  });

  describe('changeStatus', () => {
    it('should allow valid status transition', () => {
      const result = FlightAggregate.create({ flight: createFlightProps() });

      const transitionResult = result.value.changeStatus('boarding');

      expect(transitionResult.ok).toBe(true);
      expect(transitionResult.value.flight.status.toString()).toBe('boarding');
    });

    it('should reject invalid status transition', () => {
      const result = FlightAggregate.create({ flight: createFlightProps({ status: 'scheduled' }) });

      const transitionResult = result.value.changeStatus('arrived');

      expect(transitionResult.ok).toBe(false);
      expect(transitionResult.error.message).toContain('Cannot transition');
    });

    it('should reject transition from arrived to any status', () => {
      const result = FlightAggregate.create({
        flight: createFlightProps({ status: 'arrived' }),
      });

      const transitionResult = result.value.changeStatus('delayed');

      expect(transitionResult.ok).toBe(false);
    });

    it('should allow delayed flight to transition to departed', () => {
      const result = FlightAggregate.create({
        flight: createFlightProps({ status: 'delayed' }),
      });

      const transitionResult = result.value.changeStatus('departed');

      expect(transitionResult.ok).toBe(true);
    });
  });

  describe('attachPrediction', () => {
    it('should attach prediction to active flight', () => {
      const result = FlightAggregate.create({ flight: createFlightProps({ status: 'scheduled' }) });

      const attachResult = result.value.attachPrediction({
        percentage: 75,
        riskLevel: 'high',
        avgDelayMinutes: 35,
        basedOnRecords: 20,
      });

      expect(attachResult.ok).toBe(true);
      expect(attachResult.value.prediction).not.toBeNull();
      expect(attachResult.value.prediction!.percentage).toBe(75);
    });

    it('should not attach prediction to non-active flight', () => {
      const result = FlightAggregate.create({
        flight: createFlightProps({ status: 'arrived' }),
      });

      const attachResult = result.value.attachPrediction({
        percentage: 75,
        riskLevel: 'medium',
        avgDelayMinutes: 35,
        basedOnRecords: 20,
      });

      expect(attachResult.ok).toBe(false);
    });

    it('should preserve flight data when attaching prediction', () => {
      const result = FlightAggregate.create({ flight: createFlightProps() });

      const attachResult = result.value.attachPrediction({
        percentage: 50,
        riskLevel: 'medium',
        avgDelayMinutes: 25,
        basedOnRecords: 10,
      });

      expect(attachResult.ok).toBe(true);
      expect(attachResult.value.flight.id).toBe('aggregate-flight');
      expect(attachResult.value.flight.callsign.toString()).toBe('IBE1234');
    });
  });

  describe('removePrediction', () => {
    it('should remove prediction from aggregate', () => {
      const flight = Flight.createUnsafe(createFlightProps({
        delayPrediction: { percentage: 60, riskLevel: 'medium', avgDelayMinutes: 30, basedOnRecords: 15 },
      }));
      const aggregate = FlightAggregate.createFromFlight(flight);

      const result = aggregate.removePrediction();

      expect(result.prediction).toBeNull();
      expect(result.flight.id).toBe(aggregate.flight.id);
    });
  });

  describe('isOnTime', () => {
    it('should return true for non-delayed flight', () => {
      const result = FlightAggregate.create({ flight: createFlightProps() });

      expect(result.value.isOnTime()).toBe(true);
    });

    it('should return false for delayed flight', () => {
      const result = FlightAggregate.create({
        flight: createFlightProps({ status: 'delayed' }),
      });

      expect(result.value.isOnTime()).toBe(false);
    });
  });

  describe('getFlightDurationMinutes', () => {
    it('should calculate flight duration', () => {
      const result = FlightAggregate.create({
        flight: createFlightProps({
          departureTime: new Date('2024-03-15T10:00:00Z'),
          arrivalTime: new Date('2024-03-15T12:30:00Z'),
        }),
      });

      expect(result.value.getFlightDurationMinutes()).toBe(150);
    });

    it('should return null if times are not set', () => {
      const result = FlightAggregate.create({
        flight: createFlightProps({
          departureTime: undefined,
          arrivalTime: undefined,
        }),
      });

      expect(result.value.getFlightDurationMinutes()).toBeNull();
    });
  });

  describe('getDelayRisk', () => {
    it('should return unknown if no prediction', () => {
      const result = FlightAggregate.create({ flight: createFlightProps() });

      expect(result.value.getDelayRisk()).toBe('unknown');
    });

    it('should return risk level from prediction', () => {
      const result = FlightAggregate.create({
        flight: createFlightProps({
          delayPrediction: { percentage: 85, riskLevel: 'high', avgDelayMinutes: 40, basedOnRecords: 20 },
        }),
      });

      expect(result.ok).toBe(true);
      expect(result.value.getDelayRisk()).toBe('high');
    });
  });

  describe('requiresAttention', () => {
    it('should return false for normal flight', () => {
      const result = FlightAggregate.create({ flight: createFlightProps() });

      expect(result.value.requiresAttention()).toBe(false);
    });

    it('should return true for high risk prediction', () => {
      const result = FlightAggregate.create({
        flight: createFlightProps({
          delayPrediction: { percentage: 95, riskLevel: 'high', avgDelayMinutes: 50, basedOnRecords: 30 },
        }),
      });

      expect(result.ok).toBe(true);
      expect(result.value.requiresAttention()).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for same flight', () => {
      const result1 = FlightAggregate.create({ flight: createFlightProps({ id: 'same-id' }) });
      const result2 = FlightAggregate.create({ flight: createFlightProps({ id: 'same-id' }) });

      expect(result1.value.equals(result2.value)).toBe(true);
    });

    it('should return false for different flights', () => {
      const result1 = FlightAggregate.create({ flight: createFlightProps({ id: 'flight-1' }) });
      const result2 = FlightAggregate.create({ flight: createFlightProps({ id: 'flight-2' }) });

      expect(result1.value.equals(result2.value)).toBe(false);
    });
  });
});
