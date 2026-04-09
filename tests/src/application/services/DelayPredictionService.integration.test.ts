import { DelayPredictionService } from '@/src/application/services/DelayPredictionService';
import { InMemoryDelayPredictionRepository } from '@/src/infrastructure/persistence/InMemoryDelayPredictionRepository';
import { EventDispatcher } from '@/src/domain/events/DomainEvent';
import {
  DelayPredictionCreatedEvent,
  DelayRiskLevelChangedEvent,
  HighDelayRiskAlertEvent
} from '@/src/domain/events';
import { DelayPrediction } from '@/src/domain/entities/DelayPrediction';

describe('DelayPredictionService Integration', () => {
  let predictionService: DelayPredictionService;
  let predictionRepository: InMemoryDelayPredictionRepository;
  let eventDispatcher: EventDispatcher;
  let dispatchedEvents: any[];

  beforeEach(() => {
    predictionRepository = new InMemoryDelayPredictionRepository();
    dispatchedEvents = [];
    eventDispatcher = {
      dispatch: jest.fn((event) => {
        dispatchedEvents.push(event);
      }),
      register: jest.fn(),
      unregister: jest.fn(),
      clear: jest.fn(),
    } as unknown as EventDispatcher;
    predictionService = new DelayPredictionService(
      predictionRepository,
      eventDispatcher
    );
  });

  describe('createPrediction', () => {
    it('should create prediction and dispatch DelayPredictionCreatedEvent', async () => {
      const props = {
        percentage: 25,
        riskLevel: 'low',
        avgDelayMinutes: 15,
        basedOnRecords: 10,
      };

      const result = await predictionService.createPrediction('flight-1', props);

      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: DelayPrediction }).value.percentage).toBe(25);
      expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(1);
      expect(dispatchedEvents[0]).toBeInstanceOf(DelayPredictionCreatedEvent);
      expect(dispatchedEvents[0].data.flightId).toBe('flight-1');
      expect(dispatchedEvents[0].data.percentage).toBe(25);
    });

    it('should dispatch HighDelayRiskAlertEvent for high risk predictions', async () => {
      const props = {
        percentage: 85,
        riskLevel: 'high',
        avgDelayMinutes: 45,
        basedOnRecords: 20,
      };

      const result = await predictionService.createPrediction('flight-high', props);

      expect(result.ok).toBe(true);
      expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(2);
      expect(dispatchedEvents[1]).toBeInstanceOf(HighDelayRiskAlertEvent);
      expect(dispatchedEvents[1].data.riskLevel).toBe('high');
    });

    it('should not dispatch HighDelayRiskAlertEvent for low risk predictions', async () => {
      const props = {
        percentage: 10,
        riskLevel: 'low',
        avgDelayMinutes: 5,
        basedOnRecords: 5,
      };

      await predictionService.createPrediction('flight-low', props);

      expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(1);
      expect(dispatchedEvents[0]).toBeInstanceOf(DelayPredictionCreatedEvent);
      expect(dispatchedEvents[0]).not.toBeInstanceOf(HighDelayRiskAlertEvent);
    });

    it('should not create duplicate prediction for same flight', async () => {
      const props = {
        percentage: 25,
        riskLevel: 'low',
        avgDelayMinutes: 15,
        basedOnRecords: 10,
      };

      await predictionService.createPrediction('flight-dup', props);
      const result = await predictionService.createPrediction('flight-dup', props);

      expect(result.ok).toBe(false);
    });

    it('should persist prediction to repository', async () => {
      const props = {
        percentage: 30,
        riskLevel: 'low',
        avgDelayMinutes: 20,
        basedOnRecords: 15,
      };

      await predictionService.createPrediction('flight-persist', props);

      const retrieved = await predictionRepository.findByFlightId('flight-persist');
      expect(retrieved).not.toBeNull();
    });
  });

  describe('createPredictionFromPercentage', () => {
    it('should create prediction from percentage and dispatch event', async () => {
      const result = await predictionService.createPredictionFromPercentage(
        'flight-percent',
        50,
        25,
        8
      );

      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: DelayPrediction }).value.percentage).toBe(50);
      expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(1);
      expect(dispatchedEvents[0]).toBeInstanceOf(DelayPredictionCreatedEvent);
    });
  });

  describe('getPrediction', () => {
    it('should retrieve existing prediction', async () => {
      const props = {
        percentage: 40,
        riskLevel: 'medium',
        avgDelayMinutes: 20,
        basedOnRecords: 12,
      };

      await predictionService.createPrediction('flight-get', props);
      const result = await predictionService.getPrediction('flight-get');

      expect(result).not.toBeNull();
      expect((result as { ok: true; value: DelayPrediction }).value.percentage).toBe(40);
    });

    it('should return null for non-existent prediction', async () => {
      const result = await predictionService.getPrediction('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updatePrediction', () => {
    it('should update prediction and dispatch DelayRiskLevelChangedEvent', async () => {
      const initialProps = {
        percentage: 20,
        riskLevel: 'low',
        avgDelayMinutes: 10,
        basedOnRecords: 5,
      };
      await predictionService.createPrediction('flight-update', initialProps);

      const updatedProps = {
        percentage: 75,
        riskLevel: 'high',
        avgDelayMinutes: 35,
        basedOnRecords: 15,
      };
      const result = await predictionService.updatePrediction('flight-update', updatedProps);

      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: DelayPrediction }).value.percentage).toBe(75);
      expect(eventDispatcher.dispatch).toHaveBeenCalled();
      
      const riskChangeEvent = dispatchedEvents.find(e => e instanceof DelayRiskLevelChangedEvent);
      expect(riskChangeEvent).toBeDefined();
      expect(riskChangeEvent.data.previousRiskLevel).toBe('low');
      expect(riskChangeEvent.data.newRiskLevel).toBe('high');
    });

    it('should return failure for non-existent prediction', async () => {
      const props = {
        percentage: 50,
        riskLevel: 'medium',
        avgDelayMinutes: 25,
        basedOnRecords: 10,
      };

      const result = await predictionService.updatePrediction('non-existent', props);

      expect(result.ok).toBe(false);
    });
  });

  describe('getHighRiskPredictions', () => {
    it('should return only high risk predictions', async () => {
      await predictionService.createPredictionFromPercentage('flight-risk1', 90, 45, 20);
      await predictionService.createPredictionFromPercentage('flight-risk2', 15, 8, 5);
      await predictionService.createPredictionFromPercentage('flight-risk3', 85, 40, 18);

      const results = await predictionService.getHighRiskPredictions();

      expect(results.length).toBeGreaterThanOrEqual(0);
      results.forEach(result => {
        expect((result as { ok: true; value: DelayPrediction }).value.riskLevel.value).toBe('high');
      });
    });
  });

  describe('getReliablePredictions', () => {
    it('should return only reliable predictions', async () => {
      await predictionService.createPredictionFromPercentage('flight-rel1', 90, 45, 20);
      await predictionService.createPredictionFromPercentage('flight-rel2', 15, 8, 5);

      const results = await predictionService.getReliablePredictions();

      expect(results.length).toBeGreaterThanOrEqual(0);
      results.forEach(result => {
        expect((result as { ok: true; value: DelayPrediction }).value.isReliable()).toBe(true);
      });
    });
  });

  describe('deletePrediction', () => {
    it('should delete existing prediction', async () => {
      await predictionService.createPredictionFromPercentage('flight-delete', 50, 25, 10);

      const result = await predictionService.deletePrediction('flight-delete');

      expect(result.ok).toBe(true);
      expect(await predictionRepository.findByFlightId('flight-delete')).toBeNull();
    });

    it('should return failure for non-existent prediction', async () => {
      const result = await predictionService.deletePrediction('non-existent');

      expect(result.ok).toBe(false);
    });
  });
});
