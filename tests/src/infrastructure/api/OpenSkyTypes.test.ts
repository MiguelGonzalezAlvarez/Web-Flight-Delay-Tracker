import {
  isSpanishFlight,
  isSpanishIcao24,
  normalizeCallsign,
  type OpenSkyStateVector,
} from '@/src/infrastructure/api/OpenSkyTypes';

describe('OpenSkyTypes', () => {
  describe('isSpanishFlight', () => {
    it('should return true for Spanish flights', () => {
      const flight: OpenSkyStateVector = {
        icao24: 'ibe1234',
        callsign: 'IBE1234',
        origin_country: 'Spain',
        time_position: null,
        last_contact: 1234567890,
        longitude: -3.562,
        latitude: 40.4719,
        baro_altitude: 10000,
        on_ground: false,
        velocity: 800,
        true_track: 90,
        vertical_rate: 0,
        sensors: null,
        geo_altitude: 10500,
        squawk: null,
        spi: false,
        position_source: 0,
      };

      expect(isSpanishFlight(flight)).toBe(true);
    });

    it('should return false for non-Spanish flights', () => {
      const flight: OpenSkyStateVector = {
        icao24: 'dfg5678',
        callsign: 'AFR1234',
        origin_country: 'France',
        time_position: null,
        last_contact: 1234567890,
        longitude: 2.35,
        latitude: 48.86,
        baro_altitude: 10000,
        on_ground: false,
        velocity: 800,
        true_track: 180,
        vertical_rate: 0,
        sensors: null,
        geo_altitude: 10500,
        squawk: null,
        spi: false,
        position_source: 0,
      };

      expect(isSpanishFlight(flight)).toBe(false);
    });
  });

  describe('isSpanishIcao24', () => {
    it('should return true for LE prefix (mainland Spain)', () => {
      expect(isSpanishIcao24('LEMD')).toBe(true);
      expect(isSpanishIcao24('LEBL')).toBe(true);
      expect(isSpanishIcao24('lemd')).toBe(true);
    });

    it('should return true for GC prefix (Canary Islands)', () => {
      expect(isSpanishIcao24('GCXO')).toBe(true);
      expect(isSpanishIcao24('GCLA')).toBe(true);
    });

    it('should return false for other countries', () => {
      expect(isSpanishIcao24('EGLL')).toBe(false);
      expect(isSpanishIcao24('LFPG')).toBe(false);
      expect(isSpanishIcao24('KJFK')).toBe(false);
    });
  });

  describe('normalizeCallsign', () => {
    it('should normalize valid callsign', () => {
      expect(normalizeCallsign('IBE1234')).toBe('IBE1234');
      expect(normalizeCallsign('ibe1234')).toBe('IBE1234');
      expect(normalizeCallsign('  IBE 1234  ')).toBe('IBE1234');
    });

    it('should handle null input', () => {
      expect(normalizeCallsign(null)).toBeNull();
    });

    it('should handle empty string', () => {
      expect(normalizeCallsign('')).toBeNull();
    });
  });
});
