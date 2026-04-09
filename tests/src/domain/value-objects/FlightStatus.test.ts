import { FlightStatus, FLIGHT_STATUS_VALUES, FLIGHT_STATUS_LABELS } from '@/src/domain/value-objects/FlightStatus';

describe('FlightStatus', () => {
  describe('create', () => {
    describe('valid inputs', () => {
      FLIGHT_STATUS_VALUES.forEach((status) => {
        it(`should create FlightStatus from valid input: ${status}`, () => {
          const result = FlightStatus.create(status);

          expect(result.ok).toBe(true);
          if (result.ok) {
            expect(result.value.value).toBe(status);
            expect(result.value.label).toBe(FLIGHT_STATUS_LABELS[status]);
          }
        });
      });

      it('should normalize lowercase input', () => {
        const result = FlightStatus.create('DELAYED');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('delayed');
        }
      });

      it('should trim whitespace', () => {
        const result = FlightStatus.create('  scheduled  ');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('scheduled');
        }
      });
    });

    describe('invalid inputs', () => {
      it('should reject null', () => {
        const result = FlightStatus.create(null);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject undefined', () => {
        const result = FlightStatus.create(undefined);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject empty string', () => {
        const result = FlightStatus.create('');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('INVALID');
        }
      });

      it('should reject invalid status', () => {
        const result = FlightStatus.create('flying');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('INVALID');
        }
      });

      it('should reject non-string input', () => {
        const result = FlightStatus.create(123);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('INVALID');
        }
      });
    });
  });

  describe('factory methods', () => {
    it('should create scheduled status', () => {
      const status = FlightStatus.scheduled();

      expect(status.value).toBe('scheduled');
      expect(status.label).toBe('Programado');
    });

    it('should create delayed status', () => {
      const status = FlightStatus.delayed();

      expect(status.value).toBe('delayed');
      expect(status.label).toBe('Retrasado');
    });

    it('should create cancelled status', () => {
      const status = FlightStatus.cancelled();

      expect(status.value).toBe('cancelled');
      expect(status.label).toBe('Cancelado');
    });
  });

  describe('isActive', () => {
    it('should return true for scheduled', () => {
      expect(FlightStatus.scheduled().isActive()).toBe(true);
    });

    it('should return true for boarding', () => {
      const status = FlightStatus.create('boarding');
      expect(status.ok && status.value.isActive()).toBe(true);
    });

    it('should return true for departed', () => {
      const status = FlightStatus.create('departed');
      expect(status.ok && status.value.isActive()).toBe(true);
    });

    it('should return true for delayed', () => {
      expect(FlightStatus.delayed().isActive()).toBe(true);
    });

    it('should return false for arrived', () => {
      const status = FlightStatus.create('arrived');
      expect(status.ok && status.value.isActive()).toBe(false);
    });

    it('should return false for cancelled', () => {
      expect(FlightStatus.cancelled().isActive()).toBe(false);
    });
  });

  describe('isCompleted', () => {
    it('should return true for arrived', () => {
      const status = FlightStatus.create('arrived');
      expect(status.ok && status.value.isCompleted()).toBe(true);
    });

    it('should return true for cancelled', () => {
      expect(FlightStatus.cancelled().isCompleted()).toBe(true);
    });

    it('should return false for scheduled', () => {
      expect(FlightStatus.scheduled().isCompleted()).toBe(false);
    });
  });

  describe('isDelayed', () => {
    it('should return true for delayed status', () => {
      expect(FlightStatus.delayed().isDelayed()).toBe(true);
    });

    it('should return false for other statuses', () => {
      expect(FlightStatus.scheduled().isDelayed()).toBe(false);
    });
  });

  describe('requiresAttention', () => {
    it('should return true for boarding', () => {
      const status = FlightStatus.create('boarding');
      expect(status.ok && status.value.requiresAttention()).toBe(true);
    });

    it('should return true for delayed', () => {
      expect(FlightStatus.delayed().requiresAttention()).toBe(true);
    });

    it('should return true for cancelled', () => {
      expect(FlightStatus.cancelled().requiresAttention()).toBe(true);
    });

    it('should return false for scheduled', () => {
      expect(FlightStatus.scheduled().requiresAttention()).toBe(false);
    });
  });

  describe('toLocaleString', () => {
    it('should return Spanish label by default', () => {
      const status = FlightStatus.delayed();

      expect(status.toLocaleString()).toBe('Retrasado');
    });

    it('should return English label for en locale', () => {
      const status = FlightStatus.delayed();

      expect(status.toLocaleString('en-US')).toBe('delayed');
    });
  });

  describe('equals', () => {
    it('should return true for equal statuses', () => {
      const s1 = FlightStatus.scheduled();
      const s2 = FlightStatus.scheduled();

      expect(s1.equals(s2)).toBe(true);
    });

    it('should return false for different statuses', () => {
      const s1 = FlightStatus.scheduled();
      const s2 = FlightStatus.delayed();

      expect(s1.equals(s2)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const status = FlightStatus.scheduled();

      expect(Object.isFrozen(status)).toBe(true);
    });
  });
});
