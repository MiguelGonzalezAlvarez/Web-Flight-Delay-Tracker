import { DelayPredictionService } from '@/src/application/services/DelayPredictionService';
import { InMemoryDelayPredictionRepository } from '@/src/infrastructure/persistence/InMemoryDelayPredictionRepository';
import { createEventDispatcher } from '@/src/domain/events/DomainEvent';
import { DelayPredictionCreatedEvent, DelayRiskLevelChangedEvent, HighDelayRiskAlertEvent } from '@/src/domain/events';

describe('DelayPredictionService', () => {
  let predictionRepository: InMemoryDelayPredictionRepository;
  let eventDispatcher: ReturnType<typeof createEventDispatcher>;
  let service: DelayPredictionService;

  beforeEach(() => {
    predictionRepository = new InMemoryDelayPredictionRepository();
    eventDispatcher = createEventDispatcher();
    eventDispatcher.clear();
    service = new DelayPredictionService(predictionRepository, eventDispatcher);
  });

  describe('createPrediction', () => {
    it('should create a prediction and dispatch event', async () => {
      const handler = jest.fn();
      eventDispatcher.register(DelayPredictionCreatedEvent, handler);

      const props = {
        percentage: 65,
        riskLevel: 'medium' as const,
        avgDelayMinutes: 90,
        basedOnRecords: 30,
      };

      const result = await service.createPrediction('flight-1', props);

      expect(result.ok).toBe(true);
      expect(result.value.percentage).toBe(65);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].data.flightId).toBe('flight-1');
    });

    it('should dispatch HighDelayRiskAlertEvent for high risk predictions', async () => {
      const handler = jest.fn();
      eventDispatcher.register(HighDelayRiskAlertEvent, handler);

      const props = {
        percentage: 85,
        riskLevel: 'high' as const,
        avgDelayMinutes: 120,
        basedOnRecords: 50,
      };

      await service.createPrediction('flight-2', props);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should return failure for duplicate prediction', async () => {
      const props = {
        percentage: 50,
        riskLevel: 'medium' as const,
        avgDelayMinutes: 60,
        basedOnRecords: 20,
      };

      await service.createPrediction('flight-3', props);
      const result = await service.createPrediction('flight-3', props);

      expect(result.ok).toBe(false);
    });

    it('should return failure for invalid props', async () => {
      const props = {
        percentage: 150,
        riskLevel: 'medium' as const,
        avgDelayMinutes: 60,
        basedOnRecords: 20,
      };

      const result = await service.createPrediction('flight-4', props);

      expect(result.ok).toBe(false);
    });
  });

  describe('createPredictionFromPercentage', () => {
    it('should create prediction from percentage', async () => {
      const result = await service.createPredictionFromPercentage('flight-5', 75, 60, 40);

      expect(result.ok).toBe(true);
      expect(result.value.percentage).toBe(75);
      expect(result.value.riskLevel.value).toBe('high');
    });
  });

  describe('getPrediction', () => {
    it('should retrieve an existing prediction', async () => {
      await service.createPrediction('flight-6', {
        percentage: 55,
        riskLevel: 'medium' as const,
        avgDelayMinutes: 75,
        basedOnRecords: 25,
      });

      const result = await service.getPrediction('flight-6');

      expect(result).not.toBeNull();
      expect(result!.value.percentage).toBe(55);
    });

    it('should return null for non-existent prediction', async () => {
      const result = await service.getPrediction('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updatePrediction', () => {
    it('should update prediction and dispatch event when risk level changes', async () => {
      await service.createPrediction('flight-7', {
        percentage: 30,
        riskLevel: 'low' as const,
        avgDelayMinutes: 30,
        basedOnRecords: 20,
      });

      const handler = jest.fn();
      eventDispatcher.register(DelayRiskLevelChangedEvent, handler);

      const result = await service.updatePrediction('flight-7', {
        percentage: 70,
        riskLevel: 'high' as const,
        avgDelayMinutes: 90,
        basedOnRecords: 25,
      });

      expect(result.ok).toBe(true);
      expect(result.value.riskLevel.value).toBe('high');
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].data.previousRiskLevel).toBe('low');
      expect(handler.mock.calls[0][0].data.newRiskLevel).toBe('high');
    });

    it('should dispatch HighDelayRiskAlertEvent when updating to high risk', async () => {
      await service.createPrediction('flight-8', {
        percentage: 30,
        riskLevel: 'low' as const,
        avgDelayMinutes: 30,
        basedOnRecords: 20,
      });

      const handler = jest.fn();
      eventDispatcher.register(HighDelayRiskAlertEvent, handler);

      await service.updatePrediction('flight-8', {
        percentage: 80,
        riskLevel: 'high' as const,
        avgDelayMinutes: 100,
        basedOnRecords: 30,
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should return failure for non-existent prediction', async () => {
      const result = await service.updatePrediction('non-existent', {
        percentage: 50,
        riskLevel: 'medium' as const,
        avgDelayMinutes: 60,
        basedOnRecords: 20,
      });

      expect(result.ok).toBe(false);
    });
  });

  describe('getHighRiskPredictions', () => {
    it('should return only high risk predictions', async () => {
      await service.createPrediction('f1', {
        percentage: 20,
        riskLevel: 'low' as const,
        avgDelayMinutes: 15,
        basedOnRecords: 10,
      });
      await service.createPrediction('f2', {
        percentage: 85,
        riskLevel: 'high' as const,
        avgDelayMinutes: 100,
        basedOnRecords: 40,
      });

      const results = await service.getHighRiskPredictions();

      expect(results).toHaveLength(1);
      expect(results[0].value.riskLevel.value).toBe('high');
    });
  });

  describe('getReliablePredictions', () => {
    it('should return only reliable predictions (basedOnRecords >= 10)', async () => {
      await service.createPrediction('f1', {
        percentage: 30,
        riskLevel: 'low' as const,
        avgDelayMinutes: 20,
        basedOnRecords: 5,
      });
      await service.createPrediction('f2', {
        percentage: 50,
        riskLevel: 'medium' as const,
        avgDelayMinutes: 45,
        basedOnRecords: 25,
      });

      const results = await service.getReliablePredictions();

      expect(results).toHaveLength(1);
      expect(results[0].value.isReliable()).toBe(true);
    });
  });

  describe('deletePrediction', () => {
    it('should delete an existing prediction', async () => {
      await service.createPrediction('to-delete', {
        percentage: 40,
        riskLevel: 'medium' as const,
        avgDelayMinutes: 50,
        basedOnRecords: 15,
      });

      const result = await service.deletePrediction('to-delete');

      expect(result.ok).toBe(true);
      expect(await service.getPrediction('to-delete')).toBeNull();
    });

    it('should return failure for non-existent prediction', async () => {
      const result = await service.deletePrediction('non-existent');

      expect(result.ok).toBe(false);
    });
  });
});
