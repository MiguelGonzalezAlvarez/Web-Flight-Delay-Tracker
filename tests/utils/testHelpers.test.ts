import {
  createMock,
  waitFor,
  assertIsError,
  assertResultOk,
  assertResultFail,
  createDeferredPromise,
  createRejectionHandler,
  TestContainer,
  createEventEmitter,
} from '@/tests/utils/testHelpers';

describe('Test Helpers', () => {
  describe('createMock', () => {
    it('should create a mock object', () => {
      const mock = createMock<{ foo: () => string }>({
        foo: jest.fn().mockReturnValue('bar'),
      });

      expect(mock.foo()).toBe('bar');
    });

    it('should auto-create methods', () => {
      const mock = createMock<{ doSomething: () => void }>();
      
      expect(typeof mock.doSomething).toBe('function');
    });
  });

  describe('waitFor', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should wait for condition to be true', async () => {
      let count = 0;
      const promise = waitFor(() => {
        count++;
        return count >= 3;
      });

      jest.advanceTimersByTime(50);
      await Promise.resolve();
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      jest.advanceTimersByTime(50);

      await expect(promise).resolves.toBeUndefined();
    });

    it('should throw on timeout', async () => {
      const promise = waitFor(() => false, 100);

      jest.advanceTimersByTime(150);

      await expect(promise).rejects.toThrow('Timeout');
    });
  });

  describe('assertIsError', () => {
    it('should not throw for Error instances', () => {
      expect(() => assertIsError(new Error('test'))).not.toThrow();
    });

    it('should throw for non-Error values', () => {
      expect(() => assertIsError('not an error')).toThrow();
      expect(() => assertIsError(null)).toThrow();
      expect(() => assertIsError(undefined)).toThrow();
    });

    it('should check message when provided', () => {
      expect(() => assertIsError(new Error('something went wrong'), 'went')).not.toThrow();
      expect(() => assertIsError(new Error('something went wrong'), 'wrong')).not.toThrow();
      expect(() => assertIsError(new Error('something went wrong'), 'right')).toThrow();
    });
  });

  describe('assertResultOk', () => {
    it('should not throw for ok result', () => {
      const result = { ok: true as const, value: 'test' };
      expect(() => assertResultOk(result)).not.toThrow();
    });

    it('should throw for failed result', () => {
      const result = { ok: false as const, error: new Error('failed') };
      expect(() => assertResultOk(result)).toThrow();
    });
  });

  describe('assertResultFail', () => {
    it('should not throw for failed result', () => {
      const result = { ok: false as const, error: new Error('failed') };
      expect(() => assertResultFail(result)).not.toThrow();
    });

    it('should throw for ok result', () => {
      const result = { ok: true as const, value: 'test' };
      expect(() => assertResultFail(result)).toThrow();
    });
  });

  describe('createDeferredPromise', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should create a resolvable promise', async () => {
      const { promise, resolve } = createDeferredPromise<string>();

      setTimeout(() => resolve('resolved'), 10);
      jest.advanceTimersByTime(20);
      await expect(promise).resolves.toBe('resolved');
    });

    it('should create a rejectable promise', async () => {
      const { promise, reject } = createDeferredPromise<string>();

      setTimeout(() => reject(new Error('rejected')), 10);
      jest.advanceTimersByTime(20);

      await expect(promise).rejects.toThrow('rejected');
    });
  });

  describe('createRejectionHandler', () => {
    it('should capture rejections', () => {
      const { handleRejection, getRejection } = createRejectionHandler();

      handleRejection(new Error('test error'));
      expect(getRejection()?.message).toBe('test error');
    });

    it('should assert no rejection passes when no rejection', () => {
      const { assertNoRejection } = createRejectionHandler();
      expect(() => assertNoRejection()).not.toThrow();
    });

    it('should assert no rejection throws when there is a rejection', () => {
      const { handleRejection, assertNoRejection } = createRejectionHandler();
      handleRejection(new Error('unexpected'));

      expect(() => assertNoRejection()).toThrow('Unexpected rejection');
    });

    it('should reset state', () => {
      const { handleRejection, getRejection, reset } = createRejectionHandler();
      handleRejection(new Error('error'));
      expect(getRejection()).toBeDefined();

      reset();
      expect(getRejection()).toBeUndefined();
    });
  });

  describe('TestContainer', () => {
    it('should register and resolve services', () => {
      const container = new TestContainer();
      container.register('service', { foo: 'bar' });

      expect(container.resolve('service')).toEqual({ foo: 'bar' });
    });

    it('should throw for unresolved services', () => {
      const container = new TestContainer();
      expect(() => container.resolve('missing')).toThrow('Service not registered');
    });

    it('should check service existence', () => {
      const container = new TestContainer();
      container.register('service', {});

      expect(container.has('service')).toBe(true);
      expect(container.has('missing')).toBe(false);
    });

    it('should clear all services', () => {
      const container = new TestContainer();
      container.register('service1', {});
      container.register('service2', {});
      container.clear();

      expect(container.has('service1')).toBe(false);
      expect(container.has('service2')).toBe(false);
    });
  });

  describe('createEventEmitter', () => {
    it('should emit events to listeners', () => {
      const emitter = createEventEmitter<{ test: [string] }>();
      const handler = jest.fn();

      emitter.on('test', handler);
      emitter.emit('test', 'hello');

      expect(handler).toHaveBeenCalledWith('hello');
    });

    it('should allow unsubscribing', () => {
      const emitter = createEventEmitter<{ test: [string] }>();
      const handler = jest.fn();

      const unsubscribe = emitter.on('test', handler);
      unsubscribe();
      emitter.emit('test', 'hello');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should support multiple listeners', () => {
      const emitter = createEventEmitter<{ test: [string] }>();
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      emitter.on('test', handler1);
      emitter.on('test', handler2);
      emitter.emit('test', 'hello');

      expect(handler1).toHaveBeenCalledWith('hello');
      expect(handler2).toHaveBeenCalledWith('hello');
    });

    it('should clear all listeners', () => {
      const emitter = createEventEmitter<{ test: [string] }>();
      const handler = jest.fn();

      emitter.on('test', handler);
      emitter.clear();
      emitter.emit('test', 'hello');

      expect(handler).not.toHaveBeenCalled();
    });
  });
});
