import { Airport } from '@/src/domain/entities/Airport';

describe('Airport', () => {
  describe('create', () => {
    describe('valid inputs', () => {
      it('should create a valid airport', () => {
        const result = Airport.create({
          icao: 'LEMD',
          iata: 'MAD',
          name: 'Adolfo Suárez Madrid–Barajas Airport',
          city: 'Madrid',
          country: 'Spain',
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.icao.value).toBe('LEMD');
          expect(result.value.iata?.value).toBe('MAD');
          expect(result.value.name).toBe('Adolfo Suárez Madrid–Barajas Airport');
          expect(result.value.city).toBe('Madrid');
          expect(result.value.country).toBe('Spain');
        }
      });

      it('should create airport without iata', () => {
        const result = Airport.create({
          icao: 'LEMD',
          name: 'Adolfo Suárez Madrid–Barajas Airport',
          city: 'Madrid',
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.iata).toBeUndefined();
        }
      });

      it('should default country to Spain', () => {
        const result = Airport.create({
          icao: 'LEMD',
          name: 'Madrid Airport',
          city: 'Madrid',
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.country).toBe('Spain');
        }
      });

      it('should normalize icao to uppercase', () => {
        const result = Airport.create({
          icao: 'lemd',
          name: 'Madrid Airport',
          city: 'Madrid',
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.icao.value).toBe('LEMD');
        }
      });
    });

    describe('invalid inputs', () => {
      it('should reject icao that is too short', () => {
        const result = Airport.create({
          icao: 'XX',
          name: 'Test Airport',
          city: 'Test City',
        });

        expect(result.ok).toBe(false);
      });

      it('should reject invalid iata', () => {
        const result = Airport.create({
          icao: 'LEMD',
          iata: 'INVALID',
          name: 'Test Airport',
          city: 'Test City',
        });

        expect(result.ok).toBe(false);
      });

      it('should reject missing name', () => {
        const result = Airport.create({
          icao: 'LEMD',
          city: 'Madrid',
        });

        expect(result.ok).toBe(false);
      });

      it('should reject missing city', () => {
        const result = Airport.create({
          icao: 'LEMD',
          name: 'Madrid Airport',
        });

        expect(result.ok).toBe(false);
      });
    });
  });

  describe('createSpanish', () => {
    it('should create a Spanish airport', () => {
      const result = Airport.createSpanish('LEMD', 'MAD', 'Madrid Airport', 'Madrid');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.country).toBe('Spain');
      }
    });
  });

  describe('isSpanish', () => {
    it('should return true for LE prefix', () => {
      const airport = Airport.createUnsafe({
        icao: 'LEMD',
        name: 'Madrid',
        city: 'Madrid',
      });

      expect(airport.isSpanish()).toBe(true);
    });

    it('should return true for GC prefix', () => {
      const airport = Airport.createUnsafe({
        icao: 'GCLA',
        name: 'Gran Canaria',
        city: 'Las Palmas',
      });

      expect(airport.isSpanish()).toBe(true);
    });

    it('should return false for other countries', () => {
      const airport = Airport.createUnsafe({
        icao: 'EGLL',
        name: 'London Heathrow',
        city: 'London',
        country: 'United Kingdom',
      });

      expect(airport.isSpanish()).toBe(false);
    });
  });

  describe('matches', () => {
    const airport = Airport.createUnsafe({
      icao: 'LEMD',
      iata: 'MAD',
      name: 'Adolfo Suárez Madrid–Barajas Airport',
      city: 'Madrid',
    });

    it('should match by ICAO code', () => {
      expect(airport.matches('LEMD')).toBe(true);
      expect(airport.matches('lemd')).toBe(true);
    });

    it('should match by IATA code', () => {
      expect(airport.matches('MAD')).toBe(true);
      expect(airport.matches('mad')).toBe(true);
    });

    it('should match by name', () => {
      expect(airport.matches('Adolfo')).toBe(true);
      expect(airport.matches('Madrid')).toBe(true);
    });

    it('should match by city', () => {
      expect(airport.matches('madrid')).toBe(true);
    });

    it('should not match unrelated query', () => {
      expect(airport.matches('Barcelona')).toBe(false);
    });

    it('should not match empty query', () => {
      expect(airport.matches('')).toBe(false);
      expect(airport.matches('   ')).toBe(false);
    });
  });

  describe('getDisplayCode', () => {
    const airport = Airport.createUnsafe({
      icao: 'LEMD',
      iata: 'MAD',
      name: 'Madrid',
      city: 'Madrid',
    });

    it('should return IATA when available (auto)', () => {
      expect(airport.getDisplayCode('auto')).toBe('MAD');
    });

    it('should return ICAO when no IATA (auto)', () => {
      const airportNoIata = Airport.createUnsafe({
        icao: 'LEMD',
        name: 'Madrid',
        city: 'Madrid',
      });

      expect(airportNoIata.getDisplayCode('auto')).toBe('LEMD');
    });

    it('should return ICAO when requested', () => {
      expect(airport.getDisplayCode('icao')).toBe('LEMD');
    });

    it('should return IATA when requested', () => {
      expect(airport.getDisplayCode('iata')).toBe('MAD');
    });
  });

  describe('getLocation', () => {
    it('should return city and country', () => {
      const airport = Airport.createUnsafe({
        icao: 'LEMD',
        name: 'Madrid',
        city: 'Madrid',
        country: 'Spain',
      });

      expect(airport.getLocation()).toBe('Madrid, Spain');
    });
  });

  describe('equals', () => {
    it('should return true for same ICAO', () => {
      const a1 = Airport.createUnsafe({
        icao: 'LEMD',
        name: 'Madrid',
        city: 'Madrid',
      });
      const a2 = Airport.createUnsafe({
        icao: 'LEMD',
        name: 'Madrid Airport',
        city: 'Madrid City',
      });

      expect(a1.equals(a2)).toBe(true);
    });

    it('should return false for different ICAO', () => {
      const a1 = Airport.createUnsafe({
        icao: 'LEMD',
        name: 'Madrid',
        city: 'Madrid',
      });
      const a2 = Airport.createUnsafe({
        icao: 'LEBL',
        name: 'Barcelona',
        city: 'Barcelona',
      });

      expect(a1.equals(a2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const airport = Airport.createUnsafe({
        icao: 'LEMD',
        iata: 'MAD',
        name: 'Madrid Airport',
        city: 'Madrid',
      });

      expect(airport.toString()).toBe('MAD - Madrid Airport (Madrid)');
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const airport = Airport.createUnsafe({
        icao: 'LEMD',
        name: 'Madrid',
        city: 'Madrid',
      });

      expect(Object.isFrozen(airport)).toBe(true);
    });
  });
});
