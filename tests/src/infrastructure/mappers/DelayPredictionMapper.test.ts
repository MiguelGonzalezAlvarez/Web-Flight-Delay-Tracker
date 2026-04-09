import { DelayPredictionMapper } from '@/src/infrastructure/mappers/DelayPredictionMapper';

describe('DelayPredictionMapper', () => {
  describe('toEntity', () => {
    it('should convert valid DTO to DelayPrediction entity', () => {
      const dto = {
        percentage: 65,
        riskLevel: 'medium' as const,
        avgDelayMinutes: 90,
        basedOnRecords: 30,
      };

      const result = DelayPredictionMapper.toEntity(dto);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.percentage).toBe(65);
        expect(result.value.riskLevel.value).toBe('medium');
        expect(result.value.avgDelayMinutes).toBe(90);
        expect(result.value.basedOnRecords).toBe(30);
      }
    });

    it('should return failure for invalid percentage', () => {
      const dto = {
        percentage: 150,
        riskLevel: 'medium' as const,
        avgDelayMinutes: 90,
        basedOnRecords: 30,
      };

      const result = DelayPredictionMapper.toEntity(dto);

      expect(result.ok).toBe(false);
    });

    it('should return failure for invalid risk level', () => {
      const dto = {
        percentage: 50,
        riskLevel: 'invalid' as 'low' | 'medium' | 'high',
        avgDelayMinutes: 90,
        basedOnRecords: 30,
      };

      const result = DelayPredictionMapper.toEntity(dto);

      expect(result.ok).toBe(false);
    });
  });

  describe('toDTO', () => {
    it('should convert DelayPrediction entity to DTO', () => {
      const dto = {
        percentage: 75,
        riskLevel: 'high' as const,
        avgDelayMinutes: 120,
        basedOnRecords: 50,
      };

      const entityResult = DelayPredictionMapper.toEntity(dto);
      if (!entityResult.ok) return;

      const result = DelayPredictionMapper.toDTO(entityResult.value);

      expect(result.percentage).toBe(75);
      expect(result.riskLevel).toBe('high');
      expect(result.avgDelayMinutes).toBe(120);
      expect(result.basedOnRecords).toBe(50);
    });
  });

  describe('fromPercentage', () => {
    it('should create entity from percentage values', () => {
      const entity = DelayPredictionMapper.fromPercentage(80, 60, 25);

      expect(entity.percentage).toBe(80);
      expect(entity.riskLevel.value).toBe('high');
      expect(entity.avgDelayMinutes).toBe(60);
      expect(entity.basedOnRecords).toBe(25);
    });

    it('should correctly map low percentage to low risk', () => {
      const entity = DelayPredictionMapper.fromPercentage(15, 10, 20);

      expect(entity.riskLevel.value).toBe('low');
    });
  });

  describe('noData', () => {
    it('should create no-data prediction', () => {
      const entity = DelayPredictionMapper.noData();

      expect(entity.percentage).toBe(0);
      expect(entity.riskLevel.value).toBe('low');
      expect(entity.avgDelayMinutes).toBe(0);
      expect(entity.basedOnRecords).toBe(0);
    });
  });
});
