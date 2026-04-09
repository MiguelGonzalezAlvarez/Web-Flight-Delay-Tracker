import { IataCode } from '@/src/domain/value-objects/IataCode';

describe('IataCode', () => {
  describe('create', () => {
    describe('valid inputs', () => {
      const validCodes = ['MAD', 'BCN', 'AGP', 'LHR', 'CDG', 'FRA'];

      validCodes.forEach((code) => {
        it(`should create IataCode from valid input: ${code}`, () => {
          const result = IataCode.create(code);

          expect(result.ok).toBe(true);
          if (result.ok) {
            expect(result.value.value).toBe(code);
          }
        });
      });

      it('should accept 2-letter country codes', () => {
        const result = IataCode.create('ES');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('ES');
          expect(result.value.isCountryCode()).toBe(true);
          expect(result.value.isAirport()).toBe(false);
        }
      });

      it('should accept 3-letter airport codes', () => {
        const result = IataCode.create('MAD');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('MAD');
          expect(result.value.isAirport()).toBe(true);
          expect(result.value.isCountryCode()).toBe(false);
        }
      });

      it('should normalize lowercase input', () => {
        const result = IataCode.create('mad');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('MAD');
        }
      });

      it('should trim whitespace', () => {
        const result = IataCode.create('  MAD  ');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('MAD');
        }
      });

      it('should remove numbers and accept valid letters', () => {
        const result = IataCode.create('MA1');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('MA');
        }
      });

      it('should remove special characters and accept valid letters', () => {
        const result = IataCode.create('MAD!');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('MAD');
        }
      });
    });

    describe('invalid inputs', () => {
      it('should reject null', () => {
        const result = IataCode.create(null);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject undefined', () => {
        const result = IataCode.create(undefined);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject empty string', () => {
        const result = IataCode.create('');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject 1-letter code', () => {
        const result = IataCode.create('M');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('TOO_SHORT');
        }
      });

      it('should reject 4+ letter code', () => {
        const result = IataCode.create('MADR');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('TOO_LONG');
        }
      });

      it('should reject code that becomes too long after sanitization', () => {
        const result = IataCode.create('MAD1!');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('MAD');
        }
      });
    });
  });

  describe('createUnsafe', () => {
    it('should create valid IataCode', () => {
      const code = IataCode.createUnsafe('MAD');

      expect(code.value).toBe('MAD');
    });

    it('should throw for too short input', () => {
      expect(() => IataCode.createUnsafe('TOOLONG')).toThrow();
    });
  });

  describe('isAirport', () => {
    it('should return true for 3-letter codes', () => {
      const code = IataCode.createUnsafe('MAD');

      expect(code.isAirport()).toBe(true);
    });

    it('should return false for 2-letter codes', () => {
      const code = IataCode.createUnsafe('ES');

      expect(code.isAirport()).toBe(false);
    });
  });

  describe('isCountryCode', () => {
    it('should return true for 2-letter codes', () => {
      const code = IataCode.createUnsafe('ES');

      expect(code.isCountryCode()).toBe(true);
    });

    it('should return false for 3-letter codes', () => {
      const code = IataCode.createUnsafe('MAD');

      expect(code.isCountryCode()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal codes', () => {
      const code1 = IataCode.createUnsafe('MAD');
      const code2 = IataCode.createUnsafe('MAD');

      expect(code1.equals(code2)).toBe(true);
    });

    it('should return false for different codes', () => {
      const code1 = IataCode.createUnsafe('MAD');
      const code2 = IataCode.createUnsafe('BCN');

      expect(code1.equals(code2)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const code = IataCode.createUnsafe('MAD');

      expect(Object.isFrozen(code)).toBe(true);
    });
  });
});
