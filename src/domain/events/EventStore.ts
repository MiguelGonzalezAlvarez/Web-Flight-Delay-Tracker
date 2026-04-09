import { DomainEvent } from './DomainEvent';

export interface StoredEvent {
  id: string;
  eventType: string;
  occurredAt: Date;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface EventStore {
  save(event: DomainEvent): Promise<void>;
  saveBatch(events: DomainEvent[]): Promise<void>;
  getById(id: string): Promise<StoredEvent | null>;
  getByType(eventType: string, limit?: number): Promise<StoredEvent[]>;
  getByTimeRange(start: Date, end: Date): Promise<StoredEvent[]>;
  replay(eventType?: string): Promise<StoredEvent[]>;
}

export class InMemoryEventStore implements EventStore {
  private events: Map<string, StoredEvent> = new Map();

  async save(event: DomainEvent): Promise<void> {
    const id = `${event.eventType}-${event.occurredAt.getTime()}`;
    const storedEvent: StoredEvent = {
      id,
      eventType: event.eventType,
      occurredAt: event.occurredAt,
      payload: event.toPlainObject(),
      metadata: event.metadata,
    };
    this.events.set(id, storedEvent);
  }

  async saveBatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.save(event);
    }
  }

  async getById(id: string): Promise<StoredEvent | null> {
    return this.events.get(id) || null;
  }

  async getByType(eventType: string, limit?: number): Promise<StoredEvent[]> {
    const events = Array.from(this.events.values())
      .filter((e) => e.eventType === eventType)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    return limit ? events.slice(0, limit) : events;
  }

  async getByTimeRange(start: Date, end: Date): Promise<StoredEvent[]> {
    return Array.from(this.events.values())
      .filter(
        (e) => e.occurredAt >= start && e.occurredAt <= end
      )
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  }

  async replay(eventType?: string): Promise<StoredEvent[]> {
    let events: StoredEvent[];
    if (eventType) {
      events = await this.getByType(eventType);
    } else {
      events = Array.from(this.events.values()).sort(
        (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()
      );
    }
    return events;
  }

  clear(): void {
    this.events.clear();
  }

  size(): number {
    return this.events.size;
  }
}

let eventStoreInstance: EventStore | null = null;

export function getEventStore(): EventStore {
  if (!eventStoreInstance) {
    eventStoreInstance = new InMemoryEventStore();
  }
  return eventStoreInstance;
}

export function setEventStore(store: EventStore): void {
  eventStoreInstance = store;
}
