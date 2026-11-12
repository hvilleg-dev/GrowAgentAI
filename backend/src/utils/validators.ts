import Joi from 'joi';
import { ValidationError } from '@/errors/AppError';

export const schemas = {
  createSession: Joi.object({
    usuarioId: Joi.string().uuid().required(),
    objetivo: Joi.string().min(1).max(500).optional(),
    goalId: Joi.string().uuid().optional(),
    tema: Joi.string().optional(),
    deviceId: Joi.string().optional()
  }),

  chat: Joi.object({
    sessionId: Joi.string().uuid().required(),
    userId: Joi.string().uuid().required(),
    message: Joi.string().min(1).max(5000).required()
  }),

  sendMessage: Joi.object({
    sesionId: Joi.string().uuid().required(),
    contenido: Joi.string().min(1).max(5000).required(),
    rol: Joi.string().valid('usuario', 'coach').required()
  }),

  createUser: Joi.object({
    nombre: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    idioma: Joi.string().length(2).default('es')
  }),

  loginUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  detectionQuery: Joi.object({
    texto: Joi.string().min(1).max(10000).required(),
    contexto: Joi.string().max(1000)
  })
};

export async function validateData<T>(
  data: unknown,
  schema: Joi.ObjectSchema
): Promise<T> {
  try {
    const validated = await schema.validateAsync(data, {
      abortEarly: false,
      stripUnknown: false
    });
    return validated as T;
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      const details = error.details.map(d => `${d.path.join('.')}: ${d.message}`);
      throw new ValidationError(details.join(', '));
    }
    throw error;
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
