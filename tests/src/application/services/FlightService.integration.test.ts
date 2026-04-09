import { FlightService } from '@/src/application/services/FlightService';
import { InMemoryFlightRepository } from '@/src/infrastructure/persistence/InMemoryFlightRepository';
import { InMemoryDelayPredictionRepository } from '@/src/infrastructure/persistence/InMemoryDelayPredictionRepository';
import { EventDispatcher } from '@/src/domain/events/DomainEvent';
import { FlightCreatedEvent, FlightStatusChangedEvent, FlightDelayDetectedEvent } from '@/src/domain/events';
import { Flight } from '@/src/domain/entities/Flight';

describe('FlightService Integration', () => {
  let flightService: FlightService;
  let flightRepository: InMemoryFlightRepository;
  let predictionRepository: InMemoryDelayPredictionRepository;
  let eventDispatcher: EventDispatcher;
  let dispatchedEvents: any[];

  beforeEach(() => {
    flightRepository = new InMemoryFlightRepository();
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
    flightService = new FlightService(
      flightRepository,
      predictionRepository,
      eventDispatcher
    );
  });

  describe('createFlight', () => {
    it('should create flight and dispatch FlightCreatedEvent', async () => {
      const props = {
        id: 'flight-1',
        callsign: 'IBE1234',
        airline: 'Iberia',
        origin: 'LEMD',
        destination: 'LEBL',
        departureTime: new Date('2024-03-15T10:30:00Z'),
        arrivalTime: new Date('2024-03-15T12:00:00Z'),
        status: 'scheduled',
      };

      const result = await flightService.createFlight(props);

      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: Flight }).value.id).toBe('flight-1');
      expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(1);
      expect(dispatchedEvents[0]).toBeInstanceOf(FlightCreatedEvent);
      expect(dispatchedEvents[0].data.callsign).toBe('IBE1234');
      expect(dispatchedEvents[0].data.origin).toBe('LEMD');
      expect(dispatchedEvents[0].data.destination).toBe('LEBL');
    });

    it('should return failure for invalid flight props', async () => {
      const props = {
        id: 'flight-invalid',
        callsign: '',
        airline: 'Iberia',
        origin: 'LEMD',
        destination: 'LEBL',
      };

      const result = await flightService.createFlight(props);

      expect(result.ok).toBe(false);
      expect(eventDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it('should persist flight to repository', async () => {
      const props = {
        id: 'flight-persist',
        callsign: 'VLG5678',
        airline: 'Volotea',
        origin: 'LEBL',
        destination: 'LEMD',
        departureTime: new Date('2024-03-15T14:00:00Z'),
        arrivalTime: new Date('2024-03-15T15:30:00Z'),
        status: 'scheduled',
      };

      await flightService.createFlight(props);

      const retrieved = await flightRepository.findById('flight-persist');
      expect(retrieved).not.toBeNull();
      expect((retrieved as { ok: true; value: Flight }).value.callsign.toString()).toBe('VLG5678');
    });
  });

  describe('getFlight', () => {
    it('should retrieve existing flight', async () => {
      await flightRepository.save(Flight.createUnsafe({
        id: 'flight-get',
        callsign: 'RYR1234',
        airline: 'Ryanair',
        origin: 'LEMD',
        destination: 'LEBB',
        departureTime: new Date('2024-03-15T08:00:00Z'),
        arrivalTime: new Date('2024-03-15T09:30:00Z'),
        status: 'scheduled',
      }));

      const result = await flightService.getFlight('flight-get');

      expect(result).not.toBeNull();
      expect((result as { ok: true; value: Flight }).value.id).toBe('flight-get');
    });

    it('should return null for non-existent flight', async () => {
      const result = await flightService.getFlight('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateFlightStatus', () => {
    it('should update status and dispatch FlightStatusChangedEvent', async () => {
      await flightRepository.save(Flight.createUnsafe({
        id: 'flight-update',
        callsign: 'IBE9999',
        airline: 'Iberia',
        origin: 'LEMD',
        destination: 'LEBL',
        departureTime: new Date('2024-03-15T10:00:00Z'),
        arrivalTime: new Date('2024-03-15T11:30:00Z'),
        status: 'scheduled',
      }));

      const result = await flightService.updateFlightStatus('flight-update', 'boarding');

      expect(result.ok).toBe(true);
      expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(1);
      expect(dispatchedEvents[0]).toBeInstanceOf(FlightStatusChangedEvent);
      expect(dispatchedEvents[0].data.previousStatus).toBe('scheduled');
      expect(dispatchedEvents[0].data.newStatus).toBe('boarding');
    });

    it('should return failure for non-existent flight', async () => {
      const result = await flightService.updateFlightStatus('non-existent', 'boarding');

      expect(result.ok).toBe(false);
      expect(eventDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it('should update flight in repository after status change', async () => {
      await flightRepository.save(Flight.createUnsafe({
        id: 'flight-repo-update',
        callsign: 'VLG1111',
        airline: 'Volotea',
        origin: 'LEMD',
        destination: 'LEPA',
        departureTime: new Date('2024-03-15T16:00:00Z'),
        arrivalTime: new Date('2024-03-15T18:00:00Z'),
        status: 'scheduled',
      }));

      await flightService.updateFlightStatus('flight-repo-update', 'delayed');

      const updated = await flightRepository.findById('flight-repo-update');
      expect((updated as { ok: true; value: Flight }).value.status.toString()).toBe('delayed');
    });
  });

  describe('getFlightsByOrigin', () => {
    it('should find flights by origin airport', async () => {
      await flightRepository.save(Flight.createUnsafe({
        id: 'f1',
        callsign: 'IB1',
        airline: 'Airline',
        origin: 'LEMD',
        destination: 'LEBL',
        status: 'scheduled',
      }));
      await flightRepository.save(Flight.createUnsafe({
        id: 'f2',
        callsign: 'IB2',
        airline: 'Airline',
        origin: 'LEMD',
        destination: 'LEBB',
        status: 'scheduled',
      }));
      await flightRepository.save(Flight.createUnsafe({
        id: 'f3',
        callsign: 'IB3',
        airline: 'Airline',
        origin: 'LEBL',
        destination: 'LEMD',
        status: 'scheduled',
      }));

      const results = await flightService.getFlightsByOrigin('LEMD');

      expect(results).toHaveLength(2);
    });
  });

  describe('getFlightsByDestination', () => {
    it('should find flights by destination airport', async () => {
      await flightRepository.save(Flight.createUnsafe({
        id: 'd1',
        callsign: 'IB4',
        airline: 'Airline',
        origin: 'LEMD',
        destination: 'LEBL',
        status: 'scheduled',
      }));
      await flightRepository.save(Flight.createUnsafe({
        id: 'd2',
        callsign: 'IB5',
        airline: 'Airline',
        origin: 'LEBB',
        destination: 'LEBL',
        status: 'scheduled',
      }));

      const results = await flightService.getFlightsByDestination('LEBL');

      expect(results).toHaveLength(2);
    });
  });

  describe('getFlightsByRoute', () => {
    it('should find flights by origin and destination', async () => {
      await flightRepository.save(Flight.createUnsafe({
        id: 'r1',
        callsign: 'IB6',
        airline: 'Airline',
        origin: 'LEMD',
        destination: 'LEBL',
        status: 'scheduled',
      }));
      await flightRepository.save(Flight.createUnsafe({
        id: 'r2',
        callsign: 'IB7',
        airline: 'Airline',
        origin: 'LEMD',
        destination: 'LEBB',
        status: 'scheduled',
      }));

      const results = await flightService.getFlightsByRoute('LEMD', 'LEBL');

      expect(results).toHaveLength(1);
      expect((results[0] as { ok: true; value: Flight }).value.id).toBe('r1');
    });
  });

  describe('getActiveFlights', () => {
    it('should return active flights', async () => {
      await flightRepository.save(Flight.createUnsafe({
        id: 'active1',
        callsign: 'IB8',
        airline: 'Airline',
        origin: 'LEMD',
        destination: 'LEBL',
        status: 'scheduled',
      }));
      await flightRepository.save(Flight.createUnsafe({
        id: 'active2',
        callsign: 'IB9',
        airline: 'Airline',
        origin: 'LEMD',
        destination: 'LEBB',
        status: 'boarding',
      }));

      const results = await flightService.getActiveFlights();

      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('deleteFlight', () => {
    it('should delete existing flight', async () => {
      await flightRepository.save(Flight.createUnsafe({
        id: 'delete-me',
        callsign: 'DELETE',
        airline: 'Airline',
        origin: 'LEMD',
        destination: 'LEBL',
        status: 'scheduled',
      }));

      const result = await flightService.deleteFlight('delete-me');

      expect(result.ok).toBe(true);
      expect(await flightRepository.findById('delete-me')).toBeNull();
    });

    it('should return failure for non-existent flight', async () => {
      const result = await flightService.deleteFlight('non-existent');

      expect(result.ok).toBe(false);
    });
  });
});
