# 🔍 CODE REVIEW: PSEUDOCÓDIGO ARQUITECTURA
## Análisis y Ajustes para Implementación Real

**Fecha:** Nov 5, 2026  
**Status:** ✅ APPROVED con sugerencias de ajuste  
**Reviewer:** Claude Code

---

## ✅ FORTALEZAS

### 1. Interfaz Limpia
- ✅ `ILLMProvider` bien definida (6 métodos core)
- ✅ Tipos consistentes (Message, ChatResponse, etc)
- ✅ Fácil agregar nuevos providers

### 2. Separación de Responsabilidades
- ✅ `ClaudeProvider`: solo Claude logic
- ✅ `OpenAIProvider`: solo OpenAI logic
- ✅ `ProviderRouter`: solo selección
- ✅ `CrisisDetector`: solo crisis logic
- ✅ `CostTracker`: solo cost tracking
- ✅ `FallbackHandler`: solo fallback logic

### 3. Error Handling
- ✅ Fallback chain (Claude → OpenAI)
- ✅ Retry logic con exponential backoff
- ✅ Proper error types (ProviderError)

### 4. Extensibilidad
- ✅ Templates para DeepSeek/Ollama
- ✅ No bloquea arquitectura actual
- ✅ Solo 3 líneas para agregar provider

---

## ⚠️ GAPS IDENTIFICADOS

### 1. MISSING: Environment Variables Loading

**Problema:** APIs keys hardcoded en ejemplos

```javascript
// ❌ CURRENT (pseudocódigo)
constructor(apiKey: string, model: 'haiku' | 'sonnet') {
  this.client = new Anthropic({ apiKey });
}

// ✅ SHOULD BE
constructor() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');
  this.client = new Anthropic({ apiKey });
}
```

**Impact:** Security, secrets management  
**Fix:** Add `.env` loading section

---

### 2. MISSING: Rate Limiting

**Problema:** Sin throttling para evitar rate limit de APIs

**Current:** Solo timeout/retry

**Should be:**
```javascript
// Implement rate limiter
├─ Token bucket algorithm
├─ Respect API rate limits
├─ Queue requests if needed
└─ Backoff strategy
```

**Impact:** Production reliability  
**Fix:** Add rate limiter service (p5 priority)

---

### 3. MISSING: Logging Setup

**Problema:** `logger` usado pero no inicializado

```javascript
// ❌ Used but not shown
logger.error('Claude error: ...')
logger.info('Calling Claude')

// ✅ Should define
const logger = require('./logger');
// or
const logger = console;  // for MVP
```

**Impact:** Debugging, observability  
**Fix:** Add logger initialization

---

### 4. AMBIGUOUS: Cost Calculation on Streaming

**Problema:** En streaming, `tokenCount` no disponible desde API

```javascript
// ❌ CURRENT
async chatStream(...) {
  // ...
  // OpenAI no proporciona token count en streaming
  const estimatedTokens = Math.ceil(totalText.length / 4);
  
  return {
    tokensOutput: estimatedTokens,  // ESTIMATED, not real
    costUSD: this.estimateCost(estimatedTokens)
  };
}
```

**Impact:** Cost tracking inaccuracy (±20%)  
**Fix:** 
- Option A: Use post-streaming token counting
- Option B: Accept estimation for streaming

---

### 5. MISSING: System Prompt Management

**Problema:** System prompt hardcoded en cada método

```javascript
// ❌ CURRENT
async classify(...) {
  const systemPrompt = `Eres un evaluador de etapas...`;
  // ... duplicated in every method
}

// ✅ SHOULD BE
const SYSTEM_PROMPTS = {
  classify: `Eres un evaluador...`,
  extractJSON: `Eres un extractor...`,
  detectCrisis: `Eres un detector...`
};
```

**Impact:** Maintenance, consistency  
**Fix:** Extract to constants file

---

### 6. MISSING: Validation

**Problema:** Sin validación de inputs

```javascript
// ❌ CURRENT
async chat(messages: Message[], systemPrompt: string) {
  // Assumes input is valid
  return this.client.messages.create({
    messages: messages  // No validation
  });
}

// ✅ SHOULD ADD
async chat(messages: Message[], systemPrompt: string) {
  // Validate
  if (!messages || messages.length === 0) {
    throw new ValidationError('Messages required');
  }
  if (systemPrompt.length > 5000) {
    throw new ValidationError('System prompt too long');
  }
  
  return this.client.messages.create({ ... });
}
```

**Impact:** Security, error handling  
**Fix:** Add validation layer

---

### 7. INCOMPLETE: Classification Criteria

**Problema:** `CRITERIOS_ETAPA` y `ETAPAS` declarados pero no definidos

```javascript
// ❌ CURRENT (incomplete)
CRITERIOS_ETAPA = {
  1: "Usuario ha compartido cómo está hoy...",
  2: "Usuario ha identificado un objetivo..."
  // ... only 7 items
}

// ✅ Should be complete + versioned
const COACHING_CRITERIA_V1 = {
  1: { criterio: "...", minConfidence: 0.7 },
  2: { criterio: "...", minConfidence: 0.75 },
  // ... 7 items complete
};
```

**Impact:** State machine correctness  
**Fix:** Define all 7 etapas + confidence thresholds

---

### 8. MISSING: Database Connection

**Problema:** `db` objeto usado sin inicialización

```javascript
// ❌ CURRENT
await db.tokenUsage.create({...})
await db.sesiones.update(...)

// ✅ SHOULD BE
import { pool } from '../database';  // or ORM

class CostTracker {
  constructor(private db: Database) {}
  
  async recordUsage(usage) {
    await this.db.tokenUsage.insert(usage);
  }
}
```

**Impact:** Data persistence  
**Fix:** Add DB adapter pattern

---

### 9. MISSING: Type Definitions

**Problema:** Pseudocódigo TypeScript pero tipos incompletos

```javascript
// Missing detailed definitions for:
type ProviderOptions = ???
type SessionContext = ???
type SelectionContext = ???
type ChatResponse = ???
type UsageRecord = ???
```

**Impact:** IDE support, type safety  
**Fix:** Create `types/index.ts` with all definitions

---

### 10. INCOMPLETE: Error Classes

**Problema:** Usos `ProviderError`, `ExtractionError`, etc sin definir

```javascript
// ❌ Used but not shown
throw new ProviderError('claude', error);
throw new ExtractionError('openai', error);

// ✅ Should define
class ProviderError extends Error {
  constructor(public provider: string, error: Error) {
    super(`Provider error [${provider}]: ${error.message}`);
  }
}
```

**Impact:** Error handling consistency  
**Fix:** Create `errors/index.ts`

---

### 11. MISSING: Provider Configuration Flexibility

**Problema:** Constructor obliga AMBOS providers, falla si falta un API key

```javascript
// ❌ CURRENT (obliga ambos)
constructor(config: Config) {
  this.client = new Anthropic({ apiKey: config.anthropic_api_key });  // Crash si undefined
  this.client = new OpenAI({ apiKey: config.openai_api_key });        // Crash si undefined
}

// ✅ SHOULD BE (flexible, 1+ mínimo)
constructor(config: Config) {
  if (config.anthropic_api_key) {
    this.claude = new ClaudeProvider(config.anthropic_api_key);
    this.availableProviders.push('claude');
  }
  
  if (config.openai_api_key) {
    this.openai = new OpenAIProvider(config.openai_api_key);
    this.availableProviders.push('openai');
  }
  
  if (this.availableProviders.length === 0) {
    throw new ConfigError('At least one LLM provider required');
  }
}
```

**Escenarios soportados:**
- ✅ Solo OpenAI (sin fallback, 99% uptime)
- ✅ Solo Claude (sin fallback, 99% uptime)
- ✅ Ambos (con fallback, 99.9% uptime) ← RECOMENDADO

**Impact:** User flexibility, production readiness  
**Fix:** 
1. Make providers optional in constructor
2. Validate at least 1 available
3. Adapt selectProvider() based on available
4. Log warnings if no redundancy
5. Handle error scenarios per configuration

**Prioridad:** P1 (CRÍTICO - UX + flexibility)

---

## 🔄 AJUSTES SUGERIDOS

### Priority 1 (CRÍTICO - MVP)

- [ ] Add `.env` loading
- [ ] Define ETAPAS + CRITERIOS completo
- [ ] Create type definitions file
- [ ] Add input validation
- [ ] Setup logger
- [ ] Setup database connection

### Priority 2 (IMPORTANTE - Phase 1)

- [ ] Add rate limiter service
- [ ] Extract system prompts to constants
- [ ] Create error classes
- [ ] Setup cost tracking correctly
- [ ] Handle streaming token counting

### Priority 3 (NICE-TO-HAVE - Phase 2)

- [ ] Add metrics/observability
- [ ] Add retry strategy configuration
- [ ] Add provider health checks
- [ ] Add caching layer
- [ ] Add performance profiling

---

## 📋 CHECKLIST IMPLEMENTACIÓN

### Antes de escribir TypeScript:

- [ ] **Config management**
  ```
  .env (local)
  .env.example (git)
  config.ts (validates + loads)
  ```

- [ ] **Types**
  ```
  types/providers.ts
  types/coaching.ts
  types/errors.ts
  ```

- [ ] **Constants**
  ```
  constants/coaches-criteria.ts
  constants/system-prompts.ts
  constants/error-messages.ts
  ```

- [ ] **Errors**
  ```
  errors/ProviderError.ts
  errors/ValidationError.ts
  errors/ConfigError.ts
  ```

- [ ] **Utils**
  ```
  utils/logger.ts
  utils/validator.ts
  utils/hash.ts (for crisis anonymity)
  ```

---

## 🎯 RECOMENDACIONES FINALES

### 1. Estructura de Carpetas (Sugerida)

```
backend/
├── src/
│   ├── config/
│   │   ├── index.ts
│   │   └── .env.example
│   ├── types/
│   │   ├── providers.ts
│   │   ├── coaching.ts
│   │   └── errors.ts
│   ├── errors/
│   │   ├── ProviderError.ts
│   │   ├── ValidationError.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── coaching-criteria.ts
│   │   ├── system-prompts.ts
│   │   └── error-messages.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validator.ts
│   │   └── hash.ts
│   ├── services/
│   │   ├── providers/
│   │   │   ├── ILLMProvider.ts
│   │   │   ├── implementations/
│   │   │   │   ├── ClaudeProvider.ts
│   │   │   │   ├── OpenAIProvider.ts
│   │   │   │   ├── DeepSeekProvider.ts [FUTURE]
│   │   │   │   └── OllamaProvider.ts [FUTURE]
│   │   │   └── providerRouter.ts
│   │   ├── coaching/
│   │   │   ├── coachingStateMachine.ts
│   │   │   ├── crisisDetector.ts
│   │   │   └── compromisoExtractor.ts
│   │   ├── cost/
│   │   │   ├── costTracker.ts
│   │   │   └── rateLimiter.ts
│   │   └── fallback/
│   │       └── fallbackHandler.ts
│   ├── database/
│   │   ├── models/
│   │   │   ├── Usuario.ts
│   │   │   ├── Sesion.ts
│   │   │   ├── Interaccion.ts
│   │   │   └── ...
│   │   └── migrations/
│   │       └── 001_initial_schema.sql
│   ├── routes/
│   │   ├── chat.ts
│   │   ├── sessions.ts
│   │   └── health.ts
│   ├── controllers/
│   │   └── chatController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── requestValidator.ts
│   └── app.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── package.json
└── tsconfig.json
```

### 2. Datos Iniciales Necesarios

```javascript
// Crear constante con todos los CRITERIOS_ETAPA
const COACHING_ETAPAS = {
  1: {
    nombre: 'CONECTAR',
    criterio: 'Usuario ha compartido cómo está con emoción/contexto',
    minConfidence: 0.7
  },
  2: {
    nombre: 'OBJETIVO',
    criterio: 'Usuario identificó objetivo claro con tema y resultado',
    minConfidence: 0.75
  },
  // ... 7 total
};
```

### 3. Sistema Prompts Base

```javascript
const SYSTEM_PROMPTS = {
  coach: `Eres un coach profesional certificado ICF...`,
  classifier: `Eres un evaluador de etapas GROW...`,
  crisis_detector: `Eres especialista en detección de crisis...`,
  json_extractor: `Eres extractor de JSON perfecto...`
};
```

---

## ✅ VEREDICTO

**Status:** ✅ **APPROVED FOR IMPLEMENTATION**

**Pseudocódigo:** Muy bueno, structure está limpia

**Gaps:** 10 identificados, todos resolvibles

**Próximo paso:** Crear estructura carpetas + archivos base (Sin lógica aún)

---

## 📌 NOTAS PARA IMPLEMENTACIÓN

```
❗ IMPORTANTE:
1. NO hardcodear secrets
2. Usar environment variables
3. Validar TODOS los inputs
4. Loguear decisiones de routing
5. Trackear TODOS los tokens
6. Testear fallback chain
7. Simular rate limits
```

---

*Review completado. Listo para Paso 2: Setup Repo.*
