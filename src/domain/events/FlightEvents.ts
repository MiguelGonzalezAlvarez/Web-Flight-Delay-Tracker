import { DomainEvent } from './DomainEvent';
import { FlightStatus } from '../value-objects/FlightStatus';

export interface FlightDomainEventData {
  flightId: string;
  callsign: string;
  origin: string;
  destination: string;
}

export class FlightCreatedEvent extends DomainEvent {
  public constructor(data: FlightDomainEventData) {
    super('FlightCreatedEvent');
    this.data = data;
  }

  public readonly data: FlightDomainEventData;

  toPlainObject(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      metadata: this.metadata,
      data: this.data,
    };
  }
}

export class FlightStatusChangedEvent extends DomainEvent {
  public constructor(
    data: FlightDomainEventData & {
      previousStatus: string;
      newStatus: string;
    }
  ) {
    super('FlightStatusChangedEvent');
    this.data = data;
  }

  public readonly data: FlightDomainEventData & {
    previousStatus: string;
    newStatus: string;
  };

  toPlainObject(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      metadata: this.metadata,
      data: this.data,
    };
  }
}

export class FlightDelayDetectedEvent extends DomainEvent {
  public constructor(data: FlightDomainEventData & { delayMinutes: number }) {
    super('FlightDelayDetectedEvent');
    this.data = data;
  }

  public readonly data: FlightDomainEventData & { delayMinutes: number };

  toPlainObject(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      metadata: this.metadata,
      data: this.data,
    };
  }
}
