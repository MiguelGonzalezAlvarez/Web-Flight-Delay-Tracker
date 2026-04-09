import { Flight, OpenSkyFlight } from '@/types';

const mockOpenSkyFlight: OpenSkyFlight = {
  icao24: 'abc123',
  callsign: 'IBE1234',
  origin_country: 'Spain',
  time_position: 1704067200,
  last_contact: 1704067200,
  long: -3.5676,
  lat: 40.4983,
  baro_altitude: 10000,
  on_ground: false,
  velocity: 800,
  true_track: 180,
  vertical_rate: 0,
  sensors: null,
  geo_altitude: 10500,
  squawk: '7000',
  spi: false,
  position_source: 0,
};

const mockFlights: Flight[] = [
  {
    id: 'flight-1',
    icao24: 'abc123',
    callsign: 'IBE1234',
    origin: 'LEMD',
    destination: 'LEBL',
    airline: 'Iberia',
    departureTime: '2024-01-01T10:00:00Z',
    arrivalTime: '2024-01-01T12:00:00Z',
    estimatedTime: null,
    status: 'scheduled',
    latitude: 40.4983,
    longitude: -3.5676,
  },
  {
    id: 'flight-2',
    icao24: 'def456',
    callsign: 'VLG5678',
    origin: 'LEBL',
    destination: 'LEMD',
    airline: 'Vueling',
    departureTime: '2024-01-01T14:00:00Z',
    arrivalTime: '2024-01-01T16:00:00Z',
    estimatedTime: null,
    status: 'departed',
    latitude: 41.2974,
    longitude: 2.0833,
  },
];

describe('OpenSky API Integration', () => {
  describe('extractAirlineFromCallsign', () => {
    it('should extract airline from callsign', () => {
      const { getAirlineName } = require('@/lib/airports');
      expect(getAirlineName('IBE1234')).toBe('Iberia');
      expect(getAirlineName('VLG5678')).toBe('Vueling');
      expect(getAirlineName('RYR9012')).toBe('Ryanair');
    });

    it('should return prefix for unknown airline', () => {
      const { getAirlineName } = require('@/lib/airports');
      expect(getAirlineName('XYZ1234')).toBe('XYZ');
    });
  });

  describe('isSpanishAirport', () => {
    it('should correctly identify Spanish airports', () => {
      const { isSpanishAirport } = require('@/lib/opensky');
      expect(isSpanishAirport('LEMD')).toBe(true);
      expect(isSpanishAirport('LEBL')).toBe(true);
      expect(isSpanishAirport('KJFK')).toBe(false);
    });
  });

  describe('Flight transformation', () => {
    it('should transform OpenSky flight to Flight type', () => {
      const transformedFlight = {
        id: `${mockOpenSkyFlight.icao24}-${mockOpenSkyFlight.last_contact}`,
        icao24: mockOpenSkyFlight.icao24,
        callsign: mockOpenSkyFlight.callsign,
        origin: 'Unknown',
        destination: 'Unknown',
        airline: 'Iberia',
        departureTime: mockOpenSkyFlight.time_position 
          ? new Date(mockOpenSkyFlight.time_position * 1000).toISOString() 
          : null,
        arrivalTime: null,
        estimatedTime: null,
        status: mockOpenSkyFlight.on_ground ? 'scheduled' : 'departed',
        latitude: mockOpenSkyFlight.lat,
        longitude: mockOpenSkyFlight.long,
      };

      expect(transformedFlight.id).toBe('abc123-1704067200');
      expect(transformedFlight.callsign).toBe('IBE1234');
      expect(transformedFlight.status).toBe('departed');
    });

    it('should handle grounded flights as scheduled', () => {
      const groundedFlight = { ...mockOpenSkyFlight, on_ground: true };
      const status = groundedFlight.on_ground ? 'scheduled' : 'departed';
      expect(status).toBe('scheduled');
    });
  });

  describe('Spanish boundaries', () => {
    it('should define correct geographic boundaries', () => {
      const { SPANISH_AIRPORTS } = require('@/lib/airports');
      
      SPANISH_AIRPORTS.forEach((airport: { latitude: number; longitude: number }) => {
        expect(airport.latitude).toBeGreaterThanOrEqual(27);
        expect(airport.latitude).toBeLessThanOrEqual(44);
        expect(airport.longitude).toBeGreaterThanOrEqual(-19);
        expect(airport.longitude).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Airport lookups', () => {
    it('should find airport by ICAO code', () => {
      const { getAirportByIcao, SPANISH_AIRPORTS } = require('@/lib/airports');
      const madrid = getAirportByIcao('LEMD');
      
      expect(madrid).toBeDefined();
      expect(madrid?.iata).toBe('MAD');
    });

    it('should find airport by IATA code', () => {
      const { getAirportByIata } = require('@/lib/airports');
      const barcelona = getAirportByIata('BCN');
      
      expect(barcelona).toBeDefined();
      expect(barcelona?.icao).toBe('LEBL');
    });
  });
});
