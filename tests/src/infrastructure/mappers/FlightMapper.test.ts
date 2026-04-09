import { FlightMapper } from '@/src/infrastructure/mappers/FlightMapper';

describe('FlightMapper', () => {
  describe('toEntity', () => {
    it('should convert valid DTO to Flight entity', () => {
      const dto = {
        id: 'flight-1',
        icao24: 'abc123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
        airline: 'Iberia',
        departureTime: '2024-03-15T10:30:00Z',
        arrivalTime: '2024-03-15T12:00:00Z',
        estimatedTime: null,
        status: 'scheduled',
      };

      const result = FlightMapper.toEntity(dto);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('flight-1');
        expect(result.value.callsign.toString()).toBe('IBE1234');
        expect(result.value.origin.toString()).toBe('LEMD');
        expect(result.value.destination.toString()).toBe('LEBL');
        expect(result.value.airline).toBe('Iberia');
        expect(result.value.status.toString()).toBe('scheduled');
      }
    });

    it('should sanitize invalid origin ICAO codes', () => {
      const dto = {
        id: 'flight-1',
        icao24: 'abc123',
        callsign: 'IBE1234',
        origin: 'INVALID',
        destination: 'LEBL',
        airline: 'Iberia',
        departureTime: null,
        arrivalTime: null,
        estimatedTime: null,
        status: 'scheduled',
      };

      const result = FlightMapper.toEntity(dto);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.origin.toString()).toBeDefined();
        expect(result.value.origin.toString().length).toBeGreaterThan(0);
      }
    });

    it('should sanitize invalid destination ICAO codes', () => {
      const dto = {
        id: 'flight-1',
        icao24: 'abc123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'INVALID',
        airline: 'Iberia',
        departureTime: null,
        arrivalTime: null,
        estimatedTime: null,
        status: 'scheduled',
      };

      const result = FlightMapper.toEntity(dto);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.destination.toString()).toBeDefined();
        expect(result.value.destination.toString().length).toBeGreaterThan(0);
      }
    });

    it('should sanitize invalid callsigns', () => {
      const dto = {
        id: 'flight-1',
        icao24: 'abc123',
        callsign: '1234',
        origin: 'LEMD',
        destination: 'LEBL',
        airline: 'Iberia',
        departureTime: null,
        arrivalTime: null,
        estimatedTime: null,
        status: 'scheduled',
      };

      const result = FlightMapper.toEntity(dto);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.callsign.toString()).toBeDefined();
      }
    });

    it('should include delay prediction when provided', () => {
      const dto = {
        id: 'flight-1',
        icao24: 'abc123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
        airline: 'Iberia',
        departureTime: null,
        arrivalTime: null,
        estimatedTime: null,
        status: 'scheduled',
        delayPrediction: {
          percentage: 65,
          riskLevel: 'medium',
          avgDelayMinutes: 90,
          basedOnRecords: 30,
        },
      };

      const result = FlightMapper.toEntity(dto);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.hasPrediction()).toBe(true);
        expect(result.value.delayPrediction?.percentage).toBe(65);
      }
    });
  });

  describe('toDTO', () => {
    it('should convert Flight entity to DTO', () => {
      const dto = {
        id: 'flight-1',
        icao24: 'abc123',
        callsign: 'VLG5678',
        origin: 'LEBL',
        destination: 'LEMD',
        airline: 'Vueling',
        departureTime: '2024-03-15T14:00:00Z',
        arrivalTime: '2024-03-15T15:30:00Z',
        estimatedTime: null,
        status: 'boarding',
      };

      const entityResult = FlightMapper.toEntity(dto);
      if (!entityResult.ok) return;

      const result = FlightMapper.toDTO(entityResult.value);

      expect(result.id).toBe('flight-1');
      expect(result.callsign).toBe('VLG5678');
      expect(result.origin).toBe('LEBL');
      expect(result.destination).toBe('LEMD');
      expect(result.airline).toBe('Vueling');
      expect(result.status).toBe('boarding');
    });
  });

  describe('fromRawOpenSky', () => {
    it('should create DTO from OpenSky data', () => {
      const data = {
        icao24: 'abc123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
        airline: 'Iberia',
        time_position: 1710509400,
        on_ground: false,
        lat: 40.4983,
        long: -3.5676,
      };

      const result = FlightMapper.fromRawOpenSky(data);

      expect(result.icao24).toBe('abc123');
      expect(result.callsign).toBe('IBE1234');
      expect(result.origin).toBe('LEMD');
      expect(result.destination).toBe('LEBL');
      expect(result.status).toBe('departed');
      expect(result.latitude).toBe(40.4983);
      expect(result.longitude).toBe(-3.5676);
    });

    it('should handle missing optional fields', () => {
      const data = {
        icao24: 'abc123',
        callsign: 'UNKNOWN',
        on_ground: true,
      };

      const result = FlightMapper.fromRawOpenSky(data);

      expect(result.origin).toBe('Unknown');
      expect(result.destination).toBe('Unknown');
      expect(result.airline).toBe('Unknown');
      expect(result.status).toBe('scheduled');
    });
  });
});
