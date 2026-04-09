import {
  AirlineService,
  getAirlineName,
  getAirlineCode,
  isKnownAirline,
  AIRLINE_CODES,
} from '@/src/domain/services/AirlineService';

describe('AirlineService', () => {
  beforeEach(() => {
    AirlineService.getInstance().airlineCodes;
  });

  describe('getAirlineName', () => {
    it('should return airline name for known code', () => {
      expect(getAirlineName('IBE1234')).toBe('Iberia');
      expect(getAirlineName('RYR5678')).toBe('Ryanair');
      expect(getAirlineName('VLG9012')).toBe('Vueling');
    });

    it('should return uppercase code for unknown airline', () => {
      expect(getAirlineName('XYZ1234')).toBe('XYZ');
    });

    it('should handle lowercase input', () => {
      expect(getAirlineName('ibe1234')).toBe('Iberia');
    });

    it('should handle callsigns with spaces', () => {
      expect(getAirlineName('IBE 1234')).toBe('Iberia');
    });

    it('should return Unknown for very short callsigns', () => {
      expect(getAirlineName('IB')).toBe('Unknown');
    });
  });

  describe('getAirlineCode', () => {
    it('should return 3-letter code from callsign', () => {
      expect(getAirlineCode('IBE1234')).toBe('IBE');
      expect(getAirlineCode('RYR5678')).toBe('RYR');
    });

    it('should return UNK for very short input', () => {
      expect(getAirlineCode('I')).toBe('UNK');
    });
  });

  describe('isKnownAirline', () => {
    it('should return true for known airlines', () => {
      expect(isKnownAirline('IBE1234')).toBe(true);
      expect(isKnownAirline('RYR5678')).toBe(true);
    });

    it('should return false for unknown airlines', () => {
      expect(isKnownAirline('XYZ1234')).toBe(false);
    });
  });

  describe('AIRLINE_CODES', () => {
    it('should contain common airlines', () => {
      expect(AIRLINE_CODES['IBE']).toBe('Iberia');
      expect(AIRLINE_CODES['VLG']).toBe('Vueling');
      expect(AIRLINE_CODES['RYR']).toBe('Ryanair');
      expect(AIRLINE_CODES['DLH']).toBe('Lufthansa');
    });

    it('should have more than 30 airline codes', () => {
      expect(Object.keys(AIRLINE_CODES).length).toBeGreaterThan(30);
    });
  });
});
