import { Flight, FlightProps } from '../../domain/entities/Flight';
import { FlightRepository } from '../../domain/repositories/FlightRepository';
import { DelayPredictionRepository } from '../../domain/repositories/DelayPredictionRepository';
import { Result, success, failure } from '../../domain/value-objects/Result';
import { ValidationError } from '../../domain/value-objects/ValidationError';
import { FlightCreatedEvent, FlightStatusChangedEvent, FlightDelayDetectedEvent } from '../../domain/events';
import { EventDispatcher } from '../../domain/events/DomainEvent';

export class FlightService {
  constructor(
    private readonly flightRepository: FlightRepository,
    private readonly predictionRepository: DelayPredictionRepository,
    private readonly eventDispatcher: EventDispatcher
  ) {}

  async createFlight(props: FlightProps): Promise<Result<Flight, ValidationError>> {
    const flightResult = Flight.create(props);
    if (!flightResult.ok) {
      return failure(flightResult.error);
    }

    const flight = flightResult.value;
    const saveResult = await this.flightRepository.save(flight);
    if (!saveResult.ok) {
      return failure(saveResult.error);
    }

    this.eventDispatcher.dispatch(new FlightCreatedEvent({
      flightId: flight.id,
      callsign: flight.callsign.toString(),
      origin: flight.origin.toString(),
      destination: flight.destination.toString(),
    }));

    return success(flight);
  }

  async getFlight(id: string): Promise<Result<Flight, ValidationError> | null> {
    return this.flightRepository.findById(id);
  }

  async getFlightWithPrediction(id: string): Promise<Result<Flight, ValidationError> | null> {
    const flightResult = await this.flightRepository.findById(id);
    if (!flightResult) {
      return null;
    }
    return flightResult;
  }

  async updateFlightStatus(
    id: string,
    newStatus: string
  ): Promise<Result<Flight, ValidationError>> {
    const flightResult = await this.flightRepository.findById(id);
    if (!flightResult) {
      return failure(ValidationError.notFound('Flight', id));
    }

    const flight = (flightResult as { ok: true; value: Flight }).value;
    const previousStatus = flight.status.toString();

    const updatedProps: FlightProps = {
      ...flight.toPlainObject(),
      status: newStatus,
    };

    const updatedFlightResult = Flight.create(updatedProps);
    if (!updatedFlightResult.ok) {
      return failure(updatedFlightResult.error);
    }

    const updatedFlight = updatedFlightResult.value;
    await this.flightRepository.save(updatedFlight);

    this.eventDispatcher.dispatch(new FlightStatusChangedEvent({
      flightId: flight.id,
      callsign: flight.callsign.toString(),
      origin: flight.origin.toString(),
      destination: flight.destination.toString(),
      previousStatus,
      newStatus,
    }));

    if (newStatus === 'delayed' && flight.delayPrediction) {
      this.eventDispatcher.dispatch(new FlightDelayDetectedEvent({
        flightId: flight.id,
        callsign: flight.callsign.toString(),
        origin: flight.origin.toString(),
        destination: flight.destination.toString(),
        delayMinutes: flight.delayPrediction.avgDelayMinutes,
      }));
    }

    return success(updatedFlight);
  }

  async getFlightsByOrigin(origin: string): Promise<Result<Flight, ValidationError>[]> {
    return this.flightRepository.findByOrigin(origin);
  }

  async getFlightsByDestination(destination: string): Promise<Result<Flight, ValidationError>[]> {
    return this.flightRepository.findByDestination(destination);
  }

  async getFlightsByRoute(origin: string, destination: string): Promise<Result<Flight, ValidationError>[]> {
    return this.flightRepository.findByRoute(origin, destination);
  }

  async getActiveFlights(): Promise<Result<Flight, ValidationError>[]> {
    return this.flightRepository.findActive();
  }

  async getDelayedFlights(): Promise<Result<Flight, ValidationError>[]> {
    const allFlights = await this.flightRepository.findAll();
    return allFlights.filter((result) => result.ok && result.value.isDelayed());
  }

  async deleteFlight(id: string): Promise<Result<void, ValidationError>> {
    return this.flightRepository.delete(id);
  }
}
