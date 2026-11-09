# 📋 Guía de Versionamiento - GrowAgentAI

## Versión Actual: 2.0.0

Este documento define cómo manejar versiones de forma consistente mientras el proyecto está en desarrollo activo.

---

## 📌 Sistema de Versionamiento Semántico (SemVer)

```
MAJOR.MINOR.PATCH
  2  .  0  .  0
  │     │     └─ Patch: Correcciones de bugs (2.0.1, 2.0.2...)
  │     └─ Minor: Nuevas funcionalidades (2.1.0, 2.2.0...)
  └─ Major: Cambios que rompen compatibilidad (3.0.0)
```

### Reglas:
- **MAJOR** (X.0.0): Cambios que NO son hacia atrás compatibles
  - Cambios en formato de API
  - Migraciones de BD obligatorias
  - Cambios en schema de datos

- **MINOR** (2.X.0): Nuevas funcionalidades, hacia atrás compatible
  - Nuevos endpoints
  - Nuevas features
  - Deprecaciones (pero funciona la versión anterior)

- **PATCH** (2.0.X): Correcciones de bugs solamente
  - Fix de bugs
  - Mejoras de rendimiento
  - Actualizaciones de dependencias menores

---

## 🔄 Archivos que Controlan Versión

### 1. **package.json** (Backend)
```json
{
  "name": "growagentai-backend",
  "version": "2.0.0"
}
```

### 2. **VERSION.json** (Central)
```json
{
  "version": "2.0.0",
  "lastUpdated": "2026-11-09",
  "releaseStage": "stable",
  "apiVersion": "v1",
  "compatibility": {
    "nodeVersion": ">=18.0.0",
    "postgresVersion": ">=13.0",
    "dockerVersion": ">=20.10"
  },
  "breakingChanges": []
}
```

### 3. **CHANGELOG.md** (Histórico)
- Documenta TODOS los cambios
- Agrupa por versión
- Marca breaking changes
- Incluye links a commits

---

## 🚀 Proceso de Actualizar Versión

### Para PATCH (2.0.X → 2.0.1):
```bash
# 1. Hacer el fix de bug
# 2. Actualizar archivos de versión
npm version patch
# Esto actualiza package.json automáticamente

# 3. Actualizar VERSION.json
# {
#   "version": "2.0.1",
#   "lastUpdated": "2026-11-09"
# }

# 4. Agregar entrada en CHANGELOG.md
# ## [2.0.1] - 2026-11-09
# ### Fixed
# - Descripción del bug fijado

# 5. Commit y tag
git add -A
git commit -m "fix: descripción del bug arreglado"
git tag -a v2.0.1 -m "Release version 2.0.1"

# 6. Push
git push origin main
git push origin v2.0.1
```

### Para MINOR (2.0.0 → 2.1.0):
```bash
# 1. Completar feature nueva
# 2. Actualizar versiones
npm version minor

# 3. Actualizar VERSION.json
# {
#   "version": "2.1.0",
#   "lastUpdated": "2026-11-10"
# }

# 4. Actualizar CHANGELOG.md
# ## [2.1.0] - 2026-11-10
# ### Added
# - Nueva funcionalidad X
# - Nueva funcionalidad Y

# 5. Commit y tag
git add -A
git commit -m "feat: agregar nuevas funcionalidades"
git tag -a v2.1.0 -m "Release version 2.1.0 - New Features"

# 6. Push
git push origin main
git push origin v2.1.0
```

### Para MAJOR (2.0.0 → 3.0.0):
```bash
# ⚠️ IMPORTANTE: Requiere documentación extra

# 1. Documentar breaking changes
# 2. Crear guía de migración
# 3. Actualizar APIs
# 4. Actualizar versiones
npm version major

# 5. Actualizar VERSION.json
# {
#   "version": "3.0.0",
#   "lastUpdated": "2026-11-10",
#   "breakingChanges": [
#     "API endpoint X movida de /old → /new",
#     "Base de datos requiere migración desde v2"
#   ]
# }

# 6. Actualizar CHANGELOG.md CON GUÍA DE MIGRACIÓN
# ## [3.0.0] - 2026-11-10 - MAJOR VERSION
# ### ⚠️ BREAKING CHANGES
# - Cambio 1
# - Cambio 2
# 
# ### Migration Guide
# Ver MIGRATION_GUIDE_3.0.0.md

# 7. Commit y tag
git add -A
git commit -m "feat!: major version bump with breaking changes"
git tag -a v3.0.0 -m "Release version 3.0.0 - Breaking Changes"

# 8. Push y notificar users
git push origin main
git push origin v3.0.0
```

---

## 📝 Formato de Commits (Conventional Commits)

```
<type>: <description>

[optional body]

[optional footer]
```

### Tipos válidos:
- `feat:` → Nueva característica (bumps MINOR)
- `fix:` → Corrección de bug (bumps PATCH)
- `docs:` → Cambios en documentación
- `style:` → Cambios de formato (no hay lógica)
- `refactor:` → Reorganización de código
- `perf:` → Mejoras de rendimiento
- `test:` → Agregar/actualizar tests
- `chore:` → Mantenimiento, dependencias
- `ci:` → Cambios en CI/CD

### Ejemplos:
```
feat: agregar endpoint de goals tracking
fix: corregir crash en chat controller
docs: actualizar README con pasos de instalación
chore: actualizar dependencias de npm
```

### Para breaking changes:
```
feat!: cambio que rompe compatibilidad
# El "!" indica breaking change
```

---

## ✅ Checklist Pre-Release

Antes de hacer un release:

- [ ] Todos los tests pasan: `npm test`
- [ ] Linting sin errores: `npm run lint`
- [ ] TypeScript sin errores: `npm run typecheck`
- [ ] Build exitoso: `npm run build`
- [ ] Dockerfile testeado en VM
- [ ] Backend responde en healthcheck
- [ ] CHANGELOG.md actualizado
- [ ] VERSION.json actualizado
- [ ] Sin cambios uncommitted: `git status`
- [ ] Remote up-to-date: `git pull origin main`

---

## 🔗 Git Workflow Recomendado

### Flujo Feature Branch:

```bash
# 1. Crear rama para nueva feature
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios
# ... editar archivos ...

# 3. Commit regularmente con commits significativos
git add archivos.ts
git commit -m "feat: parte 1 de nueva funcionalidad"
git add otros.ts
git commit -m "feat: parte 2 de nueva funcionalidad"

# 4. Push a rama
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request en GitHub
# [Describe cambios en PR]

# 6. Una vez aprobado, merge a main
git checkout main
git pull origin main
git merge feature/nueva-funcionalidad

# 7. Delete rama local y remota
git branch -d feature/nueva-funcionalidad
git push origin --delete feature/nueva-funcionalidad

# 8. Actualizar versión y hacer release
npm version minor
# ... actualizar CHANGELOG y VERSION.json ...
git add -A
git commit -m "chore: bump to v2.1.0"
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin main
git push origin v2.1.0
```

---

## 📊 Historial de Versiones

| Versión | Fecha | Estado | Cambios |
|---------|-------|--------|---------|
| 2.0.0 | 2026-11-09 | ✅ Current | Backend v2 con multi-provider |
| 2.1.0 | TBD | ⏳ Planificado | Frontend improvements |
| 2.2.0 | TBD | ⏳ Planificado | Mobile app beta |
| 3.0.0 | TBD | ⏳ Planificado | Team features |

---

## 🆘 Troubleshooting

### "Cometí en rama equivocada"
```bash
# Si aún no hiciste push:
git reset --soft HEAD~1
git checkout -b rama-correcta
git commit -m "mensaje"
```

### "Necesito revertir un release"
```bash
# Si ya hiciste push:
git revert <commit-hash>
git tag -d v2.0.1
git push origin main
git push origin --delete v2.0.1
```

### "Sincronizar versión entre archivos"
```bash
# Leer VERSION.json y actualizar package.json
node -e "console.log(require('./VERSION.json').version)" 
# Copiar versión y actualizar package.json
```

---

## 🔐 Protecciones Recomendadas en GitHub

Para el branch `main`:

1. **Requiere pull request reviews**: Al menos 1 reviewer
2. **Requiere pasar checks**: CI/CD debe estar verde
3. **Dismiss stale PR approvals**: Si hay cambios nuevos
4. **Require status checks to pass**: Lint, test, build
5. **Require branches up to date**: Antes de merge

---

## 📚 Referencias

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)

---

**Última actualización:** 2026-11-09  
**Versión de esta guía:** 1.0
