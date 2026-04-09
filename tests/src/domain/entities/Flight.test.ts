import { Flight } from '@/src/domain/entities/Flight';

describe('Flight', () => {
  const validFlightProps = {
    id: 'test-flight-1',
    callsign: 'IBE1234',
    airline: 'Iberia',
    origin: 'LEMD',
    destination: 'LEAL',
    departureTime: new Date('2024-03-15T10:30:00Z'),
    arrivalTime: new Date('2024-03-15T11:45:00Z'),
    status: 'scheduled' as const,
    delayPrediction: {
      percentage: 35,
      riskLevel: 'medium' as const,
      avgDelayMinutes: 15,
      basedOnRecords: 45,
    },
  };

  describe('create', () => {
    describe('valid inputs', () => {
      it('should create a valid flight', () => {
        const result = Flight.create(validFlightProps);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.id).toBe('test-flight-1');
          expect(result.value.callsign.value).toBe('IBE1234');
          expect(result.value.airline).toBe('Iberia');
          expect(result.value.origin.value).toBe('LEMD');
          expect(result.value.destination.value).toBe('LEAL');
          expect(result.value.status.value).toBe('scheduled');
          expect(result.value.delayPrediction?.percentage).toBe(35);
        }
      });

      it('should create flight without optional fields', () => {
        const result = Flight.create({
          id: 'test-2',
          callsign: 'VLG5678',
          airline: 'Vueling',
          origin: 'LEBL',
          destination: 'LEAL',
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.delayPrediction).toBeUndefined();
          expect(result.value.departureTime).toBeUndefined();
        }
      });

      it('should normalize callsign to uppercase', () => {
        const result = Flight.create({
          ...validFlightProps,
          callsign: 'ibe1234',
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.callsign.value).toBe('IBE1234');
        }
      });
    });

    describe('invalid inputs', () => {
      it('should reject missing id', () => {
        const result = Flight.create({
          ...validFlightProps,
          id: '',
        });

        expect(result.ok).toBe(false);
      });

      it('should reject invalid callsign', () => {
        const result = Flight.create({
          ...validFlightProps,
          callsign: '!',
        });

        expect(result.ok).toBe(false);
      });

      it('should reject icao that is too short', () => {
        const result = Flight.create({
          ...validFlightProps,
          origin: 'X',
        });

        expect(result.ok).toBe(false);
      });

      it('should reject destination that is too short', () => {
        const result = Flight.create({
          ...validFlightProps,
          destination: 'X',
        });

        expect(result.ok).toBe(false);
      });

      it('should reject invalid status', () => {
        const result = Flight.create({
          ...validFlightProps,
          status: 'flying' as any,
        });

        expect(result.ok).toBe(false);
      });
    });
  });

  describe('hasPrediction', () => {
    it('should return true when prediction exists', () => {
      const flight = Flight.createUnsafe(validFlightProps);

      expect(flight.hasPrediction()).toBe(true);
    });

    it('should return false when no prediction', () => {
      const flight = Flight.createUnsafe({
        id: 'test-2',
        callsign: 'VLG5678',
        airline: 'Vueling',
        origin: 'LEBL',
        destination: 'LEAL',
      });

      expect(flight.hasPrediction()).toBe(false);
    });
  });

  describe('isDelayed', () => {
    it('should return true for delayed status', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        status: 'delayed',
      });

      expect(flight.isDelayed()).toBe(true);
    });

    it('should return false for scheduled status', () => {
      const flight = Flight.createUnsafe(validFlightProps);

      expect(flight.isDelayed()).toBe(false);
    });
  });

  describe('isActive', () => {
    it('should return true for scheduled', () => {
      const flight = Flight.createUnsafe(validFlightProps);

      expect(flight.isActive()).toBe(true);
    });

    it('should return true for boarding', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        status: 'boarding',
      });

      expect(flight.isActive()).toBe(true);
    });

    it('should return true for departed', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        status: 'departed',
      });

      expect(flight.isActive()).toBe(true);
    });

    it('should return false for arrived', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        status: 'arrived',
      });

      expect(flight.isActive()).toBe(false);
    });

    it('should return false for cancelled', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        status: 'cancelled',
      });

      expect(flight.isActive()).toBe(false);
    });
  });

  describe('isCompleted', () => {
    it('should return true for arrived', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        status: 'arrived',
      });

      expect(flight.isCompleted()).toBe(true);
    });

    it('should return true for cancelled', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        status: 'cancelled',
      });

      expect(flight.isCompleted()).toBe(true);
    });

    it('should return false for scheduled', () => {
      const flight = Flight.createUnsafe(validFlightProps);

      expect(flight.isCompleted()).toBe(false);
    });
  });

  describe('requiresAttention', () => {
    it('should return true for delayed status', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        status: 'delayed',
      });

      expect(flight.requiresAttention()).toBe(true);
    });

    it('should return true for cancelled status', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        status: 'cancelled',
      });

      expect(flight.requiresAttention()).toBe(true);
    });

    it('should return true for high risk prediction', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        delayPrediction: {
          percentage: 75,
          riskLevel: 'high',
          avgDelayMinutes: 30,
          basedOnRecords: 45,
        },
      });

      expect(flight.requiresAttention()).toBe(true);
    });

    it('should return true for medium risk prediction', () => {
      const flight = Flight.createUnsafe(validFlightProps);

      expect(flight.requiresAttention()).toBe(true);
    });

    it('should return false for scheduled with low risk', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        delayPrediction: {
          percentage: 15,
          riskLevel: 'low',
          avgDelayMinutes: 5,
          basedOnRecords: 45,
        },
      });

      expect(flight.requiresAttention()).toBe(false);
    });

    it('should return false for no prediction', () => {
      const flight = Flight.createUnsafe({
        id: 'test-2',
        callsign: 'VLG5678',
        airline: 'Vueling',
        origin: 'LEBL',
        destination: 'LEAL',
        status: 'scheduled',
      });

      expect(flight.requiresAttention()).toBe(false);
    });
  });

  describe('getRoute', () => {
    it('should return formatted route', () => {
      const flight = Flight.createUnsafe(validFlightProps);

      expect(flight.getRoute()).toBe('LEMD → LEAL');
    });
  });

  describe('getScheduledTime', () => {
    it('should return departure time when available', () => {
      const flight = Flight.createUnsafe(validFlightProps);

      expect(flight.getScheduledTime()).toEqual(validFlightProps.departureTime);
    });

    it('should return arrival time when no departure', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        departureTime: undefined,
      });

      expect(flight.getScheduledTime()).toEqual(validFlightProps.arrivalTime);
    });

    it('should return undefined when no times', () => {
      const flight = Flight.createUnsafe({
        id: 'test-2',
        callsign: 'VLG5678',
        airline: 'Vueling',
        origin: 'LEBL',
        destination: 'LEAL',
      });

      expect(flight.getScheduledTime()).toBeUndefined();
    });
  });

  describe('hasDeparted', () => {
    it('should return true for departed status', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        status: 'departed',
      });

      expect(flight.hasDeparted()).toBe(true);
    });

    it('should return true for arrived status', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        status: 'arrived',
      });

      expect(flight.hasDeparted()).toBe(true);
    });

    it('should return false for scheduled status', () => {
      const flight = Flight.createUnsafe(validFlightProps);

      expect(flight.hasDeparted()).toBe(false);
    });
  });

  describe('hasArrived', () => {
    it('should return true for arrived status', () => {
      const flight = Flight.createUnsafe({
        ...validFlightProps,
        status: 'arrived',
      });

      expect(flight.hasArrived()).toBe(true);
    });

    it('should return false for other statuses', () => {
      const flight = Flight.createUnsafe(validFlightProps);

      expect(flight.hasArrived()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same id', () => {
      const f1 = Flight.createUnsafe(validFlightProps);
      const f2 = Flight.createUnsafe({
        ...validFlightProps,
        callsign: 'DIFFERENT',
      });

      expect(f1.equals(f2)).toBe(true);
    });

    it('should return false for different id', () => {
      const f1 = Flight.createUnsafe(validFlightProps);
      const f2 = Flight.createUnsafe({
        ...validFlightProps,
        id: 'different-id',
      });

      expect(f1.equals(f2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const flight = Flight.createUnsafe(validFlightProps);

      expect(flight.toString()).toBe('Flight IBE1234 (LEMD → LEAL)');
    });
  });

  describe('toPlainObject', () => {
    it('should return plain object', () => {
      const flight = Flight.createUnsafe(validFlightProps);
      const obj = flight.toPlainObject();

      expect(obj.id).toBe('test-flight-1');
      expect(obj.callsign).toBe('IBE1234');
      expect(obj.origin).toBe('LEMD');
      expect(obj.destination).toBe('LEAL');
      expect(obj.delayPrediction?.percentage).toBe(35);
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const flight = Flight.createUnsafe(validFlightProps);

      expect(Object.isFrozen(flight)).toBe(true);
    });
  });
});
