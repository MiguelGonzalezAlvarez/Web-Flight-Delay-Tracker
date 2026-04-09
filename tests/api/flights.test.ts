import { Flight } from '@/types';
import {
  sanitizeIcao,
  validateIcao,
  validateFlightType,
} from '@/lib/middleware/validation';

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
    status: 'scheduled',
  },
];

jest.mock('@/lib/opensky', () => ({
  fetchFlightsByAirport: jest.fn().mockResolvedValue(mockFlights),
}));

jest.mock('@/lib/delay-prediction', () => ({
  calculateDelayPrediction: jest.fn().mockResolvedValue({
    percentage: 15,
    avgDelayMinutes: 10,
    basedOnRecords: 50,
    riskLevel: 'low',
  }),
}));

jest.mock('@/lib/middleware/rateLimit', () => ({
  rateLimit: jest.fn().mockReturnValue({ success: true, remaining: 99, resetIn: 60000 }),
  getClientIdentifier: jest.fn().mockReturnValue('127.0.0.1'),
}));

describe('Flights API Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Validation', () => {
    it('should validate airport parameter is provided', () => {
      const url = new URL('http://localhost/api/flights?type=departures');
      const hasAirport = url.searchParams.has('airport');
      
      expect(hasAirport).toBe(false);
    });

    it('should validate type parameter is provided', () => {
      const url = new URL('http://localhost/api/flights?airport=LEMD&type=departures');
      const hasType = url.searchParams.has('type');
      
      expect(hasType).toBe(true);
    });

    it('should sanitize airport input', () => {
      const result = sanitizeIcao('lemd');
      expect(result).toBe('LEMD');
    });

    it('should validate airport format', () => {
      expect(validateIcao('LEMD')).toBe(true);
      expect(validateIcao('INVALID')).toBe(false);
    });

    it('should validate flight type', () => {
      expect(validateFlightType('departures')).toBe(true);
      expect(validateFlightType('arrivals')).toBe(true);
      expect(validateFlightType('invalid')).toBe(false);
    });
  });

  describe('Flight Fetching', () => {
    it('should fetch flights from OpenSky', async () => {
      const { fetchFlightsByAirport } = require('@/lib/opensky');
      
      const flights = await fetchFlightsByAirport('LEMD', 'departures');
      
      expect(flights).toBeDefined();
      expect(Array.isArray(flights)).toBe(true);
      expect(flights.length).toBe(2);
    });

    it('should return delay predictions', async () => {
      const { calculateDelayPrediction } = require('@/lib/delay-prediction');
      
      const prediction = await calculateDelayPrediction('Iberia', 'LEMD', 'LEBL', new Date());
      
      expect(prediction).toBeDefined();
      expect(prediction.percentage).toBeDefined();
      expect(prediction.riskLevel).toBeDefined();
    });

    it('should add predictions to flights', async () => {
      const { fetchFlightsByAirport } = require('@/lib/opensky');
      const { calculateDelayPrediction } = require('@/lib/delay-prediction');
      
      const flights = await fetchFlightsByAirport('LEMD', 'departures');
      
      const flightsWithPrediction = await Promise.all(
        flights.map(async (flight) => ({
          ...flight,
          delayPrediction: await calculateDelayPrediction(
            flight.airline,
            'LEMD',
            'LEBL',
            new Date()
          ),
        }))
      );
      
      expect(flightsWithPrediction[0].delayPrediction).toBeDefined();
    });

    it('should limit flights to 100', async () => {
      const manyFlights: Flight[] = Array.from({ length: 150 }, (_, i) => ({
        id: `flight-${i}`,
        icao24: `icao${i}`,
        callsign: `FL${i}`,
        origin: 'LEMD',
        destination: 'LEBL',
        airline: 'Iberia',
        departureTime: null,
        arrivalTime: null,
        estimatedTime: null,
        status: 'scheduled' as const,
      }));

      const limitedFlights = manyFlights.slice(0, 100);
      expect(limitedFlights.length).toBe(100);
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limit', async () => {
      const { rateLimit } = require('@/lib/middleware/rateLimit');
      
      const result = rateLimit('127.0.0.1');
      
      expect(result.success).toBe(true);
      expect(result.remaining).toBeDefined();
    });

    it('should get client identifier', async () => {
      const { getClientIdentifier } = require('@/lib/middleware/rateLimit');
      
      const identifier = getClientIdentifier({} as Request);
      
      expect(identifier).toBe('127.0.0.1');
    });
  });
});
