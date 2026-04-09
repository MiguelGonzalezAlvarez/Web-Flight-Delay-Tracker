import { AirportMapper } from '@/src/infrastructure/mappers/AirportMapper';

describe('AirportMapper', () => {
  describe('toEntity', () => {
    it('should convert valid DTO to Airport entity', () => {
      const dto = {
        icao: 'LEMD',
        iata: 'MAD',
        name: 'Adolfo Suárez Madrid-Barajas',
        city: 'Madrid',
      };

      const result = AirportMapper.toEntity(dto);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.icao.toString()).toBe('LEMD');
        expect(result.value.iata?.toString()).toBe('MAD');
        expect(result.value.name).toBe('Adolfo Suárez Madrid-Barajas');
        expect(result.value.city).toBe('Madrid');
      }
    });

    it('should sanitize invalid ICAO codes', () => {
      const dto = {
        icao: 'INVALID',
        iata: 'XXX',
        name: 'Test Airport',
        city: 'Test City',
      };

      const result = AirportMapper.toEntity(dto);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.icao.toString()).toBeDefined();
        expect(result.value.icao.toString().length).toBeGreaterThan(0);
      }
    });

    it('should return failure for missing name', () => {
      const dto = {
        icao: 'LEMD',
        iata: 'MAD',
        name: '',
        city: 'Madrid',
      };

      const result = AirportMapper.toEntity(dto);

      expect(result.ok).toBe(false);
    });

    it('should return failure for missing city', () => {
      const dto = {
        icao: 'LEMD',
        iata: 'MAD',
        name: 'Madrid Airport',
        city: '',
      };

      const result = AirportMapper.toEntity(dto);

      expect(result.ok).toBe(false);
    });
  });

  describe('toDTO', () => {
    it('should convert Airport entity to DTO', () => {
      const dto = {
        icao: 'LEBL',
        iata: 'BCN',
        name: 'Barcelona El Prat',
        city: 'Barcelona',
      };

      const entityResult = AirportMapper.toEntity(dto);
      if (!entityResult.ok) return;

      const result = AirportMapper.toDTO(entityResult.value);

      expect(result.icao).toBe('LEBL');
      expect(result.iata).toBe('BCN');
      expect(result.name).toBe('Barcelona El Prat');
      expect(result.city).toBe('Barcelona');
    });
  });

  describe('toDTOWithCoordinates', () => {
    it('should add coordinates to DTO', () => {
      const dto = {
        icao: 'LEMD',
        iata: 'MAD',
        name: 'Madrid Barajas',
        city: 'Madrid',
      };

      const entityResult = AirportMapper.toEntity(dto);
      if (!entityResult.ok) return;

      const result = AirportMapper.toDTOWithCoordinates(entityResult.value, 40.4983, -3.5676);

      expect(result.latitude).toBe(40.4983);
      expect(result.longitude).toBe(-3.5676);
    });
  });
});
