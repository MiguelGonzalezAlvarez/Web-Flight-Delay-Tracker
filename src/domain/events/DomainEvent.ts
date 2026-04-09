export type DomainEventMetadata = {
  occurredAt: Date;
  version: number;
};

export abstract class DomainEvent {
  public readonly eventType: string;
  public readonly occurredAt: Date;
  public readonly metadata: DomainEventMetadata;

  protected constructor(eventType: string) {
    this.eventType = eventType;
    this.occurredAt = new Date();
    this.metadata = {
      occurredAt: this.occurredAt,
      version: 1,
    };
  }

  abstract toPlainObject(): Record<string, unknown>;
}

export class EventDispatcher {
  private static instance: EventDispatcher;
  private handlers: Map<string, Array<(event: DomainEvent) => void>> = new Map();

  private constructor() {}

  static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher();
    }
    return EventDispatcher.instance;
  }

  register<T extends DomainEvent>(
    eventType: new (...args: unknown[]) => T,
    handler: (event: T) => void
  ): void {
    const name = eventType.name;
    if (!this.handlers.has(name)) {
      this.handlers.set(name, []);
    }
    this.handlers.get(name)!.push(handler as (event: DomainEvent) => void);
  }

  dispatch<T extends DomainEvent>(event: T): void {
    const handlers = this.handlers.get(event.eventType) || [];
    handlers.forEach((handler) => handler(event));
  }

  clear(): void {
    this.handlers.clear();
  }
}

export function createEventDispatcher(): EventDispatcher {
  return EventDispatcher.getInstance();
}
