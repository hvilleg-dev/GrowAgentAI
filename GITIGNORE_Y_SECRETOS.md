# 🔐 ARCHIVOS QUE NO DEBEN IR A COMMIT
## Security + Privacy Checklist

**Última actualización:** Nov 5, 2026  
**Criticidad:** MÁXIMA - Evitar exponer secretos/privacidad

---

## ⚠️ REGLA DE ORO

```
NUNCA commitear:
❌ Archivos con SECRETOS (.env con valores reales)
❌ Archivos con DATOS PRIVADOS (historiales usuarios)
❌ Archivos TEMPORALES (logs, temp files)
❌ CREDENCIALES (API keys, passwords, tokens)
❌ INFORMACIÓN SENSIBLE (crisis logs sin anonimizar)
```

---

## 📋 LISTA COMPLETA: NO COMMITEAR

### 1. ARCHIVOS DE CONFIGURACIÓN CON SECRETOS

```bash
# ❌ NUNCA commitear (pero SIEMPRE revisar antes de commit)
.env                          # Real environment variables
.env.local                     # Local overrides
.env.*.local                   # Environment-specific

# ✅ SÍ commitear (template sin valores)
.env.example                   # Template ONLY
```

**Checklist antes de `git add .env*`:**
```bash
# Verificar que NO tiene secretos reales:
grep -E "sk_|sk-|ANTHROPIC_|OPENAI_" .env

# Si tiene matches: STOP, no commitear
```

---

### 2. API KEYS Y CREDENCIALES

```bash
# ❌ Archivos que contengan:
ANTHROPIC_API_KEY=sk_ant_abc123def...
OPENAI_API_KEY=sk-proj-abc123...
DATABASE_PASSWORD=...
JWT_SECRET=...
ENCRYPTION_KEY=...

# ✅ Usar en lugar:
.env (local only, gitignored)
environment variables (en CI/CD)
secrets manager (en producción)
```

**Pre-commit hook sugerido:**
```bash
# .git/hooks/pre-commit
if grep -q "sk_\|sk-\|password\|secret" .env .env.*; then
  echo "❌ ERROR: Secrets found in .env files!"
  exit 1
fi
```

---

### 3. LOGS Y DATOS TEMPORALES

```bash
# ❌ NUNCA commitear
logs/                         # Application logs
*.log                         # Log files
error.log                     # Error logs
combined.log                  # Combined logs
.tmp/                         # Temporary files
temp/                         # Temp directory
*.tmp                         # Temp extensions
.cache/                       # Cache files
```

**Por qué:**
- Logs contienen potencialmente:
  - Stack traces con rutas internas
  - Mensajes de error con información sensible
  - Timestamps y patrones de uso

---

### 4. DATOS DE USUARIOS / CRISIS

```bash
# ❌ NUNCA commitear (datos de testing)
test_data/
usuario_*.json               # Simulated user data
sesion_*.json               # Simulated session data
crisis_logs.txt             # Crisis event logs

# ✅ SÍ commitear (fixtures anonymizados)
tests/fixtures/             # Anonymized test data (hash IDs)
```

**Por qué:** Potencialmente hay info real, incluso si "test"

---

### 5. BASE DE DATOS

```bash
# ❌ NUNCA commitear
*.sqlite
*.db
*.sqlite3
*.sqlite-wal
*.sqlite-shm

# ✅ SÍ commitear
migrations/001_initial_schema.sql  # Schema definition (no data)
```

---

### 6. NODE MODULES Y DEPENDENCIAS

```bash
# ❌ NUNCA commitear
node_modules/
package-lock.json (depende)
yarn.lock (depende)
pnpm-lock.yaml (depende)

# ✅ SÍ commitear
package.json                # Especifica dependencias
# package-lock.json puede commiterse si equipo requiere reproducibilidad exacta
```

---

### 7. BUILD OUTPUTS

```bash
# ❌ NUNCA commitear
dist/                       # Compiled JavaScript
build/                      # Build output
*.bundle.js                 # Bundled files
.tsc/                       # TypeScript output
```

**Por qué:**
- Generado de fuente
- Cría "noise" en diffs
- Produce conflictos merge

---

### 8. IDE Y EDITOR

```bash
# ❌ NUNCA commitear
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db
*.sublime-project
*.sublime-workspace
.vscode-settings.json
```

---

### 9. DOCKER

```bash
# ❌ DEPENDE
Dockerfile                  # ✅ SÍ commitear (template)
.dockerignore              # ✅ SÍ commitear

# ❌ NUNCA commitear
.docker/                   # Local docker config
docker-compose.override.yml # Local overrides
```

---

### 10. CI/CD SECRETOS

```bash
# ❌ NUNCA commitear en GitHub
.github/workflows/deploy.yml  # Si tiene secrets inline

# ✅ SÍ commitear
.github/workflows/deploy.yml  # Sin valores (usa ${{ secrets.* }})
```

**Buen ejemplo:**
```yaml
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}  # ✅ Reference
```

**Mal ejemplo:**
```yaml
env:
  ANTHROPIC_API_KEY: sk_ant_abc123  # ❌ NEVER
```

---

### 11. ESPECIALES: CRISIS DATA

```bash
# ⚠️ CUIDADO EXTREMO
logs/crisis_events.log      # Anónimo pero sensible
database/crisis_backups/    # Anonimizados pero delicados
```

**NEVER commitear sin anonimizar:**
- ❌ Usuario IDs reales
- ❌ Nombres/emails
- ❌ Números de teléfono
- ❌ Dates específicas (use relative)
- ❌ Ubicaciones

**OK anonimizar:**
```javascript
// ✅ OK
{
  usuarioHashAnonimo: "hash_8f3b2a",
  fecha: "2026-11-05",  // OK, sin timestamp preciso
  tipo: "ideacion_suicida",
  nivel: "critico"
}

// ❌ NEVER
{
  usuarioId: "user_12345",
  nombre: "Juan García",
  fecha: "2026-11-05 14:23:45",
  ubicacion: "Barcelona, Spain",
  email: "juan@example.com"
}
```

---

## ✅ LISTA: SÍ COMMITEAR

```bash
✅ Código fuente
   src/
   tests/

✅ Configuración de desarrollo (sin secretos)
   tsconfig.json
   .eslintrc.json
   .prettierrc.json
   jest.config.js

✅ Documentación
   README.md
   docs/
   
✅ Definiciones de dependencias
   package.json
   (package-lock.json - depende de proyecto)

✅ Definiciones de infraestructura
   Dockerfile
   docker-compose.yml (template, sin secretos)
   migrations/

✅ GitHub/CI config
   .github/workflows/
   .gitignore
   .gitattributes

✅ Fixtures anonymizados
   tests/fixtures/
```

---

## 🔍 VERIFICACIÓN PRE-COMMIT

### Script para ejecutar antes de `git push`

```bash
#!/bin/bash
# scripts/pre-commit-check.sh

echo "🔍 Checking for secrets..."

# Check for API keys
if git diff --cached --name-only -z | xargs -0 grep -l "sk_ant\|sk-proj\|ANTHROPIC_API_KEY\|OPENAI_API_KEY" 2>/dev/null; then
  echo "❌ ERROR: API keys found in staged files!"
  exit 1
fi

# Check for passwords
if git diff --cached --name-only -z | xargs -0 grep -l "password\|PASSWORD" 2>/dev/null; then
  echo "❌ ERROR: Passwords found in staged files!"
  exit 1
fi

# Check for .env files
if git diff --cached --name-only | grep -E "\.env$|\.env\.local"; then
  echo "❌ ERROR: .env files should not be committed!"
  exit 1
fi

echo "✅ Pre-commit checks passed"
exit 0
```

**Setup:**
```bash
chmod +x scripts/pre-commit-check.sh
cp scripts/pre-commit-check.sh .git/hooks/pre-commit
```

---

## 🚨 SI ACCIDENTALMENTE COMMITEAS SECRETO

### Acción inmediata:

```bash
# 1. STOP - No empujes a remoto
git push  # ❌ NO HAGAS ESTO

# 2. Revoca el secret (en Anthropic/OpenAI)
# - Regenera API key
# - Invalida la anterior

# 3. Remove del historio local
git reset HEAD~1  # Undo último commit

# 4. Modificar .env
rm .env
cp .env.example .env
# (editar con nuevos valores si es necesario)

# 5. Re-commit sin secreto
git add .gitignore
git commit -m "chore: fix accidental secret commit"

# 6. Si ya empujaste:
# Contacta admin de repo
# Rotate keys en producción
# Update secrets en GitHub
```

---

## 📋 PLANTILLA: .gitignore COMPLETO

```bash
# ===== ENVIRONMENT =====
.env
.env.local
.env.*.local
.env.*

# ===== SECRETS (explicit) =====
secrets/
*.key
*.pem
*.p12

# ===== NODE =====
node_modules/
dist/
build/
.tsc/

# ===== LOGS =====
*.log
logs/
error.log
combined.log
.nyc_output/

# ===== TEMPORAL =====
*.tmp
.tmp/
temp/
.cache/

# ===== DATABASE =====
*.sqlite
*.sqlite3
*.db
*.sqlite-wal
*.sqlite-shm

# ===== IDE =====
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# ===== TESTING =====
coverage/
.jest_cache/

# ===== DOCKER =====
.docker/

# ===== OS =====
.DS_Store
Thumbs.db

# ===== SENSITIVE DATA =====
crisis_logs/
user_data/
backups/
```

---

## 🎯 CHECKLIST PRE-PUSH

**Siempre revisar ANTES de `git push`:**

```bash
# 1. Ver qué va a commitear
git diff --cached --name-only

# 2. Search for secrets
git diff --cached | grep -E "sk_|password|secret|API_KEY"

# 3. Ver diferencias en archivos sensibles
git diff --cached -- ".env*" "package.json" "Dockerfile"

# 4. Run pre-commit hook
scripts/pre-commit-check.sh

# 5. Si todo OK:
git push

# 6. Después, verificar en GitHub
# - No aparecen secretos en commits
# - No aparecen logs
# - No aparecen datos de usuarios
```

---

## 🚨 INFRACCIONES COMUNES

### ❌ Infrpaso 1: .env en git

```bash
# Visto en:
.env (con ANTHROPIC_API_KEY=sk_ant_...)
.env.production

# Mitigación:
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "chore: remove .env from git"
```

### ❌ Infracción 2: API keys en código

```javascript
// ❌ NUNCA
const client = new Anthropic({
  apiKey: 'sk_ant_abc123'  // Hardcoded!
});

// ✅ SIEMPRE
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
```

### ❌ Infracción 3: Logs con info sensible

```bash
# ❌ NUNCA
logs/app.log  # Contiene stack traces + usuarios

# ✅ SIEMPRE
.gitignore:
logs/
*.log
```

### ❌ Infracción 4: node_modules

```bash
# ❌ NUNCA commitear
node_modules/

# ✅ SIEMPRE commitear solo
package.json
package-lock.json  # (opcional, para reproducibilidad)
```

---

## 📊 CONFIGURACIÓN RECOMENDADA

### En `.github/settings.json` (GitHub):

```json
{
  "push_restrictions": {
    "enforce_admins": false,
    "require_code_reviews": 1,
    "require_status_checks": true
  },
  "branch_protection": {
    "require_secret_scanning": true,
    "require_branch_up_to_date": true
  }
}
```

### GitHub Secret Scanning:

- ✅ Enable "Secret scanning alerts"
- ✅ Enable "Push protection"
- ✅ Review alerts regularly

---

## 🎯 RESUMEN

### NO COMMITEAR:
- API keys / credentials
- .env files (usar .env.example)
- Logs / temporal files
- node_modules / build outputs
- User/crisis data (sin anonimizar)
- IDE config
- Database files

### SÍ COMMITEAR:
- Código fuente
- Tests
- Config templates (.env.example)
- Documentación
- package.json
- Migration scripts
- GitHub workflows (sin secrets inline)

### ANTES DE PUSH:
```bash
git diff --cached | grep -E "sk_|password|secret"
# Debe retornar NADA
```

---

*Security es responsabilidad de todos. Revisar siempre antes de push.*
