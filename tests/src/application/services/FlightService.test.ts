import { FlightService } from '@/src/application/services/FlightService';
import { InMemoryFlightRepository } from '@/src/infrastructure/persistence/InMemoryFlightRepository';
import { InMemoryDelayPredictionRepository } from '@/src/infrastructure/persistence/InMemoryDelayPredictionRepository';
import { createEventDispatcher } from '@/src/domain/events/DomainEvent';
import { FlightCreatedEvent, FlightStatusChangedEvent, FlightDelayDetectedEvent } from '@/src/domain/events';

describe('FlightService', () => {
  let flightRepository: InMemoryFlightRepository;
  let predictionRepository: InMemoryDelayPredictionRepository;
  let eventDispatcher: ReturnType<typeof createEventDispatcher>;
  let service: FlightService;

  beforeEach(() => {
    flightRepository = new InMemoryFlightRepository();
    predictionRepository = new InMemoryDelayPredictionRepository();
    eventDispatcher = createEventDispatcher();
    eventDispatcher.clear();
    service = new FlightService(flightRepository, predictionRepository, eventDispatcher);
  });

  describe('createFlight', () => {
    it('should create a flight and dispatch FlightCreatedEvent', async () => {
      const handler = jest.fn();
      eventDispatcher.register(FlightCreatedEvent, handler);

      const props = {
        id: 'flight-1',
        callsign: 'IBE1234',
        airline: 'Iberia',
        origin: 'LEMD',
        destination: 'LEBL',
        status: 'scheduled' as const,
      };

      const result = await service.createFlight(props);

      expect(result.ok).toBe(true);
      expect(result.value.id).toBe('flight-1');
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].data.flightId).toBe('flight-1');
    });

    it('should return failure for invalid props', async () => {
      const props = {
        id: '',
        callsign: 'IBE1234',
        airline: 'Iberia',
        origin: 'LEMD',
        destination: 'LEBL',
      };

      const result = await service.createFlight(props);

      expect(result.ok).toBe(false);
    });
  });

  describe('getFlight', () => {
    it('should retrieve an existing flight', async () => {
      await service.createFlight({
        id: 'flight-2',
        callsign: 'VLG5678',
        airline: 'Vueling',
        origin: 'LEBL',
        destination: 'LEMD',
        status: 'scheduled' as const,
      });

      const result = await service.getFlight('flight-2');

      expect(result).not.toBeNull();
      expect(result!.value.id).toBe('flight-2');
    });

    it('should return null for non-existent flight', async () => {
      const result = await service.getFlight('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateFlightStatus', () => {
    it('should update flight status and dispatch event', async () => {
      await service.createFlight({
        id: 'flight-3',
        callsign: 'IBE9999',
        airline: 'Iberia',
        origin: 'LEMD',
        destination: 'LEBB',
        status: 'scheduled' as const,
      });

      const handler = jest.fn();
      eventDispatcher.register(FlightStatusChangedEvent, handler);

      const result = await service.updateFlightStatus('flight-3', 'boarding');

      expect(result.ok).toBe(true);
      expect(result.value.status.toString()).toBe('boarding');
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].data.previousStatus).toBe('scheduled');
      expect(handler.mock.calls[0][0].data.newStatus).toBe('boarding');
    });

    it('should return failure for non-existent flight', async () => {
      const result = await service.updateFlightStatus('non-existent', 'boarding');

      expect(result.ok).toBe(false);
    });

    it('should dispatch FlightDelayDetectedEvent when status changes to delayed', async () => {
      await service.createFlight({
        id: 'flight-4',
        callsign: 'IBE0001',
        airline: 'Iberia',
        origin: 'LEMD',
        destination: 'LEAL',
        status: 'scheduled' as const,
        delayPrediction: {
          percentage: 60,
          riskLevel: 'medium',
          avgDelayMinutes: 45,
          basedOnRecords: 20,
        },
      });

      const handler = jest.fn();
      eventDispatcher.register(FlightDelayDetectedEvent, handler);

      await service.updateFlightStatus('flight-4', 'delayed');

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFlightsByOrigin', () => {
    it('should return flights from specified origin', async () => {
      await service.createFlight({
        id: 'f1',
        callsign: 'IBE1',
        airline: 'Iberia',
        origin: 'LEMD',
        destination: 'LEBL',
        status: 'scheduled' as const,
      });
      await service.createFlight({
        id: 'f2',
        callsign: 'IBE2',
        airline: 'Iberia',
        origin: 'LEBL',
        destination: 'LEMD',
        status: 'scheduled' as const,
      });

      const results = await service.getFlightsByOrigin('LEMD');

      expect(results).toHaveLength(1);
      expect(results[0].value.id).toBe('f1');
    });
  });

  describe('getFlightsByRoute', () => {
    it('should return flights for specific route', async () => {
      await service.createFlight({
        id: 'f1',
        callsign: 'IBE1',
        airline: 'Iberia',
        origin: 'LEMD',
        destination: 'LEBL',
        status: 'scheduled' as const,
      });
      await service.createFlight({
        id: 'f2',
        callsign: 'IBE2',
        airline: 'Iberia',
        origin: 'LEMD',
        destination: 'LEBB',
        status: 'scheduled' as const,
      });

      const results = await service.getFlightsByRoute('LEMD', 'LEBL');

      expect(results).toHaveLength(1);
      expect(results[0].value.destination.toString()).toBe('LEBL');
    });
  });

  describe('getDelayedFlights', () => {
    it('should return only delayed flights', async () => {
      await service.createFlight({
        id: 'f1',
        callsign: 'IBE1',
        airline: 'Iberia',
        origin: 'LEMD',
        destination: 'LEBL',
        status: 'scheduled' as const,
      });
      await service.createFlight({
        id: 'f2',
        callsign: 'IBE2',
        airline: 'Iberia',
        origin: 'LEBL',
        destination: 'LEMD',
        status: 'delayed' as const,
      });

      const results = await service.getDelayedFlights();

      expect(results).toHaveLength(1);
      expect(results[0].value.status.toString()).toBe('delayed');
    });
  });

  describe('deleteFlight', () => {
    it('should delete an existing flight', async () => {
      await service.createFlight({
        id: 'to-delete',
        callsign: 'IBE1',
        airline: 'Iberia',
        origin: 'LEMD',
        destination: 'LEBL',
        status: 'scheduled' as const,
      });

      const result = await service.deleteFlight('to-delete');

      expect(result.ok).toBe(true);
      expect(await service.getFlight('to-delete')).toBeNull();
    });
  });
});
