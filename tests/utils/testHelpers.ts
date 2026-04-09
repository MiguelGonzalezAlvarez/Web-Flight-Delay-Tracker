export type MockFunction<T extends (...args: unknown[]) => unknown> = jest.Mock<
  ReturnType<T>,
  Parameters<T>
>;

export function createMock<T extends object>(overrides: Partial<T> = {}): T & { [key: string]: jest.Mock } {
  const mock: Record<string, jest.Mock> = {};
  return new Proxy(overrides as T & { [key: string]: jest.Mock }, {
    get(target, prop) {
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      if (typeof prop === 'string' && !prop.startsWith('__')) {
        if (!mock[prop]) {
          mock[prop] = jest.fn();
        }
        return mock[prop];
      }
      return undefined;
    },
  });
}

export async function waitFor(
  condition: () => boolean,
  timeout: number = 1000
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

export function createFakeTimers() {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
}

export function assertIsError(error: unknown, message?: string): asserts error is Error {
  expect(error).toBeInstanceOf(Error);
  if (message) {
    expect((error as Error).message).toContain(message);
  }
}

export function assertResultOk<T, E>(
  result: { ok: true; value: T } | { ok: false; error: E }
): asserts result is { ok: true; value: T } {
  expect(result.ok).toBe(true);
}

export function assertResultFail<T, E>(
  result: { ok: true; value: T } | { ok: false; error: E }
): asserts result is { ok: false; error: E } {
  expect(result.ok).toBe(false);
}

export function createDeferredPromise<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export function createRejectionHandler() {
  let rejection: Error | undefined;
  
  const handleRejection = (reason: unknown) => {
    if (reason instanceof Error) {
      rejection = reason;
    } else {
      rejection = new Error(String(reason));
    }
  };

  const reset = () => {
    rejection = undefined;
  };

  const getRejection = () => rejection;
  const assertNoRejection = () => {
    if (rejection) {
      throw new Error(`Unexpected rejection: ${rejection.message}`);
    }
  };

  return { handleRejection, getRejection, assertNoRejection, reset };
}

export class TestContainer {
  private services: Map<string, unknown> = new Map();

  register<T>(token: string, instance: T): this {
    this.services.set(token, instance);
    return this;
  }

  resolve<T>(token: string): T {
    const service = this.services.get(token);
    if (!service) {
      throw new Error(`Service not registered: ${token}`);
    }
    return service as T;
  }

  has(token: string): boolean {
    return this.services.has(token);
  }

  clear(): void {
    this.services.clear();
  }
}

export function createEventEmitter<T extends Record<string, unknown[]>>() {
  const listeners: Partial<{ [K in keyof T]: ((...args: T[K]) => void)[] }> = {};

  return {
    on<K extends keyof T>(event: K, handler: (...args: T[K]) => void): () => void {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event]!.push(handler);
      return () => this.off(event, handler);
    },

    off<K extends keyof T>(event: K, handler: (...args: T[K]) => void): void {
      const eventListeners = listeners[event];
      if (eventListeners) {
        const index = eventListeners.indexOf(handler);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    },

    emit<K extends keyof T>(event: K, ...args: T[K]): void {
      const eventListeners = listeners[event];
      if (eventListeners) {
        eventListeners.forEach((handler) => handler(...args));
      }
    },

    clear(): void {
      for (const key of Object.keys(listeners) as (keyof T)[]) {
        listeners[key] = [];
      }
    },
  };
}
