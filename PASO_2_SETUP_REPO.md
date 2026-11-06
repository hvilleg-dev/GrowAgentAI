# 🏗️ PASO 2: SETUP REPOSITORIO
## Estructura base + archivos iniciales (sin lógica)

**Objetivo:** Crear estructura carpetas y archivos de configuración  
**Tiempo estimado:** 1-2 horas  
**Status:** Ready to execute

---

## 📋 CHECKLIST SETUP

- [ ] Inicializar monorepo structure
- [ ] Crear archivos de config (.env, tsconfig, package.json)
- [ ] Crear carpetas core
- [ ] Crear archivo README con estructura
- [ ] Crear archivos stubs (vacíos) para cada módulo
- [ ] Setup .gitignore
- [ ] Setup ESLint + Prettier config
- [ ] Test que estructura compila

---

## 1. ESTRUCTURA CARPETAS BASE

```
GrowAgentAI/
├── backend/                          # Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.ts             # Config loader
│   │   │   └── .env.example         # Template
│   │   ├── types/
│   │   │   ├── providers.ts         # LLM types
│   │   │   ├── coaching.ts          # Domain types
│   │   │   ├── errors.ts            # Error types
│   │   │   └── index.ts             # Export all
│   │   ├── errors/
│   │   │   ├── ProviderError.ts
│   │   │   ├── ValidationError.ts
│   │   │   ├── ConfigError.ts
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── coaching-criteria.ts # GROW etapas
│   │   │   ├── system-prompts.ts    # AI prompts
│   │   │   └── error-messages.ts
│   │   ├── utils/
│   │   │   ├── logger.ts            # Logging
│   │   │   ├── validator.ts         # Input validation
│   │   │   ├── hash.ts              # Anonymization
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── providers/
│   │   │   │   ├── ILLMProvider.ts  # Interface
│   │   │   │   ├── implementations/
│   │   │   │   │   ├── ClaudeProvider.ts
│   │   │   │   │   ├── OpenAIProvider.ts
│   │   │   │   │   ├── DeepSeekProvider.ts [FUTURE]
│   │   │   │   │   └── OllamaProvider.ts [FUTURE]
│   │   │   │   └── providerRouter.ts
│   │   │   ├── coaching/
│   │   │   │   ├── coachingStateMachine.ts
│   │   │   │   ├── crisisDetector.ts
│   │   │   │   └── compromisoExtractor.ts
│   │   │   ├── cost/
│   │   │   │   ├── costTracker.ts
│   │   │   │   └── rateLimiter.ts
│   │   │   └── fallback/
│   │   │       └── fallbackHandler.ts
│   │   ├── database/
│   │   │   ├── models/
│   │   │   │   ├── Usuario.ts
│   │   │   │   ├── Sesion.ts
│   │   │   │   ├── Interaccion.ts
│   │   │   │   ├── Compromiso.ts
│   │   │   │   ├── Meta.ts
│   │   │   │   ├── CreenciaLimitante.ts
│   │   │   │   ├── EventoCrisis.ts
│   │   │   │   └── TokenUsage.ts
│   │   │   ├── migrations/
│   │   │   │   └── 001_initial_schema.sql
│   │   │   └── db.ts                # Connection pool
│   │   ├── routes/
│   │   │   ├── chat.ts              # POST /api/coaching/chat
│   │   │   ├── sessions.ts          # GET /api/sessions
│   │   │   ├── stats.ts             # GET /api/stats (admin)
│   │   │   └── health.ts            # GET /health
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT validation
│   │   │   ├── errorHandler.ts      # Global error handling
│   │   │   ├── requestValidator.ts  # Input validation
│   │   │   └── corsHandler.ts       # CORS
│   │   ├── controllers/
│   │   │   ├── chatController.ts    # Chat endpoint logic
│   │   │   ├── sessionController.ts
│   │   │   └── statsController.ts
│   │   └── app.ts                   # Express app setup
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── providers/
│   │   │   │   ├── claude.test.ts
│   │   │   │   └── openai.test.ts
│   │   │   ├── services/
│   │   │   │   ├── crisis.test.ts
│   │   │   │   └── cost.test.ts
│   │   │   └── utils/
│   │   │       └── validator.test.ts
│   │   ├── integration/
│   │   │   └── provider-router.test.ts
│   │   └── e2e/
│   │       └── coaching-flow.test.ts
│   ├── .env.example                 # NO secrets
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── .eslintrc.json
│   ├── .prettierrc.json
│   └── dockerfile                   # Para deploy
│
├── frontend/                         # React app (separate)
│   └── [...]
│
├── docs/                            # Documentación
│   ├── SETUP.md                     # Este archivo
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── .gitignore
└── README.md
```

---

## 2. ARCHIVOS DE CONFIGURACIÓN

### 2.1 package.json

```json
{
  "name": "growagentai-backend",
  "version": "0.1.0",
  "description": "GrowAgentAI Coaching Platform Backend",
  "main": "dist/app.js",
  "scripts": {
    "dev": "ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "db:migrate": "node scripts/migrate.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "openai": "^4.52.0",
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "pgvector": "^0.2.0",
    "redis": "^4.6.0",
    "dotenv": "^16.4.0",
    "winston": "^3.11.0",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/jest": "^29.5.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/parser": "^6.13.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "prettier": "^3.1.0"
  }
}
```

### 2.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 2.3 .env.example

```bash
# ===== API KEYS (NEVER commit real values) =====
# At least ONE of these is required
ANTHROPIC_API_KEY=sk_ant_...      # Optional (if using Claude)
OPENAI_API_KEY=sk-...             # Optional (if using OpenAI)
# DEEPSEEK_API_KEY=sk_...         # Optional (future)

# ===== DATABASE =====
DATABASE_URL=postgresql://user:password@localhost:5432/growagentai
REDIS_URL=redis://localhost:6379

# ===== SERVER =====
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# ===== FEATURE FLAGS (Future) =====
DEEPSEEK_ENABLED=false
OLLAMA_ENABLED=false
CACHE_ENABLED=true

# ===== BUDGET =====
MONTHLY_BUDGET_USD=1000
ALERT_THRESHOLD_PERCENT=80

# ===== SECURITY =====
JWT_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key

# ===== CONFIGURATION NOTES =====
# Provider flexibility:
# - Option 1: ONLY OpenAI    (set OPENAI_API_KEY, leave ANTHROPIC_API_KEY empty)
# - Option 2: ONLY Claude    (set ANTHROPIC_API_KEY, leave OPENAI_API_KEY empty)
# - Option 3: BOTH (RECOMMENDED) - set both for fallback redundancy
# 
# At least ONE is required. If none: startup fails with clear error.
```

### 2.4 .eslintrc.json

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-types": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 2.5 .prettierrc.json

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

### 2.6 .gitignore

```bash
# ===== ENVIRONMENT =====
.env
.env.local
.env.*.local

# ===== NODE =====
node_modules/
dist/
build/

# ===== IDE =====
.vscode/
.idea/
*.swp
*.swo
*~

# ===== OS =====
.DS_Store
Thumbs.db

# ===== LOGS =====
*.log
logs/

# ===== TEMPORARY =====
*.tmp
.tmp/
temp/

# ===== TESTING =====
coverage/
.nyc_output/

# ===== DATABASE =====
*.sqlite
*.db

# ===== SECRETS (explicit) =====
secrets/
*.key
*.pem
```

---

## 3. ARCHIVOS STUB (Templates vacíos)

### 3.1 types/providers.ts

```typescript
// Stub - To be implemented in Step 3

export interface ILLMProvider {
  chat(
    messages: Message[],
    systemPrompt: string,
    options?: ProviderOptions
  ): Promise<ChatResponse>;
  // ... more methods
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  text: string;
  tokensInput: number;
  tokensOutput: number;
  model: string;
  latencyMs: number;
  costUSD: number;
}

// ... rest of types
```

### 3.2 constants/coaching-criteria.ts

```typescript
// Stub - Complete GROW etapas (from PROPUESTA_V3)

export const COACHING_ETAPAS = {
  1: {
    nombre: 'CONECTAR',
    descripcion: 'Establecer conexión y contexto',
    criterio: 'Usuario ha compartido cómo está con emoción/contexto',
    minConfidence: 0.70,
  },
  2: {
    nombre: 'OBJETIVO',
    descripcion: 'Definir objetivo claro',
    criterio: 'Usuario identificó objetivo con tema y resultado',
    minConfidence: 0.75,
  },
  // ... 3-7
} as const;

export const COACHING_CRITERIA_V1 = {
  // Same as above
} as const;
```

### 3.3 errors/ProviderError.ts

```typescript
// Stub - Custom error classes

export class ProviderError extends Error {
  constructor(
    public provider: string,
    public originalError: Error,
    public retriable: boolean = true
  ) {
    super(`Provider error [${provider}]: ${originalError.message}`);
    this.name = 'ProviderError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ... more error classes
```

### 3.4 utils/logger.ts

```typescript
// Stub - Logging setup

import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export default logger;
```

### 3.5 services/providers/ILLMProvider.ts

```typescript
// Interface - Same as types but here for clarity

export interface ILLMProvider {
  // Implementation in Step 3
}
```

### 3.6 services/providers/implementations/ClaudeProvider.ts

```typescript
// Stub - To be implemented in Step 3

import { ILLMProvider } from '../ILLMProvider';

export class ClaudeProvider implements ILLMProvider {
  async chat() {
    // Implementation here
  }
  // ... more methods
}
```

### 3.7 services/providers/providerRouter.ts

```typescript
// Stub - To be implemented in Step 3

export class ProviderRouter {
  async selectProvider() {
    // Implementation here
  }
  
  async chat() {
    // Implementation here
  }
}
```

### 3.8 app.ts (Main Express app)

```typescript
// Stub - Basic Express setup

import express from 'express';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(express.json());

// Routes (stubs)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/coaching/chat', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
```

---

## 4. COMANDOS SETUP (Paso a paso)

```bash
# 1. Crear estructura carpetas
mkdir -p backend/{src/{config,types,errors,constants,utils,services/{providers/implementations,coaching,cost,fallback},database/models,database/migrations,routes,middleware,controllers},tests/{unit,integration,e2e}}

# 2. Copiar archivos config
cp backend/.env.example backend/.env.example (ya existe)
touch backend/.eslintrc.json backend/.prettierrc.json

# 3. Crear archivos stub
touch backend/src/config/index.ts
touch backend/src/types/{providers,coaching,errors,index}.ts
touch backend/src/errors/{ProviderError,ValidationError,ConfigError}.ts
touch backend/src/constants/{coaching-criteria,system-prompts,error-messages}.ts
touch backend/src/utils/{logger,validator,hash,index}.ts
# ... (todos los stubs)

# 4. Install dependencies
cd backend
npm install

# 5. Test TypeScript compilation
npm run build

# 6. Verify structure
tree -L 3 src/
```

---

## 5. VERIFICACIÓN POST-SETUP

### Checklist:

- [ ] `npm install` succeeds
- [ ] `npm run build` compiles without errors
- [ ] `npm run lint` passes (or shows only warnings)
- [ ] `npm run format` formats code
- [ ] `.env.example` is in place
- [ ] All stub files exist
- [ ] `app.ts` starts without crashing
- [ ] `/health` endpoint works

### Test:

```bash
npm run dev
# Should see: Server running on port 3000

curl http://localhost:3000/health
# Should see: {"status":"ok"}
```

---

## 6. GIT COMMITS

```bash
# Commit 1: Initial structure + config
git add -A
git commit -m "chore: initial project setup with folder structure and config files"

# Commit 2: Stub files
git add backend/src/
git commit -m "chore: add TypeScript stubs for all modules (no implementation yet)"

# Commit 3: Ready for implementation
git add -A
git commit -m "chore: setup complete - ready for Step 3 (Implementation)"
```

---

## 📊 OUTCOME

After PASO 2:

✅ Project structure in place  
✅ All config files ready  
✅ TypeScript compiles  
✅ ESLint + Prettier configured  
✅ No business logic yet (all stubs)  
✅ Ready for PASO 3: Implementation

---

## 🚀 PRÓXIMO PASO

**PASO 3: IMPLEMENTACIÓN** - Convertir stubs a código real:
1. Implement types
2. Implement error classes
3. Implement utils
4. Implement providers
5. Implement router
6. Integrate everything

---

*PASO 2 completado. Ready to move forward.*
