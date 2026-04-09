import { DomainEvent } from './DomainEvent';

export interface DelayPredictionEventData {
  flightId: string;
  percentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  avgDelayMinutes: number;
  basedOnRecords: number;
}

export class DelayPredictionCreatedEvent extends DomainEvent {
  public constructor(data: DelayPredictionEventData) {
    super('DelayPredictionCreatedEvent');
    this.data = data;
  }

  public readonly data: DelayPredictionEventData;

  toPlainObject(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      metadata: this.metadata,
      data: this.data,
    };
  }
}

export class DelayRiskLevelChangedEvent extends DomainEvent {
  public constructor(
    data: DelayPredictionEventData & {
      previousRiskLevel: 'low' | 'medium' | 'high';
      newRiskLevel: 'low' | 'medium' | 'high';
    }
  ) {
    super('DelayRiskLevelChangedEvent');
    this.data = data;
  }

  public readonly data: DelayPredictionEventData & {
    previousRiskLevel: 'low' | 'medium' | 'high';
    newRiskLevel: 'low' | 'medium' | 'high';
  };

  toPlainObject(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      metadata: this.metadata,
      data: this.data,
    };
  }
}

export class HighDelayRiskAlertEvent extends DomainEvent {
  public constructor(data: DelayPredictionEventData) {
    super('HighDelayRiskAlertEvent');
    this.data = data;
  }

  public readonly data: DelayPredictionEventData;

  toPlainObject(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      metadata: this.metadata,
      data: this.data,
    };
  }
}
