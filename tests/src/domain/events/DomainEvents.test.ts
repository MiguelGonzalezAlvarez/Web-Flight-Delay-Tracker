import {
  DomainEvent,
  EventDispatcher,
  createEventDispatcher,
  FlightCreatedEvent,
  FlightStatusChangedEvent,
  FlightDelayDetectedEvent,
  DelayPredictionCreatedEvent,
  DelayRiskLevelChangedEvent,
  HighDelayRiskAlertEvent,
} from '@/src/domain/events';

describe('DomainEvent', () => {
  it('should create event with metadata', () => {
    const event = new FlightCreatedEvent({
      flightId: 'flight-123',
      callsign: 'IBE1234',
      origin: 'LEMD',
      destination: 'LECL',
    });

    expect(event.eventType).toBe('FlightCreatedEvent');
    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.metadata.occurredAt).toEqual(event.occurredAt);
    expect(event.metadata.version).toBe(1);
  });

  it('should convert to plain object', () => {
    const event = new FlightCreatedEvent({
      flightId: 'flight-123',
      callsign: 'IBE1234',
      origin: 'LEMD',
      destination: 'LECL',
    });

    const plain = event.toPlainObject();

    expect(plain.eventType).toBe('FlightCreatedEvent');
    expect(plain.data).toEqual({
      flightId: 'flight-123',
      callsign: 'IBE1234',
      origin: 'LEMD',
      destination: 'LECL',
    });
    expect(plain.metadata).toBeDefined();
  });
});

describe('FlightEvents', () => {
  it('should create FlightCreatedEvent', () => {
    const event = new FlightCreatedEvent({
      flightId: 'flight-456',
      callsign: 'VLG7890',
      origin: 'LEBL',
      destination: 'LEAL',
    });

    expect(event.eventType).toBe('FlightCreatedEvent');
    expect(event.data.flightId).toBe('flight-456');
    expect(event.data.callsign).toBe('VLG7890');
  });

  it('should create FlightStatusChangedEvent', () => {
    const event = new FlightStatusChangedEvent({
      flightId: 'flight-789',
      callsign: 'IBE456',
      origin: 'LEMD',
      destination: 'LEBB',
      previousStatus: 'scheduled',
      newStatus: 'boarding',
    });

    expect(event.eventType).toBe('FlightStatusChangedEvent');
    expect(event.data.previousStatus).toBe('scheduled');
    expect(event.data.newStatus).toBe('boarding');
  });

  it('should create FlightDelayDetectedEvent', () => {
    const event = new FlightDelayDetectedEvent({
      flightId: 'flight-101',
      callsign: 'IBE101',
      origin: 'LEMD',
      destination: 'LECL',
      delayMinutes: 45,
    });

    expect(event.eventType).toBe('FlightDelayDetectedEvent');
    expect(event.data.delayMinutes).toBe(45);
  });
});

describe('DelayPredictionEvents', () => {
  it('should create DelayPredictionCreatedEvent', () => {
    const event = new DelayPredictionCreatedEvent({
      flightId: 'flight-202',
      percentage: 75,
      riskLevel: 'high',
      avgDelayMinutes: 120,
      basedOnRecords: 50,
    });

    expect(event.eventType).toBe('DelayPredictionCreatedEvent');
    expect(event.data.percentage).toBe(75);
    expect(event.data.riskLevel).toBe('high');
  });

  it('should create DelayRiskLevelChangedEvent', () => {
    const event = new DelayRiskLevelChangedEvent({
      flightId: 'flight-303',
      percentage: 60,
      riskLevel: 'medium',
      avgDelayMinutes: 90,
      basedOnRecords: 30,
      previousRiskLevel: 'low',
      newRiskLevel: 'medium',
    });

    expect(event.eventType).toBe('DelayRiskLevelChangedEvent');
    expect(event.data.previousRiskLevel).toBe('low');
    expect(event.data.newRiskLevel).toBe('medium');
  });

  it('should create HighDelayRiskAlertEvent', () => {
    const event = new HighDelayRiskAlertEvent({
      flightId: 'flight-404',
      percentage: 90,
      riskLevel: 'high',
      avgDelayMinutes: 180,
      basedOnRecords: 100,
    });

    expect(event.eventType).toBe('HighDelayRiskAlertEvent');
    expect(event.data.riskLevel).toBe('high');
  });
});

describe('EventDispatcher', () => {
  let dispatcher: EventDispatcher;

  beforeEach(() => {
    dispatcher = createEventDispatcher();
    dispatcher.clear();
  });

  it('should register and dispatch event', () => {
    const handler = jest.fn();
    dispatcher.register(FlightCreatedEvent, handler);

    const event = new FlightCreatedEvent({
      flightId: 'test-1',
      callsign: 'TEST123',
      origin: 'LEMD',
      destination: 'LEBL',
    });

    dispatcher.dispatch(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should handle multiple handlers for same event type', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    dispatcher.register(FlightCreatedEvent, handler1);
    dispatcher.register(FlightCreatedEvent, handler2);

    const event = new FlightCreatedEvent({
      flightId: 'test-2',
      callsign: 'TEST456',
      origin: 'LEMD',
      destination: 'LEBB',
    });

    dispatcher.dispatch(event);

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should only dispatch to registered event types', () => {
    const handler = jest.fn();
    dispatcher.register(FlightCreatedEvent, handler);

    const differentEvent = new DelayPredictionCreatedEvent({
      flightId: 'test-3',
      percentage: 50,
      riskLevel: 'medium',
      avgDelayMinutes: 60,
      basedOnRecords: 20,
    });

    dispatcher.dispatch(differentEvent);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should dispatch events in order', () => {
    const callOrder: number[] = [];
    dispatcher.register(FlightCreatedEvent, () => callOrder.push(1));
    dispatcher.register(FlightCreatedEvent, () => callOrder.push(2));
    dispatcher.register(FlightCreatedEvent, () => callOrder.push(3));

    const event = new FlightCreatedEvent({
      flightId: 'test-4',
      callsign: 'TEST789',
      origin: 'LEMD',
      destination: 'LEAL',
    });

    dispatcher.dispatch(event);

    expect(callOrder).toEqual([1, 2, 3]);
  });

  it('should clear all handlers', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    dispatcher.register(FlightCreatedEvent, handler1);
    dispatcher.register(DelayPredictionCreatedEvent, handler2);

    dispatcher.clear();

    dispatcher.dispatch(new FlightCreatedEvent({
      flightId: 'test-5',
      callsign: 'TEST101',
      origin: 'LEMD',
      destination: 'LEBL',
    }));
    dispatcher.dispatch(new DelayPredictionCreatedEvent({
      flightId: 'test-6',
      percentage: 25,
      riskLevel: 'low',
      avgDelayMinutes: 30,
      basedOnRecords: 10,
    }));

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('should return singleton instance', () => {
    const instance1 = createEventDispatcher();
    const instance2 = createEventDispatcher();

    expect(instance1).toBe(instance2);
  });
});
