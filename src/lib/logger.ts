export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export interface LoggerConfig {
  minLevel?: LogLevel;
  enableConsole?: boolean;
  enableRemote?: boolean;
  context?: Record<string, unknown>;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

export class Logger {
  private config: Required<LoggerConfig>;
  private static instance: Logger | null = null;

  private constructor(config: LoggerConfig) {
    this.config = {
      minLevel: config.minLevel ?? 'info',
      enableConsole: config.enableConsole ?? true,
      enableRemote: config.enableRemote ?? false,
      context: config.context ?? {},
    };
  }

  static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config ?? {});
    }
    return Logger.instance;
  }

  static resetInstance(): void {
    Logger.instance = null;
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.config.minLevel];
  }

  private formatEntry(entry: LogEntry): string {
    const context = { ...this.config.context, ...entry.context };
    const contextStr = Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
    const errorStr = entry.error ? `\n${entry.error.stack}` : '';
    return `[${entry.timestamp.toISOString()}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}${errorStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
    };

    if (this.config.enableConsole) {
      const formatted = this.formatEntry(entry);
      switch (level) {
        case 'debug':
          console.debug(formatted);
          break;
        case 'info':
          console.info(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
        case 'fatal':
          console.error(formatted);
          break;
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, context, error);
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('fatal', message, context, error);
  }

  child(additionalContext: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, additionalContext);
  }

  setLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  setContext(context: Record<string, unknown>): void {
    this.config.context = context;
  }
}

export class ChildLogger {
  private parent: Logger;
  private context: Record<string, unknown>;

  constructor(parent: Logger, context: Record<string, unknown>) {
    this.parent = parent;
    this.context = context;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.parent.debug(message, { ...this.context, ...context });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.parent.info(message, { ...this.context, ...context });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.parent.warn(message, { ...this.context, ...context });
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.parent.error(message, error, { ...this.context, ...context });
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.parent.fatal(message, error, { ...this.context, ...context });
  }
}

export function createLogger(config?: LoggerConfig): Logger {
  return Logger.getInstance(config);
}

export function getLogger(): Logger {
  return Logger.getInstance();
}

export function resetLogger(): void {
  Logger.resetInstance();
}
