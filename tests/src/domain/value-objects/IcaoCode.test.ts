import { IcaoCode } from '@/src/domain/value-objects/IcaoCode';

describe('IcaoCode', () => {
  describe('create', () => {
    describe('valid inputs', () => {
      const validCodes = ['LEMD', 'EGLL', 'KJFK', 'LPPT', 'LEAL', 'GCXO'];

      validCodes.forEach((code) => {
        it(`should create IcaoCode from valid input: ${code}`, () => {
          const result = IcaoCode.create(code);

          expect(result.ok).toBe(true);
          if (result.ok) {
            expect(result.value.value).toBe(code);
            expect(result.value.toString()).toBe(code);
          }
        });
      });

      it('should normalize lowercase input to uppercase', () => {
        const result = IcaoCode.create('lemd');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('LEMD');
        }
      });

      it('should handle mixed case input', () => {
        const result = IcaoCode.create('LeMd');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('LEMD');
        }
      });

      it('should trim whitespace', () => {
        const result = IcaoCode.create('  LEMD  ');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('LEMD');
        }
      });

      it('should extract last 3 chars from icao', () => {
        const result = IcaoCode.create('LEMD');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.iata).toBe('EMD');
        }
      });

      it('should remove special characters and accept valid result', () => {
        const result = IcaoCode.create('LEM-D');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('LEMD');
        }
      });
    });

    describe('invalid inputs', () => {
      it('should reject null input', () => {
        const result = IcaoCode.create(null);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject undefined input', () => {
        const result = IcaoCode.create(undefined);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject empty string', () => {
        const result = IcaoCode.create('');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject whitespace only', () => {
        const result = IcaoCode.create('   ');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject non-string input', () => {
        const result = IcaoCode.create(12345);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('INVALID');
        }
      });

      it('should reject too short input', () => {
        const result = IcaoCode.create('LE');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('TOO_SHORT');
        }
      });

      it('should reject codes with too many invalid characters', () => {
        const result = IcaoCode.create('LE!@#');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('TOO_SHORT');
        }
      });
    });

    describe('sanitization', () => {
      it('should remove special characters but keep valid chars', () => {
        const result = IcaoCode.create('L-EMD');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('LEMD');
        }
      });

      it('should handle underscores', () => {
        const result = IcaoCode.create('LE_MD');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('LEMD');
        }
      });

      it('should handle spaces', () => {
        const result = IcaoCode.create('LE MD');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('LEMD');
        }
      });
    });
  });

  describe('createUnsafe', () => {
    it('should create valid IcaoCode', () => {
      const code = IcaoCode.createUnsafe('LEMD');

      expect(code.value).toBe('LEMD');
    });

    it('should throw for too short input', () => {
      expect(() => IcaoCode.createUnsafe('LE')).toThrow();
    });

    it('should throw for invalid characters', () => {
      expect(() => IcaoCode.createUnsafe('!!!')).toThrow();
    });
  });

  describe('equals', () => {
    it('should return true for equal codes', () => {
      const code1 = IcaoCode.createUnsafe('LEMD');
      const code2 = IcaoCode.createUnsafe('LEMD');

      expect(code1.equals(code2)).toBe(true);
    });

    it('should return false for different codes', () => {
      const code1 = IcaoCode.createUnsafe('LEMD');
      const code2 = IcaoCode.createUnsafe('LEBL');

      expect(code1.equals(code2)).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON', () => {
      const code = IcaoCode.createUnsafe('LEMD');

      expect(JSON.stringify({ icao: code })).toBe('{"icao":"LEMD"}');
    });
  });

  describe('Symbol.toPrimitive', () => {
    it('should convert to string', () => {
      const code = IcaoCode.createUnsafe('LEMD');

      expect(String(code)).toBe('LEMD');
      expect(`${code}`).toBe('LEMD');
    });

    it('should throw on number conversion', () => {
      const code = IcaoCode.createUnsafe('LEMD');

      expect(() => Number(code)).toThrow(TypeError);
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const code = IcaoCode.createUnsafe('LEMD');

      expect(Object.isFrozen(code)).toBe(true);
    });

    it('should throw on modification attempt', () => {
      const code = IcaoCode.createUnsafe('LEMD');

      expect(() => {
        (code as any).value = 'XXXX';
      }).toThrow();
    });
  });
});
