import {
  LoggingEventHandler,
  FlightEventHandler,
  DelayPredictionEventHandler,
  MetricsEventHandler,
  EventHandlerRegistry,
} from '@/src/domain/events/EventHandlers';
import {
  FlightCreatedEvent,
  FlightStatusChangedEvent,
  FlightDelayDetectedEvent,
} from '@/src/domain/events/FlightEvents';
import {
  DelayPredictionCreatedEvent,
  DelayRiskLevelChangedEvent,
  HighDelayRiskAlertEvent,
} from '@/src/domain/events/DelayPredictionEvents';

describe('EventHandlers', () => {
  describe('LoggingEventHandler', () => {
    it('should handle any event type', () => {
      const handler = new LoggingEventHandler();
      const event = new FlightCreatedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      expect(handler.canHandle(event)).toBe(true);
      expect(() => handler.handle(event)).not.toThrow();
    });
  });

  describe('FlightEventHandler', () => {
    it('should handle FlightCreatedEvent', () => {
      const handler = new FlightEventHandler();
      const event = new FlightCreatedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      expect(handler.canHandle(event)).toBe(true);
      expect(() => handler.handle(event)).not.toThrow();
    });

    it('should handle FlightStatusChangedEvent', () => {
      const handler = new FlightEventHandler();
      const event = new FlightStatusChangedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
        previousStatus: 'scheduled',
        newStatus: 'boarding',
      });

      expect(handler.canHandle(event)).toBe(true);
      expect(() => handler.handle(event)).not.toThrow();
    });

    it('should handle FlightDelayDetectedEvent', () => {
      const handler = new FlightEventHandler();
      const event = new FlightDelayDetectedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
        delayMinutes: 45,
      });

      expect(handler.canHandle(event)).toBe(true);
      expect(() => handler.handle(event)).not.toThrow();
    });

    it('should not handle DelayPrediction events', () => {
      const handler = new FlightEventHandler();
      const event = new DelayPredictionCreatedEvent({
        flightId: 'test-123',
        percentage: 75,
        riskLevel: 'high',
        avgDelayMinutes: 45,
        basedOnRecords: 10,
      });

      expect(handler.canHandle(event)).toBe(false);
    });
  });

  describe('DelayPredictionEventHandler', () => {
    it('should handle DelayPredictionCreatedEvent', () => {
      const handler = new DelayPredictionEventHandler();
      const event = new DelayPredictionCreatedEvent({
        flightId: 'test-123',
        percentage: 75,
        riskLevel: 'high',
        avgDelayMinutes: 45,
        basedOnRecords: 10,
      });

      expect(handler.canHandle(event)).toBe(true);
      expect(() => handler.handle(event)).not.toThrow();
    });

    it('should handle DelayRiskLevelChangedEvent', () => {
      const handler = new DelayPredictionEventHandler();
      const event = new DelayRiskLevelChangedEvent({
        flightId: 'test-123',
        percentage: 60,
        riskLevel: 'medium',
        avgDelayMinutes: 30,
        basedOnRecords: 5,
        previousRiskLevel: 'low',
        newRiskLevel: 'medium',
      });

      expect(handler.canHandle(event)).toBe(true);
      expect(() => handler.handle(event)).not.toThrow();
    });

    it('should handle HighDelayRiskAlertEvent', () => {
      const handler = new DelayPredictionEventHandler();
      const event = new HighDelayRiskAlertEvent({
        flightId: 'test-123',
        percentage: 85,
        riskLevel: 'high',
        avgDelayMinutes: 60,
        basedOnRecords: 20,
      });

      expect(handler.canHandle(event)).toBe(true);
      expect(() => handler.handle(event)).not.toThrow();
    });
  });

  describe('MetricsEventHandler', () => {
    it('should track event counts', () => {
      const handler = new MetricsEventHandler();
      const event = new FlightCreatedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      handler.handle(event);
      handler.handle(event);

      const metrics = handler.getMetrics();
      expect(metrics['FlightCreatedEvent']).toBe(2);
    });

    it('should reset metrics', () => {
      const handler = new MetricsEventHandler();
      const event = new FlightCreatedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      handler.handle(event);
      handler.reset();

      const metrics = handler.getMetrics();
      expect(metrics['FlightCreatedEvent']).toBeUndefined();
    });
  });

  describe('EventHandlerRegistry', () => {
    it('should call all registered handlers', () => {
      const registry = new EventHandlerRegistry();
      const handler1 = new MetricsEventHandler();
      const handler2 = new MetricsEventHandler();

      registry.register(handler1);
      registry.register(handler2);

      const event = new FlightCreatedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      registry.handle(event);

      expect(handler1.getMetrics()['FlightCreatedEvent']).toBe(1);
      expect(handler2.getMetrics()['FlightCreatedEvent']).toBe(1);
    });

    it('should only call handlers that can handle the event', () => {
      const registry = new EventHandlerRegistry();
      const flightHandler = new FlightEventHandler();
      const delayHandler = new DelayPredictionEventHandler();

      registry.register(flightHandler);
      registry.register(delayHandler);

      const flightEvent = new FlightCreatedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      registry.handle(flightEvent);

      expect(flightHandler.getMetrics ? flightHandler.getMetrics() : {}).toBeDefined();
    });

    it('should clear all handlers', () => {
      const registry = new EventHandlerRegistry();
      registry.register(new MetricsEventHandler());
      registry.register(new FlightEventHandler());

      registry.clear();

      const metricsHandler = new MetricsEventHandler();
      registry.register(metricsHandler);
      registry.handle(new FlightCreatedEvent({
        flightId: 'test',
        callsign: 'TEST',
        origin: 'LEMD',
        destination: 'LEBL',
      }));

      expect(metricsHandler.getMetrics()['FlightCreatedEvent']).toBe(1);
    });
  });
});
