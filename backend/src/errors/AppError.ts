export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    Object.setPrototypeOf(this, ValidationError.prototype);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Autenticación requerida') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    Object.setPrototypeOf(this, AuthenticationError.prototype);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'No tienes permisos para realizar esta acción') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    Object.setPrototypeOf(this, AuthorizationError.prototype);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND_ERROR');
    Object.setPrototypeOf(this, NotFoundError.prototype);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'El recurso ya existe') {
    super(message, 409, 'CONFLICT_ERROR');
    Object.setPrototypeOf(this, ConflictError.prototype);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number = 60) {
    super('Demasiadas solicitudes, intenta más tarde', 429, 'RATE_LIMIT_ERROR');
    Object.setPrototypeOf(this, RateLimitError.prototype);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class CrisisDetectedError extends AppError {
  public readonly level: 'bajo' | 'medio' | 'alto' | 'critico';
  public readonly indicator: string;

  constructor(
    level: 'bajo' | 'medio' | 'alto' | 'critico',
    indicator: string,
    message?: string
  ) {
    super(
      message || `Crisis detectada: ${level}`,
      403,
      'CRISIS_DETECTED_ERROR'
    );
    Object.setPrototypeOf(this, CrisisDetectedError.prototype);
    this.name = 'CrisisDetectedError';
    this.level = level;
    this.indicator = indicator;
  }
}

export class ProviderError extends AppError {
  public readonly provider: string;
  public readonly retryable: boolean;

  constructor(
    provider: string,
    message: string,
    statusCode: number = 502,
    retryable: boolean = false
  ) {
    super(message, statusCode, 'PROVIDER_ERROR');
    Object.setPrototypeOf(this, ProviderError.prototype);
    this.name = 'ProviderError';
    this.provider = provider;
    this.retryable = retryable;
  }
}
