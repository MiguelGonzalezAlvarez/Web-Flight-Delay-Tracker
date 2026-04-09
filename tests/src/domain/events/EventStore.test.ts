import { InMemoryEventStore } from '@/src/domain/events/EventStore';
import { FlightCreatedEvent } from '@/src/domain/events/FlightEvents';
import { DelayPredictionCreatedEvent } from '@/src/domain/events/DelayPredictionEvents';

describe('InMemoryEventStore', () => {
  let store: InMemoryEventStore;

  beforeEach(() => {
    store = new InMemoryEventStore();
  });

  describe('save', () => {
    it('should save an event', async () => {
      const event = new FlightCreatedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      await store.save(event);

      const stored = await store.getById(`${event.eventType}-${event.occurredAt.getTime()}`);
      expect(stored).not.toBeNull();
      expect(stored!.eventType).toBe('FlightCreatedEvent');
    });
  });

  describe('saveBatch', () => {
    it('should save multiple events', async () => {
      const event1 = new FlightCreatedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      const event2 = new DelayPredictionCreatedEvent({
        flightId: 'test-123',
        percentage: 75,
        riskLevel: 'high',
        avgDelayMinutes: 45,
        basedOnRecords: 10,
      });

      await store.saveBatch([event1, event2]);

      const events = await store.replay();
      expect(events.length).toBe(2);
    });
  });

  describe('getById', () => {
    it('should return null for non-existent event', async () => {
      const stored = await store.getById('non-existent-id');
      expect(stored).toBeNull();
    });
  });

  describe('getByType', () => {
    it('should filter events by type', async () => {
      const event1 = new FlightCreatedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      await store.save(event1);

      const event2 = new DelayPredictionCreatedEvent({
        flightId: 'test-123',
        percentage: 75,
        riskLevel: 'high',
        avgDelayMinutes: 45,
        basedOnRecords: 10,
      });

      await store.save(event2);

      const flightEvents = await store.getByType('FlightCreatedEvent');
      expect(flightEvents.length).toBe(1);
      expect(flightEvents[0].eventType).toBe('FlightCreatedEvent');

      const delayEvents = await store.getByType('DelayPredictionCreatedEvent');
      expect(delayEvents.length).toBe(1);
    });

    it('should limit results when specified', async () => {
      for (let i = 0; i < 5; i++) {
        const event = new FlightCreatedEvent({
          flightId: `test-${i}`,
          callsign: `IBE${i}234`,
          origin: 'LEMD',
          destination: 'LEBL',
        });
        await store.save(event);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const events = await store.getByType('FlightCreatedEvent', 3);
      expect(events.length).toBe(3);
    });
  });

  describe('getByTimeRange', () => {
    it('should filter events by time range', async () => {
      const event = new FlightCreatedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      await store.save(event);

      const now = new Date();
      const past = new Date(now.getTime() - 60000);
      const future = new Date(now.getTime() + 60000);

      const events = await store.getByTimeRange(past, future);
      expect(events.length).toBe(1);
    });
  });

  describe('replay', () => {
    it('should return all events sorted by time', async () => {
      const event1 = new FlightCreatedEvent({
        flightId: 'test-1',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const event2 = new FlightCreatedEvent({
        flightId: 'test-2',
        callsign: 'IBE5678',
        origin: 'LEBL',
        destination: 'LEMD',
      });

      await store.saveBatch([event1, event2]);

      const events = await store.replay();
      expect(events.length).toBe(2);
    });

    it('should filter by type when specified', async () => {
      const event1 = new FlightCreatedEvent({
        flightId: 'test-1',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      const event2 = new DelayPredictionCreatedEvent({
        flightId: 'test-1',
        percentage: 75,
        riskLevel: 'high',
        avgDelayMinutes: 45,
        basedOnRecords: 10,
      });

      await store.saveBatch([event1, event2]);

      const flightEvents = await store.replay('FlightCreatedEvent');
      expect(flightEvents.length).toBe(1);
      expect(flightEvents[0].eventType).toBe('FlightCreatedEvent');
    });
  });

  describe('clear', () => {
    it('should remove all events', async () => {
      const event = new FlightCreatedEvent({
        flightId: 'test-123',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      });

      await store.save(event);
      expect(store.size()).toBe(1);

      store.clear();
      expect(store.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return correct count', async () => {
      expect(store.size()).toBe(0);

      await store.save(new FlightCreatedEvent({
        flightId: 'test-1',
        callsign: 'IBE1234',
        origin: 'LEMD',
        destination: 'LEBL',
      }));

      expect(store.size()).toBe(1);

      await new Promise(resolve => setTimeout(resolve, 10));

      await store.save(new FlightCreatedEvent({
        flightId: 'test-2',
        callsign: 'IBE5678',
        origin: 'LEBL',
        destination: 'LEMD',
      }));

      expect(store.size()).toBe(2);
    });
  });
});
