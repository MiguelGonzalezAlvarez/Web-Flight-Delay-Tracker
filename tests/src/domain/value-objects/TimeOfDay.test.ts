import { TimeOfDay } from '@/src/domain/value-objects/TimeOfDay';

describe('TimeOfDay', () => {
  describe('create', () => {
    it('should create a valid TimeOfDay from string', () => {
      const result = TimeOfDay.create('morning');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe('morning');
      }
    });

    it('should reject invalid TimeOfDay values', () => {
      const result = TimeOfDay.create('invalid');
      expect(result.ok).toBe(false);
    });

    it('should reject null input', () => {
      const result = TimeOfDay.create(null);
      expect(result.ok).toBe(false);
    });

    it('should reject undefined input', () => {
      const result = TimeOfDay.create(undefined);
      expect(result.ok).toBe(false);
    });
  });

  describe('fromDate', () => {
    it('should return morning for 6AM-12PM', () => {
      const date = new Date('2024-01-01T09:00:00');
      const timeOfDay = TimeOfDay.fromDate(date);
      expect(timeOfDay.value).toBe('morning');
    });

    it('should return afternoon for 12PM-6PM', () => {
      const date = new Date('2024-01-01T14:00:00');
      const timeOfDay = TimeOfDay.fromDate(date);
      expect(timeOfDay.value).toBe('afternoon');
    });

    it('should return evening for 6PM-10PM', () => {
      const date = new Date('2024-01-01T19:00:00');
      const timeOfDay = TimeOfDay.fromDate(date);
      expect(timeOfDay.value).toBe('evening');
    });

    it('should return night for 10PM-6AM', () => {
      const date = new Date('2024-01-01T23:00:00');
      const timeOfDay = TimeOfDay.fromDate(date);
      expect(timeOfDay.value).toBe('night');
    });

    it('should return night for midnight', () => {
      const date = new Date('2024-01-01T00:00:00');
      const timeOfDay = TimeOfDay.fromDate(date);
      expect(timeOfDay.value).toBe('night');
    });

    it('should return night for 3AM', () => {
      const date = new Date('2024-01-01T03:00:00');
      const timeOfDay = TimeOfDay.fromDate(date);
      expect(timeOfDay.value).toBe('night');
    });
  });

  describe('helper methods', () => {
    it('isMorning should return true for morning', () => {
      const timeOfDay = TimeOfDay.createUnsafe('morning');
      expect(timeOfDay.isMorning()).toBe(true);
      expect(timeOfDay.isAfternoon()).toBe(false);
    });

    it('isAfternoon should return true for afternoon', () => {
      const timeOfDay = TimeOfDay.createUnsafe('afternoon');
      expect(timeOfDay.isAfternoon()).toBe(true);
      expect(timeOfDay.isEvening()).toBe(false);
    });

    it('isEvening should return true for evening', () => {
      const timeOfDay = TimeOfDay.createUnsafe('evening');
      expect(timeOfDay.isEvening()).toBe(true);
      expect(timeOfDay.isNight()).toBe(false);
    });

    it('isNight should return true for night', () => {
      const timeOfDay = TimeOfDay.createUnsafe('night');
      expect(timeOfDay.isNight()).toBe(true);
      expect(timeOfDay.isMorning()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const a = TimeOfDay.createUnsafe('morning');
      const b = TimeOfDay.createUnsafe('morning');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different values', () => {
      const a = TimeOfDay.createUnsafe('morning');
      const b = TimeOfDay.createUnsafe('afternoon');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString and toJSON', () => {
    it('should return the value as string', () => {
      const timeOfDay = TimeOfDay.createUnsafe('evening');
      expect(timeOfDay.toString()).toBe('evening');
      expect(timeOfDay.toJSON()).toBe('evening');
    });
  });
});
