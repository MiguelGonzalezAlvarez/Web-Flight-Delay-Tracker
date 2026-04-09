import {
  getAirportByIcao,
  getAirportByIata,
  getAirlineName,
  getUniqueAirlines,
  SPANISH_AIRPORTS,
  MAJOR_AIRPORTS,
} from '@/lib/airports';

describe('Airport Functions', () => {
  describe('getAirportByIcao', () => {
    it('should return airport for valid ICAO code', () => {
      const airport = getAirportByIcao('LEMD');
      expect(airport).toBeDefined();
      expect(airport?.iata).toBe('MAD');
      expect(airport?.city).toBe('Madrid');
    });

    it('should return undefined for invalid ICAO code', () => {
      const airport = getAirportByIcao('INVALID');
      expect(airport).toBeUndefined();
    });

    it('should be case sensitive', () => {
      const airport = getAirportByIcao('lemd');
      expect(airport).toBeUndefined();
      const airportUpper = getAirportByIcao('LEMD');
      expect(airportUpper).toBeDefined();
    });
  });

  describe('getAirportByIata', () => {
    it('should return airport for valid IATA code', () => {
      const airport = getAirportByIata('BCN');
      expect(airport).toBeDefined();
      expect(airport?.icao).toBe('LEBL');
      expect(airport?.city).toBe('Barcelona');
    });

    it('should return undefined for invalid IATA code', () => {
      const airport = getAirportByIata('XXX');
      expect(airport).toBeUndefined();
    });
  });

  describe('SPANISH_AIRPORTS', () => {
    it('should contain valid airports', () => {
      expect(SPANISH_AIRPORTS.length).toBeGreaterThan(0);
    });

    it('should have unique ICAO codes', () => {
      const icaos = SPANISH_AIRPORTS.map(a => a.icao);
      const uniqueIcaos = new Set(icaos);
      expect(uniqueIcaos.size).toBe(icaos.length);
    });

    it('should have all required properties for each airport', () => {
      SPANISH_AIRPORTS.forEach(airport => {
        expect(airport.icao).toBeDefined();
        expect(airport.iata).toBeDefined();
        expect(airport.name).toBeDefined();
        expect(airport.city).toBeDefined();
        expect(typeof airport.latitude).toBe('number');
        expect(typeof airport.longitude).toBe('number');
      });
    });
  });

  describe('MAJOR_AIRPORTS', () => {
    it('should be a subset of SPANISH_AIRPORTS', () => {
      MAJOR_AIRPORTS.forEach(airport => {
        const found = SPANISH_AIRPORTS.find(a => a.icao === airport.icao);
        expect(found).toBeDefined();
      });
    });

    it('should contain important airports', () => {
      const majorIcaos = MAJOR_AIRPORTS.map(a => a.icao);
      expect(majorIcaos).toContain('LEMD');
      expect(majorIcaos).toContain('LEBL');
      expect(majorIcaos).toContain('LEAL');
      expect(majorIcaos).toContain('LEMG');
    });
  });
});

describe('Airline Functions', () => {
  describe('getAirlineName', () => {
    it('should return airline name for known callsign prefix', () => {
      expect(getAirlineName('IBE1234')).toBe('Iberia');
      expect(getAirlineName('VLG5678')).toBe('Vueling');
      expect(getAirlineName('RYR9012')).toBe('Ryanair');
    });

    it('should return uppercase prefix for unknown callsign', () => {
      expect(getAirlineName('XYZ123')).toBe('XYZ');
      expect(getAirlineName('UNKNOWN')).toBe('UNK');
    });

    it('should handle lowercase callsigns', () => {
      expect(getAirlineName('ibe1234')).toBe('Iberia');
    });

    it('should handle callsigns with spaces', () => {
      expect(getAirlineName('IBE 1234')).toBe('Iberia');
    });

    it('should handle short callsigns', () => {
      expect(getAirlineName('IB')).toBe('IB');
      expect(getAirlineName('I')).toBe('I');
    });
  });

  describe('getUniqueAirlines', () => {
    it('should return sorted array of airline names', () => {
      const airlines = getUniqueAirlines();
      expect(Array.isArray(airlines)).toBe(true);
      expect(airlines.length).toBeGreaterThan(0);
      
      const sortedAirlines = [...airlines].sort();
      expect(airlines).toEqual(sortedAirlines);
    });

    it('should contain common airlines', () => {
      const airlines = getUniqueAirlines();
      expect(airlines).toContain('Iberia');
      expect(airlines).toContain('Ryanair');
      expect(airlines).toContain('Vueling');
    });
  });
});
