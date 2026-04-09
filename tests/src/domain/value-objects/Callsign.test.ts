import { Callsign } from '@/src/domain/value-objects/Callsign';

describe('Callsign', () => {
  describe('create', () => {
    describe('valid inputs', () => {
      const validCallsigns = ['IBE1234', 'VLG5678', 'EJU123', 'RYR1234', 'DAT1234'];

      validCallsigns.forEach((callsign) => {
        it(`should create Callsign from valid input: ${callsign}`, () => {
          const result = Callsign.create(callsign);

          expect(result.ok).toBe(true);
          if (result.ok) {
            expect(result.value.value).toBe(callsign);
          }
        });
      });

      it('should extract airline code', () => {
        const result = Callsign.create('IBE1234');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.airline).toBe('IBE');
        }
      });

      it('should extract flight number', () => {
        const result = Callsign.create('IBE1234');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.number).toBe('1234');
        }
      });

      it('should normalize lowercase input', () => {
        const result = Callsign.create('ibe1234');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('IBE1234');
        }
      });

      it('should trim whitespace', () => {
        const result = Callsign.create('  IBE1234  ');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('IBE1234');
        }
      });

      it('should handle alphanumeric input', () => {
        const result = Callsign.create('U21234');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('U21234');
        }
      });

      it('should handle 3-letter airline codes', () => {
        const result = Callsign.create('RYR1234');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.airline).toBe('RYR');
        }
      });

      it('should remove special characters and accept valid result', () => {
        const result = Callsign.create('IBE-1234');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('IBE1234');
        }
      });
    });

    describe('invalid inputs', () => {
      it('should reject null', () => {
        const result = Callsign.create(null);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject undefined', () => {
        const result = Callsign.create(undefined);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject empty string', () => {
        const result = Callsign.create('');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject too short input', () => {
        const result = Callsign.create('I');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('TOO_SHORT');
        }
      });

      it('should reject too long input', () => {
        const result = Callsign.create('IBE12345678');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('TOO_LONG');
        }
      });

      it('should reject codes with too many invalid characters', () => {
        const result = Callsign.create('!!!');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('TOO_SHORT');
        }
      });
    });

    describe('sanitization', () => {
      it('should handle mixed alphanumeric', () => {
        const result = Callsign.create('IBE-1234');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('IBE1234');
        }
      });

      it('should handle spaces', () => {
        const result = Callsign.create('IBE 1234');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('IBE1234');
        }
      });

      it('should handle underscores', () => {
        const result = Callsign.create('IBE_1234');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('IBE1234');
        }
      });
    });
  });

  describe('createUnsafe', () => {
    it('should create valid Callsign', () => {
      const callsign = Callsign.createUnsafe('IBE1234');

      expect(callsign.value).toBe('IBE1234');
      expect(callsign.airline).toBe('IBE');
      expect(callsign.number).toBe('1234');
    });

    it('should throw for too short input', () => {
      expect(() => Callsign.createUnsafe('I')).toThrow();
    });

    it('should throw for too long input', () => {
      expect(() => Callsign.createUnsafe('IBE12345678')).toThrow();
    });
  });

  describe('hasAirlineCode', () => {
    it('should return true for valid airline codes', () => {
      const callsign = Callsign.createUnsafe('IBE1234');

      expect(callsign.hasAirlineCode()).toBe(true);
    });

    it('should return false for numeric-only prefixes', () => {
      const callsign = Callsign.createUnsafe('12ABC');

      expect(callsign.hasAirlineCode()).toBe(false);
    });
  });

  describe('toParts', () => {
    it('should return airline and number', () => {
      const callsign = Callsign.createUnsafe('IBE1234');

      expect(callsign.toParts()).toEqual({
        airline: 'IBE',
        number: '1234',
      });
    });
  });

  describe('equals', () => {
    it('should return true for equal callsigns', () => {
      const c1 = Callsign.createUnsafe('IBE1234');
      const c2 = Callsign.createUnsafe('IBE1234');

      expect(c1.equals(c2)).toBe(true);
    });

    it('should return false for different callsigns', () => {
      const c1 = Callsign.createUnsafe('IBE1234');
      const c2 = Callsign.createUnsafe('VLG5678');

      expect(c1.equals(c2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the value', () => {
      const callsign = Callsign.createUnsafe('IBE1234');

      expect(callsign.toString()).toBe('IBE1234');
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const callsign = Callsign.createUnsafe('IBE1234');

      expect(Object.isFrozen(callsign)).toBe(true);
    });
  });
});
