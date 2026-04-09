import { DomainEvent } from './DomainEvent';
import {
  FlightCreatedEvent,
  FlightStatusChangedEvent,
  FlightDelayDetectedEvent,
  FlightDomainEventData,
} from './FlightEvents';
import {
  DelayPredictionCreatedEvent,
  DelayRiskLevelChangedEvent,
  HighDelayRiskAlertEvent,
  DelayPredictionEventData,
} from './DelayPredictionEvents';
import { createLogger, Logger } from '../../lib/logger';

export interface EventHandler {
  handle(event: DomainEvent): void | Promise<void>;
  canHandle(event: DomainEvent): boolean;
}

export class LoggingEventHandler implements EventHandler {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({ context: { component: 'EventHandler' } });
  }

  canHandle(event: DomainEvent): boolean {
    return true;
  }

  handle(event: DomainEvent): void {
    this.logger.info('Domain event dispatched', {
      eventType: event.eventType,
      occurredAt: event.occurredAt.toISOString(),
    });
  }
}

export class FlightEventHandler implements EventHandler {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({ context: { component: 'FlightEventHandler' } });
  }

  canHandle(event: DomainEvent): boolean {
    return (
      event instanceof FlightCreatedEvent ||
      event instanceof FlightStatusChangedEvent ||
      event instanceof FlightDelayDetectedEvent
    );
  }

  handle(event: DomainEvent): void {
    if (event instanceof FlightCreatedEvent) {
      this.logger.info('Flight created', {
        flightId: event.data.flightId,
        callsign: event.data.callsign,
        origin: event.data.origin,
        destination: event.data.destination,
      });
    } else if (event instanceof FlightStatusChangedEvent) {
      this.logger.info('Flight status changed', {
        flightId: event.data.flightId,
        previousStatus: event.data.previousStatus,
        newStatus: event.data.newStatus,
      });
    } else if (event instanceof FlightDelayDetectedEvent) {
      this.logger.warn('Flight delay detected', {
        flightId: event.data.flightId,
        callsign: event.data.callsign,
        delayMinutes: event.data.delayMinutes,
      });
    }
  }
}

export class DelayPredictionEventHandler implements EventHandler {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({ context: { component: 'DelayPredictionEventHandler' } });
  }

  canHandle(event: DomainEvent): boolean {
    return (
      event instanceof DelayPredictionCreatedEvent ||
      event instanceof DelayRiskLevelChangedEvent ||
      event instanceof HighDelayRiskAlertEvent
    );
  }

  handle(event: DomainEvent): void {
    if (event instanceof DelayPredictionCreatedEvent) {
      this.logger.info('Delay prediction created', {
        flightId: event.data.flightId,
        percentage: event.data.percentage,
        riskLevel: event.data.riskLevel,
        basedOnRecords: event.data.basedOnRecords,
      });
    } else if (event instanceof DelayRiskLevelChangedEvent) {
      this.logger.info('Delay risk level changed', {
        flightId: event.data.flightId,
        previousRiskLevel: event.data.previousRiskLevel,
        newRiskLevel: event.data.newRiskLevel,
      });
    } else if (event instanceof HighDelayRiskAlertEvent) {
      this.logger.error('High delay risk alert', undefined, {
        flightId: event.data.flightId,
        percentage: event.data.percentage,
        avgDelayMinutes: event.data.avgDelayMinutes,
      });
    }
  }
}

export class MetricsEventHandler implements EventHandler {
  private metrics: Map<string, number> = new Map();

  canHandle(event: DomainEvent): boolean {
    return true;
  }

  handle(event: DomainEvent): void {
    const count = this.metrics.get(event.eventType) || 0;
    this.metrics.set(event.eventType, count + 1);
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  reset(): void {
    this.metrics.clear();
  }
}

export class EventHandlerRegistry {
  private handlers: EventHandler[] = [];

  register(handler: EventHandler): void {
    this.handlers.push(handler);
  }

  handle(event: DomainEvent): void {
    for (const handler of this.handlers) {
      if (handler.canHandle(event)) {
        try {
          handler.handle(event);
        } catch (error) {
          console.error(`Error in event handler:`, error);
        }
      }
    }
  }

  clear(): void {
    this.handlers = [];
  }
}
