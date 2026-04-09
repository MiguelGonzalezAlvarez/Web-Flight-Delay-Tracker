import { DelayPrediction } from '@/src/domain/entities/DelayPrediction';
import { InMemoryDelayPredictionRepository } from '@/src/infrastructure/persistence/InMemoryDelayPredictionRepository';

describe('InMemoryDelayPredictionRepository', () => {
  let repository: InMemoryDelayPredictionRepository;

  beforeEach(() => {
    repository = new InMemoryDelayPredictionRepository();
  });

  const createPrediction = (overrides?: { riskLevel?: 'low' | 'medium' | 'high'; basedOnRecords?: number }) => {
    return DelayPrediction.fromPercentage(
      overrides?.riskLevel === 'high' ? 85 : overrides?.riskLevel === 'medium' ? 50 : 20,
      30,
      overrides?.basedOnRecords || 25
    );
  };

  describe('save and findByFlightId', () => {
    it('should save and retrieve prediction by flight id', async () => {
      const prediction = createPrediction();
      await repository.save(prediction, 'flight-1');

      const result = await repository.findByFlightId('flight-1');

      expect(result).not.toBeNull();
      expect(result!.value.percentage).toBe(20);
    });

    it('should return null for non-existent flight id', async () => {
      const result = await repository.findByFlightId('non-existent');

      expect(result).toBeNull();
    });

    it('should overwrite existing prediction', async () => {
      await repository.save(createPrediction({ riskLevel: 'low' }), 'flight-1');
      await repository.save(createPrediction({ riskLevel: 'high' }), 'flight-1');

      const result = await repository.findByFlightId('flight-1');

      expect(result!.value.riskLevel.value).toBe('high');
    });
  });

  describe('findByRiskLevel', () => {
    it('should find predictions by risk level', async () => {
      await repository.save(createPrediction({ riskLevel: 'low' }), 'f1');
      await repository.save(createPrediction({ riskLevel: 'high' }), 'f2');
      await repository.save(createPrediction({ riskLevel: 'high' }), 'f3');

      const results = await repository.findByRiskLevel('high');

      expect(results).toHaveLength(2);
    });

    it('should return empty array for non-matching risk level', async () => {
      await repository.save(createPrediction({ riskLevel: 'low' }), 'f1');

      const results = await repository.findByRiskLevel('high');

      expect(results).toHaveLength(0);
    });
  });

  describe('findHighRisk', () => {
    it('should return only high risk predictions', async () => {
      await repository.save(createPrediction({ riskLevel: 'low' }), 'f1');
      await repository.save(createPrediction({ riskLevel: 'high' }), 'f2');
      await repository.save(createPrediction({ riskLevel: 'medium' }), 'f3');

      const results = await repository.findHighRisk();

      expect(results).toHaveLength(1);
      expect(results[0].value.riskLevel.value).toBe('high');
    });
  });

  describe('deleteByFlightId', () => {
    it('should delete existing prediction', async () => {
      await repository.save(createPrediction(), 'flight-1');

      const result = await repository.deleteByFlightId('flight-1');

      expect(result.ok).toBe(true);
      expect(await repository.findByFlightId('flight-1')).toBeNull();
    });

    it('should return failure for non-existent flight', async () => {
      const result = await repository.deleteByFlightId('non-existent');

      expect(result.ok).toBe(false);
    });
  });

  describe('findReliable', () => {
    it('should return only reliable predictions (based on 10+ records)', async () => {
      await repository.save(createPrediction({ basedOnRecords: 5 }), 'f1');
      await repository.save(createPrediction({ basedOnRecords: 15 }), 'f2');
      await repository.save(createPrediction({ basedOnRecords: 50 }), 'f3');

      const results = await repository.findReliable();

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.value.isReliable())).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all predictions', async () => {
      await repository.save(createPrediction(), 'f1');
      await repository.save(createPrediction(), 'f2');

      repository.clear();

      expect(await repository.findByFlightId('f1')).toBeNull();
      expect(await repository.findByFlightId('f2')).toBeNull();
    });
  });

  describe('size', () => {
    it('should return correct count', async () => {
      expect(repository.size()).toBe(0);
      await repository.save(createPrediction(), 'f1');
      expect(repository.size()).toBe(1);
      await repository.save(createPrediction(), 'f2');
      expect(repository.size()).toBe(2);
    });
  });
});
