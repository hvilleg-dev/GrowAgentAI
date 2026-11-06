# 🔧 PASO 3A: TYPES + CONSTANTS
## Implementación de Interfaces y Constantes

**Duración estimada:** 3-4 días  
**Status:** Ready to implement  
**Dependencies:** PASO 2 (setup) completado

---

## 📋 CHECKLIST PASO 3A

- [ ] Crear tipos TypeScript (interfaces)
- [ ] Crear constantes (GROW etapas, prompts)
- [ ] Validar tipos con TypeScript strict mode
- [ ] Crear enums para valores fijos
- [ ] Documentar tipos (JSDoc)
- [ ] Run `npm run build` (debe pasar)
- [ ] Commit: "feat: add type definitions and constants"

---

## 1. TYPES/PROVIDERS.TS

```typescript
// backend/src/types/providers.ts
// Interfaces para todos los providers (Claude, OpenAI, DeepSeek, Ollama)

/**
 * Core Message type
 */
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

/**
 * Provider options (configuración por request)
 */
export interface ProviderOptions {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  timeout?: number;  // ms
  retryCount?: number;
}

/**
 * Response from any LLM provider
 */
export interface ChatResponse {
  text: string;
  tokensInput: number;
  tokensOutput: number;
  model: string;
  latencyMs: number;
  costUSD: number;
  provider: 'claude' | 'openai' | 'deepseek' | 'ollama';
  timestamp: Date;
}

/**
 * Classification result (para máquina de estados)
 */
export interface ClassificationResult {
  cumpleCriterio: boolean;
  confianza: number;  // 0-1
  razon: string;
  temaPendiente?: string;
}

/**
 * JSON extraction result
 */
export interface ExtractionResult {
  success: boolean;
  data: any;  // Structured JSON
  confidence: number;  // 0-1
  error?: string;
}

/**
 * Crisis detection result
 */
export interface CrisisDetectionResult {
  detectado: boolean;
  nivel: 'crítico' | 'severo' | null;
  confianza: number;  // 0-1
  palabrasClaveEncontradas: string[];
  requiresManualReview?: boolean;  // ⭐ NEW
}

/**
 * Main LLM Provider Interface
 * Todos los providers DEBEN implementar esto
 */
export interface ILLMProvider {
  /**
   * Core chat method
   */
  chat(
    messages: Message[],
    systemPrompt: string,
    options?: ProviderOptions
  ): Promise<ChatResponse>;

  /**
   * Streaming chat (para UX "typing...")
   */
  chatStream(
    messages: Message[],
    systemPrompt: string,
    onChunk: (chunk: string) => void,
    options?: ProviderOptions
  ): Promise<ChatResponse>;

  /**
   * Classify etapa GROW (1-7)
   */
  classify(
    etapa: number,
    respuestaUsuario: string,
    context: SessionContext
  ): Promise<ClassificationResult>;

  /**
   * Extract JSON (compromisos, etc)
   */
  extractJSON(
    prompt: string,
    schema: JSONSchema,
    options?: ProviderOptions
  ): Promise<ExtractionResult>;

  /**
   * Crisis detection
   * CRITICAL: Must have 95%+ confidence or layer with manual review
   */
  detectCrisis(
    mensaje: string,
    context?: SessionContext
  ): Promise<CrisisDetectionResult>;

  /**
   * Provider metadata
   */
  getName(): string;
  getModel(): string;
  getMaxTokens(): number;
  getCostPerMillion(type: 'input' | 'output'): number;
  getLatencyMs(): number;
  getAvailableModels(): string[];
}

/**
 * Session context (para classification/crisis detection)
 */
export interface SessionContext {
  sessionId: string;
  userId: string;
  etapaActual?: number;
  respuestasAnteriores?: Message[];
  metaArea?: string;
}

/**
 * Selection context (para router)
 */
export interface SelectionContext {
  sessionId: string;
  userId: string;
  detectCrisis: boolean;
  requiresDeepReasoning: boolean;
  useBudgetMode?: boolean;  // Para DeepSeek future
}

/**
 * JSON Schema definition (for validation)
 */
export interface JSONSchema {
  type: string;
  properties: Record<string, any>;
  required?: string[];
}

/**
 * Cost tracking record
 */
export interface UsageRecord {
  userId: string;
  sessionId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  latencyMs?: number;
  timestamp?: Date;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  enabled: boolean;
  apiKey?: string;
  priority: number;  // 1 = primary, 2 = fallback
  maxRetries?: number;
  timeout?: number;
}

/**
 * LLM configuration (flexible: 1+ providers required)
 */
export interface LLMConfiguration {
  availableProviders: ('claude' | 'openai' | 'deepseek' | 'ollama')[];
  primaryProvider: 'claude' | 'openai' | 'deepseek' | 'ollama';
  hasRedundancy: boolean;
  config: Record<string, ProviderConfig>;
}
```

---

## 2. TYPES/COACHING.TS

```typescript
// backend/src/types/coaching.ts
// Domain types para el coaching framework GROW

/**
 * Etapas del ciclo de coaching GROW
 */
export type CoachingEtapa = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Estados de una sesión
 */
export type SessionState = 'activa' | 'completada' | 'pausada' | 'bloqueada';

/**
 * Áreas de coaching
 */
export type CoachingArea = 'carrera' | 'familia' | 'educación' | 'salud' | 'personal' | 'general';

/**
 * Estados de compromiso
 */
export type CompromiseState = 'activo' | 'completado' | 'pendiente' | 'fallido';

/**
 * Dificultad de compromiso
 */
export type DifficultyLevel = 'fácil' | 'medio' | 'difícil';

/**
 * Tipos de crisis
 */
export type CrisisType = 'ideación_suicida' | 'autolesión' | 'trauma' | 'burnout' | 'depresión';

/**
 * Usuario en el sistema
 */
export interface Usuario {
  id: string;  // UUID
  email: string;
  nombre?: string;
  idioma: 'es' | 'en' | 'pt';
  edad_rango?: string;
  fecha_registro: Date;
  last_login?: Date;
}

/**
 * Sesión de coaching
 */
export interface Sesion {
  id: string;  // UUID
  usuario_id: string;
  fecha_inicio: Date;
  fecha_fin?: Date;
  tema?: string;
  objetivo?: string;
  etapa_actual: CoachingEtapa;
  estado: SessionState;
  archivo_raíz?: string;  // Referencia a archivo .md usado
}

/**
 * Interacción (mensaje) en sesión
 */
export interface Interaccion {
  id: string;
  sesion_id: string;
  rol: 'usuario' | 'coach';
  mensaje: string;
  timestamp: Date;
  etapa: CoachingEtapa;
  intención?: string;  // 'conectar', 'aclarar', 'desafiar', etc
  fuente_pregunta?: string;  // Ref a archivo .md
}

/**
 * Compromiso (commitment) del usuario
 */
export interface Compromiso {
  id: string;
  sesion_id: string;
  enunciado: string;
  fecha_límite: Date;
  fecha_creación: Date;
  indicador_éxito: string;
  pasos_concretos: string[];
  obstáculos_previstos: string[];
  recursos_necesarios: string[];
  estado: CompromiseState;
  dificultad: DifficultyLevel;
  evaluación_final?: string;
}

/**
 * Meta del usuario (nivel más alto)
 */
export interface Meta {
  id: string;
  usuario_id: string;
  descripción: string;
  fecha_creación: Date;
  fecha_meta: Date;
  progreso: number;  // 0-100
  área: CoachingArea;
  hitos: string[];  // IDs de compromisos completados
  estado: 'activa' | 'completada' | 'abandonada';
}

/**
 * Creencia limitante identificada
 */
export interface CreenciaLimitante {
  id: string;
  usuario_id: string;
  creencia: string;
  sesion_origen: string;
  fecha: Date;
  contexto?: string;
  desafiada: boolean;
  fecha_desafío?: Date;
}

/**
 * Evento de crisis (ANÓNIMO)
 */
export interface EventoCrisis {
  id: string;
  usuario_anónimo: string;  // Hash, NO ID real
  fecha: Date;
  tipo: CrisisType;
  nivel: 'crítico' | 'severo';
  derivado_a?: string;  // Línea de ayuda
  registrado: boolean;
}

/**
 * Registro de uso de tokens (para cost tracking)
 */
export interface TokenUsage {
  id: string;
  userId: string;
  sessionId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  latencyMs?: number;
  timestamp: Date;
}

/**
 * Fragmento RAG (para búsqueda semántica)
 */
export interface FragmentoRAG {
  id: string;
  archivo: string;  // "09_guías_C"
  sección: string;  // "3.1", "4.2"
  contenido: string;
  embedding?: number[];  // pgvector embedding
  tema: CoachingArea;
}
```

---

## 3. TYPES/ERRORS.TS

```typescript
// backend/src/types/errors.ts
// Custom error types

/**
 * Base error class
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Provider-specific error
 */
export class ProviderError extends AppError {
  constructor(
    public provider: string,
    originalError: Error,
    public retriable: boolean = true
  ) {
    super(
      `provider_${provider}`,
      `Provider error [${provider}]: ${originalError.message}`,
      503
    );
    this.name = 'ProviderError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super('validation_error', message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Configuration error
 */
export class ConfigError extends AppError {
  constructor(message: string) {
    super('config_error', message, 500);
    this.name = 'ConfigError';
  }
}

/**
 * Service unavailable (no providers, all down)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super('service_unavailable', message, 503);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Data extraction error
 */
export class ExtractionError extends AppError {
  constructor(provider: string, message: string) {
    super(
      `extraction_${provider}`,
      `JSON extraction failed [${provider}]: ${message}`,
      500
    );
    this.name = 'ExtractionError';
  }
}

/**
 * Crisis handling error
 */
export class CrisisHandlingError extends AppError {
  constructor(message: string) {
    super('crisis_handling_error', message, 500);
    this.name = 'CrisisHandlingError';
  }
}
```

---

## 4. CONSTANTS/COACHING-CRITERIA.TS

```typescript
// backend/src/constants/coaching-criteria.ts
// GROW etapas, criterios, y intenciones (from PROPUESTA_V3)

/**
 * GROW Framework Etapas
 * Source: ICF (International Coach Federation) + PROPUESTA_V3_ARQUITECTURA_FINAL.md
 */
export const COACHING_ETAPAS = {
  1: {
    nombre: 'CONECTAR',
    descripción: 'Establecer conexión emocional y contexto',
    criterio: 'Usuario ha compartido cómo está hoy con emoción o contexto',
    minConfidence: 0.70,
    ejemplos: [
      'Me siento confundido sobre mi carrera',
      'Estoy ansioso porque no sé qué hacer',
      'Me siento atrapado en esta situación'
    ]
  },
  
  2: {
    nombre: 'OBJETIVO',
    descripción: 'Definir objetivo claro y mensurable',
    criterio: 'Usuario ha identificado un objetivo con tema específico y resultado deseado',
    minConfidence: 0.75,
    ejemplos: [
      'Quiero cambiar de carrera en 6 meses',
      'Mi objetivo es mejorar mi relación con mi familia',
      'Necesito completar mi educación'
    ]
  },
  
  3: {
    nombre: 'REALIDAD',
    descripción: 'Explorar la situación actual sin juzgar',
    criterio: 'Usuario describe su situación actual, qué ha intentado, y qué funciona',
    minConfidence: 0.75,
    ejemplos: [
      'He trabajado 10 años en IT, pero quiero hacer algo diferente',
      'Hemos intentado hablar pero siempre terminamos discutiendo',
      'Empecé la universidad hace 2 años pero estoy atrasado'
    ]
  },
  
  4: {
    nombre: 'AMPLIAR',
    descripción: 'Expandir perspectivas y posibilidades',
    criterio: 'Usuario expresa una nueva comprensión, perspectiva, o energía',
    minConfidence: 0.70,
    ejemplos: [
      'Nunca había pensado que podría hacer consultoría',
      'Veo ahora que el problema no es la relación, es la comunicación',
      'Me doy cuenta que tengo más opciones de las que pensaba'
    ]
  },
  
  5: {
    nombre: 'OPCIONES',
    descripción: 'Generar múltiples opciones de acción',
    criterio: 'Usuario ha generado al menos 2 opciones distintas y viables',
    minConfidence: 0.75,
    ejemplos: [
      'Opción 1: Tomar un curso. Opción 2: Buscar mentor. Opción 3: Cambiar trabajo',
      'Podría hablar en persona o escribir una carta',
      'Puedo retomar este semestre o el próximo'
    ]
  },
  
  6: {
    nombre: 'COMPROMETER',
    descripción: 'Establecer compromiso concreto y observable',
    criterio: 'Usuario enuncia un compromiso específico con fecha y acción observable',
    minConfidence: 0.80,
    ejemplos: [
      'Me comprometo a buscar 3 cursos de UX antes del 15 de noviembre',
      'Voy a reservar una cita con un consejero esta semana',
      'Haré 3 intentos de comunicación sincera con mi pareja'
    ]
  },
  
  7: {
    nombre: 'CIERRE',
    descripción: 'Integrar aprendizajes y dar cierre',
    criterio: 'Usuario resume con sus palabras qué se lleva de la sesión',
    minConfidence: 0.70,
    ejemplos: [
      'Aprendí que tengo más opciones de las que pensaba',
      'Lo más importante es que necesito comunicar mejor',
      'Me voy con claridad sobre mi siguiente paso'
    ]
  }
} as const;

/**
 * Coaching intenciones (tipos de intervenciones)
 */
export const COACHING_INTENCIONES = [
  'conectar',      // Establecer rapport
  'aclarar',       // Hacer preguntas clarificadoras
  'desafiar',      // Confrontar creencias limitantes
  'explorar',      // Expandir perspectivas
  'validar',       // Reconocer emociones/logros
  'resumir',       // Sintentizar lo dicho
  'sugerir',       // Ofrecer opciones
  'comprometer',   // Ir a acción
] as const;

export type CoachingIntention = typeof COACHING_INTENCIONES[number];

/**
 * Validación de etapa (usado por máquina de estados)
 */
export function isValidEtapa(etapa: any): etapa is 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  return typeof etapa === 'number' && etapa >= 1 && etapa <= 7;
}

/**
 * Obtener criterio de etapa
 */
export function getCriteriEtapa(etapa: 1 | 2 | 3 | 4 | 5 | 6 | 7) {
  return COACHING_ETAPAS[etapa].criterio;
}

/**
 * Obtener confianza mínima para avanzar
 */
export function getMinConfidenceEtapa(etapa: 1 | 2 | 3 | 4 | 5 | 6 | 7) {
  return COACHING_ETAPAS[etapa].minConfidence;
}
```

---

## 5. CONSTANTS/SYSTEM-PROMPTS.TS

```typescript
// backend/src/constants/system-prompts.ts
// System prompts para diferentes funciones (from PROPUESTA_V3)

export const SYSTEM_PROMPTS = {
  /**
   * Base coaching prompt
   * Usado como fundación para todas las interacciones
   */
  coach: `Eres un coach profesional certificado ICF (International Coach Federation).

Tu rol es guiar al usuario a través del proceso GROW (Goal, Reality, Options, Will).

PRINCIPIOS:
- Escucha activa sin juzgar
- Haz preguntas poderosas que expandan perspectivas
- Valida emociones y experiencias
- Guía pero no diriges
- Respeta la autonomía del usuario
- Mantén confidencialidad
- Detecta crisis y deriva apropiadamente

RESTRICCIONES:
- No eres terapeuta (si detectas problema mental → derivar)
- No das consejo directo (haces preguntas en su lugar)
- No invalidates emociones
- No promises soluciones garantizadas

TONO: Empático, profesional, cálido
IDIOMA: Español (castellano), inclusive si usuario mezcla otros idiomas`,

  /**
   * Classification prompt
   * Para determinar si usuario pasó a siguiente etapa GROW
   */
  classifier: `Eres un evaluador de etapas del coaching GROW.

Tu tarea: Determinar si la respuesta del usuario cumple con los criterios para avanzar a la siguiente etapa.

FORMATO DE RESPUESTA (JSON VÁLIDO, SIN TEXTO ADICIONAL):
{
  "cumpleCriterio": true/false,
  "confianza": 0.0-1.0,
  "razon": "explicación breve de por qué sí/no",
  "temaPendiente": "qué falta explorar (si aplica)"
}

CRITERIOS:
- Confianza >= 0.7: Usuario listo para avanzar
- Confianza < 0.7: Profundizar más en etapa actual

NUNCA: Hagas suposiciones. Basate SOLO en lo que el usuario dijo.`,

  /**
   * JSON extraction prompt
   * Para extraer compromisos estructurados
   */
  jsonExtractor: `Eres un extractor de datos JSON perfecto.

Tu tarea: Extraer compromisos de coaching de la respuesta del usuario.

REGLAS:
1. Devuelve SOLO JSON válido, sin texto adicional
2. Campos obligatorios:
   - compromiso: descripción clara y específica
   - fecha_límite: ISO date (YYYY-MM-DD)
   - indicador_éxito: observable, no vago
   - pasos_concretos: array de strings
   - obstáculos_previstos: array de strings
   - recursos_necesarios: array de strings
3. Si datos incompletos: null, no adivines
4. Valida dificultad: "fácil" | "medio" | "difícil"

EJEMPLO VÁLIDO:
{
  "compromiso": "Enviar CV a 3 empresas",
  "fecha_límite": "2026-11-15",
  "indicador_éxito": "He enviado CVs y tengo confirmación de recepción",
  "pasos_concretos": ["Preparar CV", "Identificar 3 empresas", "Enviar"],
  "obstáculos_previstos": ["Perfeccionismo", "Miedo al rechazo"],
  "recursos_necesarios": ["LinkedIn", "Plantilla CV"],
  "dificultad": "medio"
}`,

  /**
   * Crisis detection prompt
   * Para detectar ideación suicida, autolesión, etc
   */
  crisisDetector: `Eres un especialista en detección de crisis y manejo de situaciones de riesgo.

Tu tarea: Analizar si el mensaje indica crisis (ideación suicida, autolesión, trauma severo).

FORMATO DE RESPUESTA (JSON VÁLIDO, SIN TEXTO ADICIONAL):
{
  "detectado": true/false,
  "nivel": "crítico" | "severo" | null,
  "confianza": 0.0-1.0,
  "palabrasClaveEncontradas": ["palabra1", "palabra2"]
}

DEFINICIONES:
- crítico: Ideación suicida inmediata
- severo: Autolesión, trauma, depresión severa
- null: Sin crisis

CRITERIOS DE CRÍTICO:
- Mencionas: suicidio, matarte, ya no quiero vivir, fin a todo
- Explícito: Planificación, método, preparación

CRITERIOS DE SEVERO:
- Autolesión: Cortarte, quemarte, golpearte
- Desesperación: Sin esperanza, soy una carga
- Trauma: Flashbacks, disociación

IMPORTANCIA:
- Si detectas CRÍTICO: Usuario será derivado a línea de ayuda
- Si SEVERO: Usuario verá recomendación de terapeuta
- Falso positivo: Usuario ve recursos "por si acaso"
- Falso negativo: INACEPTABLE (liability)

Sé conservador: Si dudas → marca como crisis`,

} as const;

export type PromptKey = keyof typeof SYSTEM_PROMPTS;

/**
 * Obtener prompt por función
 */
export function getSystemPrompt(key: PromptKey): string {
  return SYSTEM_PROMPTS[key];
}
```

---

## 6. CONSTANTS/ERROR-MESSAGES.TS

```typescript
// backend/src/constants/error-messages.ts
// Mensajes de error legibles para usuario + logs

export const ERROR_MESSAGES = {
  // Configuración
  CONFIG_MISSING_PROVIDER: 'At least one LLM provider must be configured (ANTHROPIC_API_KEY or OPENAI_API_KEY)',
  CONFIG_INVALID_DATABASE_URL: 'DATABASE_URL is not set or invalid',
  CONFIG_INVALID_PORT: 'PORT must be a valid number',

  // Providers
  PROVIDER_CLAUDE_UNAVAILABLE: 'Servicio de Claude temporalmente no disponible. Reintentando...',
  PROVIDER_OPENAI_UNAVAILABLE: 'Servicio de OpenAI temporalmente no disponible. Reintentando...',
  PROVIDER_NO_FALLBACK: 'No hay proveedor alternativo disponible',
  PROVIDER_ALL_FAILED: 'Los servicios de IA están momentáneamente no disponibles. Por favor, intenta de nuevo en unos minutos.',

  // Validation
  VALIDATION_EMPTY_MESSAGE: 'El mensaje no puede estar vacío',
  VALIDATION_MESSAGE_TOO_LONG: 'El mensaje es demasiado largo (máx 5000 caracteres)',
  VALIDATION_INVALID_SESSION: 'Sesión no válida o expirada',
  VALIDATION_INVALID_ETAPA: 'Etapa de coaching no válida (debe ser 1-7)',

  // Database
  DB_CONNECTION_FAILED: 'Error al conectar con la base de datos',
  DB_QUERY_FAILED: 'Error al consultar la base de datos',

  // Crisis
  CRISIS_DETECTED: 'Hemos detectado un situación que requiere atención profesional. Por favor, contacta a un especialista.',
  CRISIS_RESOURCES_HEADER: 'Recursos disponibles:',

  // Generic
  INTERNAL_ERROR: 'Ocurrió un error inesperado. Nuestro equipo ha sido notificado.',
  SERVICE_UNAVAILABLE: 'El servicio no está disponible en este momento. Por favor, intenta de nuevo más tarde.',
  NOT_FOUND: 'El recurso que buscas no existe.',
  UNAUTHORIZED: 'No tienes permiso para acceder a este recurso.',

  // Success
  SESSION_STARTED: 'Sesión iniciada. ¡Bienvenido!',
  MESSAGE_SENT: 'Mensaje enviado',
  COMMITMENT_SAVED: 'Compromiso guardado exitosamente',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(key: ErrorMessageKey): string {
  return ERROR_MESSAGES[key];
}

/**
 * Crisis protocols / resources
 */
export const CRISIS_PROTOCOLS = {
  crítico: `He percibido que necesitas apoyo inmediato que va más allá del coaching.

**Por favor contacta a profesionales de salud mental:**

🆘 **Líneas de Crisis (Países Hispanohablantes):**
- 🇦🇷 Argentina: 135 (Teléfono de la Esperanza) / 130 (SAME)
- 🇪🇸 España: 024 (Teléfono de la Esperanza)
- 🇲🇽 México: 5255 4161 9270 (Instituto Nacional de Psiquiatría)
- 🇨🇱 Chile: 1 800 013 616 (Teléfono de la Esperanza)
- 🇨🇴 Colombia: 01 8000 933 097 (Línea PAS)

Mi rol como agente de coaching termina aquí. Cuando recibas el apoyo que necesitas, podremos volver.`,

  severo: `Percibo signos de depresión, autolesión o agotamiento emocional severo.

Te recomiendo conectar con un **psicólogo clínico** o **psiquiatra** ANTES de continuar.

¿Necesitas ayuda para encontrar referencias locales?`,
} as const;
```

---

## ✅ VERIFICACIÓN

Después de crear estos archivos:

```bash
# 1. TypeScript compilation
npm run build

# 2. ESLint check
npm run lint

# 3. Type checking
npx tsc --noEmit

# 4. Si todo pasa:
git add src/types src/constants
git commit -m "feat: add type definitions and coaching constants"
```

---

## 📋 ARCHIVOS CREADOS EN PASO 3A

```
src/types/
├── providers.ts          ✅ ILLMProvider interface + supporting types
├── coaching.ts           ✅ Domain types (Usuario, Sesion, Compromiso, etc)
├── errors.ts             ✅ Custom error classes
└── index.ts              ✅ Export all types

src/constants/
├── coaching-criteria.ts  ✅ GROW etapas (1-7) + criterios + intenciones
├── system-prompts.ts     ✅ AI system prompts (coach, classifier, etc)
├── error-messages.ts     ✅ User-friendly error messages + crisis protocols
└── index.ts              ✅ Export all constants
```

---

## 🎯 PRÓXIMO PASO

**PASO 3B:** Errors + Utils (logger, validator, hash)

---

*PASO 3A completado. Types + Constants listos para usar en providers.*
