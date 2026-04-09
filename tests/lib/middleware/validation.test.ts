import {
  sanitizeString,
  sanitizeCallsign,
  sanitizeIcao,
  validateIcao,
  validateIata,
  validateCallsign,
  validateFlightType,
  isValidUrl,
} from '@/lib/middleware/validation';

describe('Validation Middleware', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('should preserve normal text', () => {
      expect(sanitizeString('IBE1234')).toBe('IBE1234');
    });

    it('should remove quotes', () => {
      expect(sanitizeString('"test"')).toBe('test');
      expect(sanitizeString("'test'")).toBe('test');
    });

    it('should remove ampersands', () => {
      expect(sanitizeString('A & B')).toBe('A  B');
    });
  });

  describe('sanitizeCallsign', () => {
    it('should uppercase and trim', () => {
      expect(sanitizeCallsign('ibe1234')).toBe('IBE1234');
      expect(sanitizeCallsign('  ibe1234  ')).toBe('IBE1234');
    });

    it('should remove non-alphanumeric characters', () => {
      expect(sanitizeCallsign('IBE-1234')).toBe('IBE1234');
      expect(sanitizeCallsign('IBE 1234')).toBe('IBE1234');
    });

    it('should limit length to 10 characters', () => {
      const long = 'ABCDEFGHIJKLMNOP';
      expect(sanitizeCallsign(long).length).toBe(10);
    });

    it('should handle empty string', () => {
      expect(sanitizeCallsign('')).toBe('');
    });
  });

  describe('sanitizeIcao', () => {
    it('should uppercase and trim', () => {
      expect(sanitizeIcao('lemd')).toBe('LEMD');
    });

    it('should remove non-alphanumeric characters', () => {
      expect(sanitizeIcao('LE-MD')).toBe('LEMD');
    });

    it('should limit length to 4 characters', () => {
      expect(sanitizeIcao('LEMD1234')).toBe('LEMD');
    });
  });

  describe('validateIcao', () => {
    it('should return true for valid ICAO codes', () => {
      expect(validateIcao('LEMD')).toBe(true);
      expect(validateIcao('LEBL')).toBe(true);
      expect(validateIcao('GCXO')).toBe(true);
    });

    it('should return true for lowercase valid codes', () => {
      expect(validateIcao('lemd')).toBe(true);
    });

    it('should return false for invalid ICAO codes', () => {
      expect(validateIcao('LE')).toBe(false);
      expect(validateIcao('LEMDX')).toBe(false);
      expect(validateIcao('123')).toBe(false);
      expect(validateIcao('')).toBe(false);
    });

    it('should return false for codes with special characters', () => {
      expect(validateIcao('LE-MD')).toBe(false);
      expect(validateIcao('LE MD')).toBe(false);
    });
  });

  describe('validateIata', () => {
    it('should return true for valid IATA codes', () => {
      expect(validateIata('MAD')).toBe(true);
      expect(validateIata('BCN')).toBe(true);
      expect(validateIata('AG')).toBe(true);
    });

    it('should return false for invalid IATA codes', () => {
      expect(validateIata('M')).toBe(false);
      expect(validateIata('MADX')).toBe(false);
      expect(validateIata('')).toBe(false);
    });
  });

  describe('validateCallsign', () => {
    it('should return true for valid callsigns', () => {
      expect(validateCallsign('IBE1234')).toBe(true);
      expect(validateCallsign('RYR')).toBe(true);
      expect(validateCallsign('VLG 123')).toBe(true);
    });

    it('should return true for minimum length', () => {
      expect(validateCallsign('IB')).toBe(true);
    });

    it('should return false for too short callsigns', () => {
      expect(validateCallsign('I')).toBe(false);
      expect(validateCallsign('')).toBe(false);
    });

    it('should return false for too long callsigns', () => {
      expect(validateCallsign('IBE12345678')).toBe(false);
    });

    it('should return false for callsigns with special characters', () => {
      expect(validateCallsign('IBE-123')).toBe(false);
      expect(validateCallsign('IBE.123')).toBe(false);
    });

    it('should allow alphanumeric and spaces', () => {
      expect(validateCallsign('ABC 123')).toBe(true);
      expect(validateCallsign('ABC123')).toBe(true);
    });
  });

  describe('validateFlightType', () => {
    it('should return true for departures', () => {
      expect(validateFlightType('departures')).toBe(true);
    });

    it('should return true for arrivals', () => {
      expect(validateFlightType('arrivals')).toBe(true);
    });

    it('should return false for invalid types', () => {
      expect(validateFlightType('DEPARTURES')).toBe(false);
      expect(validateFlightType('departure')).toBe(false);
      expect(validateFlightType('invalid')).toBe(false);
      expect(validateFlightType('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://api.opensky-network.org')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });
});
