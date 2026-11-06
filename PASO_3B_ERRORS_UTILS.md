# 🛠️ PASO 3B: ERRORS + UTILS
## Implementación de Clases de Error y Utilidades

**Duración estimada:** 2-3 días  
**Dependencias:** PASO 3A completado  
**Status:** Ready to implement

---

## 📋 CHECKLIST PASO 3B

- [ ] Crear error classes
- [ ] Setup logger (Winston)
- [ ] Crear validators (Joi)
- [ ] Crear hash utils (anonymization)
- [ ] Unit tests para utils
- [ ] Run `npm run build` (debe pasar)
- [ ] Run `npm run lint` (must pass)
- [ ] Commit: "feat: add error classes and utilities"

---

## 1. ERRORS/INDEX.TS

```typescript
// backend/src/errors/index.ts
// Custom error classes para toda la aplicación

/**
 * Base AppError - Todas las excepciones heredan de esto
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Provider-specific error (Claude, OpenAI, etc)
 */
export class ProviderError extends AppError {
  constructor(
    public provider: string,
    originalError: Error,
    public retriable: boolean = true
  ) {
    const message = `Provider error [${provider}]: ${originalError.message}`;
    super(`provider_${provider}`, message, 503);
  }
}

/**
 * Validation error (bad input from user)
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super('validation_error', message, 400, { field, value });
  }
}

/**
 * Configuration error (bad setup)
 */
export class ConfigError extends AppError {
  constructor(message: string, public missingVar?: string) {
    super('config_error', message, 500, { missingVar });
  }
}

/**
 * Service unavailable (no providers, all down)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super('service_unavailable', message, 503);
  }
}

/**
 * Data extraction error (JSON parsing failed)
 */
export class ExtractionError extends AppError {
  constructor(
    provider: string,
    message: string,
    public rawResponse?: string
  ) {
    super(
      `extraction_${provider}`,
      `JSON extraction failed [${provider}]: ${message}`,
      500,
      { provider, rawResponse }
    );
  }
}

/**
 * Crisis handling error
 */
export class CrisisHandlingError extends AppError {
  constructor(message: string, public userId?: string) {
    super('crisis_handling_error', message, 500, { userId });
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message: string, public query?: string) {
    super('database_error', message, 500, { query });
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super('not_found', message, 404, { resource, id });
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('unauthorized', message, 401);
  }
}

/**
 * Type guard: Check if error is AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert any error to AppError
 */
export function toAppError(error: any): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError('unknown_error', error.message, 500);
  }

  return new AppError('unknown_error', String(error), 500);
}
```

---

## 2. UTILS/LOGGER.TS

```typescript
// backend/src/utils/logger.ts
// Winston logger setup

import winston from 'winston';
import path from 'path';

/**
 * Logger configuration
 */
const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Winston logger instance
 */
export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    isDevelopment
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? `\n${JSON.stringify(meta, null, 2)}`
        : '';
      return `${timestamp} [${level}]: ${message}${metaStr}`;
    })
  ),
  transports: [
    // Console - always
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],

  // Handle exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log'),
    }),
  ],

  // Handle rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.log'),
    }),
  ],
});

/**
 * Helper methods for common logging patterns
 */
export const log = {
  info: (message: string, meta?: any) => logger.info(message, meta),
  error: (message: string, error?: any, meta?: any) => {
    logger.error(message, { error, ...meta });
  },
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  
  // Provider-specific
  providerCall: (provider: string, model: string) => {
    logger.debug(`Calling ${provider}/${model}`);
  },
  providerError: (provider: string, error: Error) => {
    logger.error(`Provider error [${provider}]`, { error });
  },
  
  // Crisis-specific
  crisisDetected: (severity: string, userId?: string) => {
    logger.warn(`Crisis detected [${severity}]`, { userId, anonymous: !userId });
  },
  
  // Cost tracking
  costTracked: (provider: string, cost: number, tokens: number) => {
    logger.debug(`Cost tracked`, { provider, cost, tokens });
  },
};

export default logger;
```

---

## 3. UTILS/VALIDATOR.TS

```typescript
// backend/src/utils/validator.ts
// Input validation using Joi

import Joi, { ValidationError } from 'joi';
import { ValidationError as AppValidationError } from '../errors';

/**
 * Validation schemas
 */
export const schemas = {
  /**
   * Chat message validation
   */
  chatMessage: Joi.object({
    sessionId: Joi.string().uuid().required(),
    userId: Joi.string().uuid().required(),
    message: Joi.string().min(1).max(5000).required(),
    detectCrisis: Joi.boolean().default(false),
    requiresDeepReasoning: Joi.boolean().default(false),
  }),

  /**
   * Session creation validation
   */
  createSession: Joi.object({
    userId: Joi.string().uuid().required(),
    tema: Joi.string().max(100),
    objetivo: Joi.string().max(500),
    area: Joi.string()
      .valid('carrera', 'familia', 'educación', 'salud', 'personal', 'general')
      .default('general'),
  }),

  /**
   * Compromise validation
   */
  createCompromise: Joi.object({
    sessionId: Joi.string().uuid().required(),
    enunciado: Joi.string().min(10).max(500).required(),
    fecha_límite: Joi.date().required(),
    indicador_éxito: Joi.string().max(300).required(),
    pasos_concretos: Joi.array().items(Joi.string()).min(1).required(),
    obstáculos_previstos: Joi.array().items(Joi.string()),
    recursos_necesarios: Joi.array().items(Joi.string()),
  }),

  /**
   * Config validation
   */
  envConfig: Joi.object({
    ANTHROPIC_API_KEY: Joi.string().allow(''),
    OPENAI_API_KEY: Joi.string().allow(''),
    DATABASE_URL: Joi.string().required(),
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    LOG_LEVEL: Joi.string()
      .valid('error', 'warn', 'info', 'debug')
      .default('info'),
  }),
};

/**
 * Validator function with error handling
 */
export function validate<T>(
  data: unknown,
  schema: Joi.ObjectSchema
): T {
  const { value, error } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
      type: d.type,
    }));

    throw new AppValidationError(
      `Validation failed: ${error.message}`,
      error.details[0]?.path.join('.'),
      details
    );
  }

  return value as T;
}

/**
 * Safe validate (returns result object instead of throwing)
 */
export function safeValidate<T>(
  data: unknown,
  schema: Joi.ObjectSchema
): { valid: true; value: T } | { valid: false; error: ValidationError } {
  const result = schema.validate(data, { abortEarly: false });

  if (result.error) {
    return { valid: false, error: result.error };
  }

  return { valid: true, value: result.value as T };
}

/**
 * Common validators
 */
export const validators = {
  /**
   * Validate UUID
   */
  isValidUUID: (value: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },

  /**
   * Validate email
   */
  isValidEmail: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Validate coaching etapa (1-7)
   */
  isValidEtapa: (value: number): boolean => {
    return Number.isInteger(value) && value >= 1 && value <= 7;
  },

  /**
   * Validate confidence score (0-1)
   */
  isValidConfidence: (value: number): boolean => {
    return typeof value === 'number' && value >= 0 && value <= 1;
  },
};
```

---

## 4. UTILS/HASH.TS

```typescript
// backend/src/utils/hash.ts
// Hashing utilities para anonymization

import crypto from 'crypto';

/**
 * Configuration
 */
const HASH_ALGORITHM = 'sha256';
const HASH_ENCODING = 'hex';

/**
 * Salt para hashing (debe estar en .env, pero usamos default para dev)
 */
const HASH_SALT = process.env.HASH_SALT || 'default-salt-dev-only';

/**
 * Hash user ID for anonymization
 * Usado para logging de crisis events (anónimo)
 */
export function hashUserId(userId: string): string {
  return crypto
    .createHmac(HASH_ALGORITHM, HASH_SALT)
    .update(userId)
    .digest(HASH_ENCODING)
    .substring(0, 16); // Truncate para privacidad
}

/**
 * Verify hash (para validar integridad)
 */
export function verifyHash(value: string, hash: string): boolean {
  const computed = hashUserId(value);
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(hash)
  );
}

/**
 * Generate random token (para sessions)
 */
export function generateToken(length: number = 32): string {
  return crypto
    .randomBytes(length)
    .toString(HASH_ENCODING)
    .substring(0, length);
}

/**
 * Hash password (bcrypt en producción, pero usamos sha256 para MVP)
 * NOTA: En producción usar bcrypt o argon2
 */
export function hashPassword(password: string): string {
  return crypto
    .createHash(HASH_ALGORITHM)
    .update(password + HASH_SALT)
    .digest(HASH_ENCODING);
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string): boolean {
  const computed = hashPassword(password);
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(hash)
  );
}

/**
 * Anonymize string (para sensitive data)
 */
export function anonymize(text: string, showChars: number = 3): string {
  if (text.length <= showChars) return '*'.repeat(text.length);
  return text.substring(0, showChars) + '*'.repeat(text.length - showChars);
}

export const hash = {
  userId: hashUserId,
  password: hashPassword,
  token: generateToken,
  anonymize,
  verify: {
    hash: verifyHash,
    password: verifyPassword,
  },
};

export default hash;
```

---

## 5. UTILS/INDEX.TS

```typescript
// backend/src/utils/index.ts
// Export all utils

export * from './logger';
export { logger, log } from './logger';
export * from './validator';
export { validate, safeValidate, validators, schemas } from './validator';
export * from './hash';
export { hash, hashUserId, generateToken } from './hash';
```

---

## 6. UNIT TESTS

### 6.1 tests/unit/errors.test.ts

```typescript
// backend/tests/unit/errors.test.ts

import {
  AppError,
  ProviderError,
  ValidationError,
  ConfigError,
  ServiceUnavailableError,
  ExtractionError,
  isAppError,
  toAppError,
} from '../../src/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError('test_code', 'Test message', 400);
      expect(error.code).toBe('test_code');
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(400);
    });

    it('should serialize to JSON', () => {
      const error = new AppError('test_code', 'Test message', 400);
      const json = error.toJSON();
      expect(json.code).toBe('test_code');
      expect(json.statusCode).toBe(400);
    });
  });

  describe('ProviderError', () => {
    it('should create provider error', () => {
      const originalError = new Error('Original error');
      const error = new ProviderError('claude', originalError, true);
      expect(error.provider).toBe('claude');
      expect(error.retriable).toBe(true);
      expect(error.statusCode).toBe(503);
    });
  });

  describe('Type guards', () => {
    it('should identify AppError', () => {
      const error = new AppError('test', 'test', 500);
      expect(isAppError(error)).toBe(true);
    });

    it('should convert error to AppError', () => {
      const error = new Error('Original');
      const appError = toAppError(error);
      expect(isAppError(appError)).toBe(true);
      expect(appError.message).toContain('Original');
    });
  });
});
```

### 6.2 tests/unit/utils.test.ts

```typescript
// backend/tests/unit/utils.test.ts

import {
  hashUserId,
  hashPassword,
  generateToken,
  anonymize,
  validate,
  validators,
  schemas,
} from '../../src/utils';

describe('Hash Utils', () => {
  describe('hashUserId', () => {
    it('should hash user ID consistently', () => {
      const userId = 'user-123';
      const hash1 = hashUserId(userId);
      const hash2 = hashUserId(userId);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different IDs', () => {
      const hash1 = hashUserId('user-1');
      const hash2 = hashUserId('user-2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateToken', () => {
    it('should generate unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });

    it('should respect length parameter', () => {
      const token = generateToken(16);
      expect(token.length).toBe(16);
    });
  });

  describe('anonymize', () => {
    it('should anonymize text correctly', () => {
      const result = anonymize('john@example.com', 3);
      expect(result).toBe('joh*@example.com');
    });
  });
});

describe('Validators', () => {
  describe('isValidUUID', () => {
    it('should validate UUID format', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(validators.isValidUUID(validUUID)).toBe(true);
    });

    it('should reject invalid UUID', () => {
      expect(validators.isValidUUID('not-a-uuid')).toBe(false);
    });
  });

  describe('isValidEtapa', () => {
    it('should validate coaching etapas (1-7)', () => {
      expect(validators.isValidEtapa(1)).toBe(true);
      expect(validators.isValidEtapa(7)).toBe(true);
      expect(validators.isValidEtapa(8)).toBe(false);
      expect(validators.isValidEtapa(0)).toBe(false);
    });
  });

  describe('validate function', () => {
    it('should validate and return data', () => {
      const data = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        message: 'Hello',
      };
      const result = validate(data, schemas.chatMessage);
      expect(result.message).toBe('Hello');
    });

    it('should throw ValidationError on invalid data', () => {
      expect(() => {
        validate(
          { sessionId: 'invalid', userId: 'invalid', message: '' },
          schemas.chatMessage
        );
      }).toThrow();
    });
  });
});
```

---

## ✅ VERIFICACIÓN

```bash
# 1. TypeScript compilation
npm run build

# 2. ESLint check
npm run lint

# 3. Run unit tests
npm run test -- tests/unit/

# 4. Si todo pasa:
git add src/errors src/utils tests/unit/
git commit -m "feat: add error classes and utilities (logger, validator, hash)"
```

---

## 📋 ARCHIVOS CREADOS EN PASO 3B

```
src/errors/
├── index.ts              ✅ AppError + 7 custom errors

src/utils/
├── logger.ts             ✅ Winston logger setup
├── validator.ts          ✅ Joi validation + schemas
├── hash.ts               ✅ Hash, token, anonymization
└── index.ts              ✅ Export all utils

tests/unit/
├── errors.test.ts        ✅ Error class tests
└── utils.test.ts         ✅ Utils tests
```

---

## 🎯 PRÓXIMO PASO

**PASO 3C:** Database (models + migrations)

---

*PASO 3B completado. Errors + Utils listos para usar.*
