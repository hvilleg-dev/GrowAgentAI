# 🎯 Mejores Prácticas de Desarrollo - GrowAgentAI

Conjunto de convenciones y prácticas para evitar problemas durante el desarrollo activo.

---

## 🔒 Manejo de Dependencias

### ✅ DO's:

```bash
# 1. Usar package-lock.json (commitear siempre)
npm ci  # Instalar reproduciblemente
git add package-lock.json

# 2. Actualizar dependencias de forma segura
npm outdated  # Ver qué está desactualizado
npm audit     # Ver vulnerabilidades

# 3. Para actualizaciones mayores:
npm update --save
# Luego testear todo

# 4. Versiones específicas en package.json:
"react": "^18.2.0"    # Permite patch updates (18.2.x)
"typescript": "~5.0.0" # Permite minor updates (5.0.x)
"express": "4.18.2"    # Versión exacta para críticos
```

### ❌ DON'Ts:

```bash
# NO: Instalar sin guardar
npm install lodash  # Sin --save

# NO: Usar * como versión
"react": "*"  # NUNCA!

# NO: Forzar instalación con --force
npm install --force

# NO: Eliminar package-lock.json
rm package-lock.json  # Esto rompe reproducibilidad
```

---

## 🌿 Ramas y Colaboración

### Estructura de Ramas:

```
main
├── production              (releases estables)
├── staging                 (pre-production testing)
├── develop                 (rama de integración)
└── feature/
    ├── feature/user-auth
    ├── feature/chat-improvements
    └── feature/rag-embeddings
```

### Flujo de Trabajo:

```bash
# 1. Crear rama FROM develop (no main)
git checkout develop
git pull origin develop
git checkout -b feature/nueva-cosa

# 2. Hacer cambios locales
npm run lint      # Validar código
npm test          # Correr tests
npm run build     # Verificar build

# 3. Commit pequeños y significativos
git add src/controllers/ChatController.ts
git commit -m "feat: agregar validación de crisis"

# 4. Push a rama de feature
git push origin feature/nueva-cosa

# 5. Abrir Pull Request (describe cambios)

# 6. Una vez aprobado y merged a develop:
git checkout develop
git pull origin develop
# TESTING en develop

# 7. Eventual merge a main para release
git checkout main
git merge develop
npm version minor
git tag -a vX.Y.Z
```

---

## 🧪 Testing y Calidad

### Pre-Commit Validation:

```bash
# Correr esto ANTES de hacer commit:
npm run lint
npm run typecheck
npm test

# O crear un pre-commit hook
touch .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Contenido de pre-commit hook:

```bash
#!/bin/bash
set -e

echo "🔍 Running pre-commit checks..."

# Lint
npm run lint || {
  echo "❌ Lint failed"
  exit 1
}

# Type check
npm run typecheck || {
  echo "❌ Type check failed"
  exit 1
}

# Tests (fast tests only)
npm run test -- --testPathPattern="(unit|fast)" || {
  echo "❌ Tests failed"
  exit 1
}

echo "✅ All checks passed!"
exit 0
```

---

## 🐳 Docker en Desarrollo

### Build Local:

```bash
# Cambiar a directorio raíz del proyecto
cd /path/to/GrowAgentAI

# Build imagen con tag
docker build -f backend/Dockerfile -t growagentai-backend:dev .

# Correr contenedor local
docker run -d \
  --name growagentai-dev \
  -p 3001:3000 \
  --env-file .env.local \
  growagentai-backend:dev

# Ver logs
docker logs -f growagentai-dev

# Health check
curl http://localhost:3001/health

# Cleanup
docker stop growagentai-dev
docker rm growagentai-dev
```

### .env.local (para desarrollo local):

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/growagentai_dev
NODE_ENV=development
LOG_LEVEL=debug
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
```

---

## 🔐 Secretos y Configuración

### ✅ Correctamente Manejado:

```bash
# 1. Variables en .env (gitignored)
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...

# 2. En Docker:
docker run --env-file .env ...

# 3. En GitHub Actions (secrets):
- name: Deploy
  env:
    API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### ❌ NUNCA:

```bash
# NO: Hardcoded secrets
const apiKey = "sk-1234567890"

# NO: Commitear .env
git add .env  # NUNCA!

# NO: Secrets en logs
console.log(`Using key: ${process.env.API_KEY}`)

# NO: Secrets en error messages
throw new Error(`Failed with key: ${apiKey}`)
```

---

## 📋 Checklist para Pull Requests

Antes de crear un PR:

- [ ] Rama actualizada con `main`/`develop`
- [ ] Linting sin errores: `npm run lint`
- [ ] TypeScript: `npm run typecheck`
- [ ] Tests pasan: `npm test`
- [ ] Build successful: `npm run build`
- [ ] No hay conflictos merge
- [ ] CHANGELOG actualizado (si aplica)
- [ ] Sin console.log() o debug code
- [ ] Sin secrets o credenciales
- [ ] Commits bien nombrados (conventional commits)

### Descripción de PR:

```markdown
## Description
Brief description of changes

## Type of change
- [x] Bug fix
- [ ] New feature
- [ ] Breaking change

## Testing
How to test the changes?

## Screenshots (si aplica)
![image](...)

## Checklist
- [x] Code reviewed
- [x] Tests passing
- [x] No breaking changes documented
```

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: "node_modules bloqueado"
```bash
# Windows: Archivo en uso por otro proceso
# Solución:
lsof | grep node  # Encuentra procesos node
kill -9 <pid>     # Mata el proceso
rm -rf node_modules
npm ci
```

### Problema 2: "Port 3001 ya en uso"
```bash
# Encuentra qué usa el puerto
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Mata el proceso
kill -9 <pid>  # Mac/Linux
taskkill /PID <pid> /F  # Windows
```

### Problema 3: "Cambios accidentales antes de commit"
```bash
# Ver qué cambió
git diff

# Descartar cambios (destructivo)
git checkout -- archivo.ts

# O stash para recuperar después
git stash
git stash pop
```

### Problema 4: "Hiciste commit en rama equivocada"
```bash
# Antes de push:
git reflog
git cherry-pick <commit-hash>
git reset --hard HEAD~1  # En rama equivocada

# Después de push: contacta al equipo
```

### Problema 5: "Conflicto de merge"
```bash
# Resolver manualmente en editor
git status  # Ver archivos con conflicto

# Resolver conflict markers (<<<, ===, >>>)

git add conflicted-file.ts
git commit -m "fix: resolve merge conflict"
```

---

## 🔔 Notificaciones y Alertas

### Si algo falla en CI/CD:

```
❌ Lint failed
   → Correr: npm run lint:fix
   → Revisar archivo específico
   → Git add y commit

❌ Tests failed
   → Correr: npm test -- --watch
   → Debuggear fallo
   → Actualizar test o código

❌ Build failed
   → Correr: npm run build
   → Ver error específico
   → Arreglar y retry
```

---

## 📞 Escalation Path

Si algo complica:

1. **Local Issue** → Resolver localmente
2. **Git Confusion** → Consulta VERSIONING_GUIDE.md
3. **Database Issue** → Revisar migrations
4. **Docker Issue** → Revisar logs y Dockerfile
5. **Performance** → Profile con DevTools
6. **Security Issue** → NO hacer push, contactar equipo

---

## 🎓 Recursos de Referencia

- [Git Book](https://git-scm.com/book/en/v2)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Testing Best Practices](https://testingjavascript.com/)

---

## ✅ Resumen Rápido

| Acción | Comando |
|--------|---------|
| Antes de empezar | `git pull origin develop` |
| Nueva rama | `git checkout -b feature/x` |
| Actualizar deps | `npm update && npm audit fix` |
| Validar | `npm run lint && npm test` |
| Commit | `git commit -m "feat: descripción"` |
| Push | `git push origin feature/x` |
| PR | Abrir en GitHub |
| Merge | En GitHub (vía PR) |
| Release | `npm version minor` + tag |

---

**Última actualización:** 2026-11-09  
**Versión de esta guía:** 1.0
