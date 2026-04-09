export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppErrorContext {
  timestamp?: Date;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export abstract class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly context: AppErrorContext;
  public readonly isOperational: boolean;

  protected constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = 'medium',
    context: AppErrorContext = {},
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.context = {
      timestamp: new Date(),
      ...context,
    };
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      stack: this.stack,
    };
  }
}

export class RepositoryError extends AppError {
  public readonly entityType: string;
  public readonly operation: 'create' | 'read' | 'update' | 'delete';

  constructor(
    message: string,
    entityType: string,
    operation: 'create' | 'read' | 'update' | 'delete',
    cause?: Error,
    context: AppErrorContext = {}
  ) {
    super(
      message,
      'REPOSITORY_ERROR',
      'high',
      { ...context, entityType, operation }
    );
    this.entityType = entityType;
    this.operation = operation;
    if (cause) {
      this.cause = cause;
    }
  }
}

export class ServiceError extends AppError {
  public readonly serviceName: string;
  public readonly operation: string;

  constructor(
    message: string,
    serviceName: string,
    operation: string,
    severity: ErrorSeverity = 'medium',
    cause?: Error,
    context: AppErrorContext = {}
  ) {
    super(
      message,
      'SERVICE_ERROR',
      severity,
      { ...context, serviceName, operation }
    );
    this.serviceName = serviceName;
    this.operation = operation;
    if (cause) {
      this.cause = cause;
    }
  }
}

export class NetworkError extends AppError {
  public readonly url: string;
  public readonly statusCode?: number;
  public readonly retryable: boolean;

  constructor(
    message: string,
    url: string,
    statusCode?: number,
    retryable: boolean = true,
    cause?: Error,
    context: AppErrorContext = {}
  ) {
    super(
      message,
      'NETWORK_ERROR',
      statusCode && statusCode >= 500 ? 'high' : 'medium',
      { ...context, url, statusCode, retryable }
    );
    this.url = url;
    this.statusCode = statusCode;
    this.retryable = retryable;
    if (cause) {
      this.cause = cause;
    }
  }
}

export class ExternalServiceError extends AppError {
  public readonly serviceName: string;
  public readonly endpoint?: string;

  constructor(
    message: string,
    serviceName: string,
    endpoint?: string,
    severity: ErrorSeverity = 'high',
    cause?: Error,
    context: AppErrorContext = {}
  ) {
    super(
      message,
      'EXTERNAL_SERVICE_ERROR',
      severity,
      { ...context, serviceName, endpoint }
    );
    this.serviceName = serviceName;
    this.endpoint = endpoint;
    if (cause) {
      this.cause = cause;
    }
  }
}

export class CacheError extends AppError {
  public readonly cacheKey: string;
  public readonly operation: 'get' | 'set' | 'delete' | 'clear';

  constructor(
    message: string,
    cacheKey: string,
    operation: 'get' | 'set' | 'delete' | 'clear',
    cause?: Error,
    context: AppErrorContext = {}
  ) {
    super(
      message,
      'CACHE_ERROR',
      'low',
      { ...context, cacheKey, operation }
    );
    this.cacheKey = cacheKey;
    this.operation = operation;
    if (cause) {
      this.cause = cause;
    }
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return error.retryable;
  }
  if (error instanceof ExternalServiceError) {
    return error.severity !== 'critical';
  }
  return false;
}
