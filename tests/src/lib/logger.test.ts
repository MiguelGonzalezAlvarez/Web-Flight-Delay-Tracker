import { Logger, createLogger, resetLogger, ChildLogger } from '@/src/lib/logger';

describe('Logger', () => {
  beforeEach(() => {
    resetLogger();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetLogger();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();
      expect(logger1).toBe(logger2);
    });

    it('should configure logger with options', () => {
      const logger = Logger.getInstance({ minLevel: 'error', enableConsole: false });
      expect(logger).toBeDefined();
    });
  });

  describe('logging methods', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = Logger.getInstance({ minLevel: 'debug' });
    });

    it('should log debug messages', () => {
      logger.debug('debug message');
      expect(console.debug).toHaveBeenCalledWith(expect.stringContaining('debug message'));
    });

    it('should log info messages', () => {
      logger.info('info message');
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('info message'));
    });

    it('should log warn messages', () => {
      logger.warn('warn message');
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('warn message'));
    });

    it('should log error messages', () => {
      logger.error('error message');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('error message'));
    });

    it('should include context in log', () => {
      logger.info('message', { userId: '123', action: 'test' });
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('userId'));
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('123'));
    });

    it('should include error stack trace', () => {
      const error = new Error('test error');
      logger.error('error with stack', error);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('test error'));
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error: test error'));
    });
  });

  describe('setLevel', () => {
    it('should filter logs based on level', () => {
      const logger = Logger.getInstance({ minLevel: 'error' });

      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();

      logger.error('error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('child logger', () => {
    it('should create child logger with context', () => {
      const logger = Logger.getInstance({ minLevel: 'debug' });
      const child = logger.child({ component: 'FlightService' });

      child.info('processing flight');

      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('component'));
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('FlightService'));
    });

    it('should merge parent and child context', () => {
      const logger = Logger.getInstance({ minLevel: 'debug', context: { app: 'flight-tracker' } });
      const child = logger.child({ component: 'FlightService' });

      child.info('test');

      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('app'));
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('flight-tracker'));
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('component'));
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('FlightService'));
    });
  });

  describe('createLogger', () => {
    it('should create logger with default config', () => {
      const logger = createLogger();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create logger with custom config', () => {
      const logger = createLogger({ minLevel: 'warn', enableConsole: false });
      expect(logger).toBeInstanceOf(Logger);
    });
  });
});
