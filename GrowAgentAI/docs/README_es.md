# GrowAgentAI 🌱

[![GitHub License](https://img.shields.io/github/license/hvilleg-dev/GrowAgentAI?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/hvilleg-dev/GrowAgentAI?style=social)](https://github.com/hvilleg-dev/GrowAgentAI)
[![GitHub Forks](https://img.shields.io/github/forks/hvilleg-dev/GrowAgentAI?style=social)](https://github.com/hvilleg-dev/GrowAgentAI)
[![Discord Community](https://img.shields.io/badge/chat-discord-7289da?style=flat-square)](https://discord.gg/growagentai)

**Una plataforma de coaching conversacional con IA que implementa la metodología GROW de 7 etapas para el seguimiento de objetivos.**

[English](../README.md) | **Español**

- 🎯 Metodología ICF (International Coach Federation)
- 🌍 Bilingüe: Español + Inglés
- 📱 Multiplataforma: Web, Windows, Mac, iOS, Android
- 🔒 Cumple GDPR + CCPA
- 🤖 Impulsado por Claude IA
- 🎨 UX diseñada para claridad y engagement

## 🚀 Inicio Rápido

### Requisitos Previos
- Docker & Docker Compose (recomendado)
- O: Node.js 18+, PostgreSQL 14+
- Clave API de Anthropic (Claude)

### Con Docker (Recomendado)

```bash
# Clonar repositorio
git clone https://github.com/hvilleg-dev/GrowAgentAI.git
cd GrowAgentAI

# Configurar entorno
cp .env.example .env

# Editar .env con tus claves API y credenciales de BD
# nano .env   (Linux/Mac)
# notepad .env (Windows)

# Iniciar servicios
docker compose up -d

# Esperar 30 segundos para inicializar la BD
sleep 30

# Acceder a la aplicación
# Web: http://localhost:3000
# API: http://localhost:3001
```

### Instalación Manual

Ver [Guía de Instalación](01_INSTALLATION.md) para instrucciones paso a paso sin Docker.

## 📚 Documentación

| Documento | Propósito |
|-----------|-----------|
| [**Inicio Rápido (60 segundos)**](02_QUICK_START.md) | Ejecutar en menos de un minuto |
| [**Instalación Completa**](01_INSTALLATION.md) | Configuración detallada para todas las plataformas |
| [**Arquitectura**](03_ARCHITECTURE.md) | Diseño del sistema & componentes |
| [**Referencia API**](04_API_REFERENCE.md) | Endpoints backend & webhooks |
| [**Guía Frontend**](05_FRONTEND.md) | Componentes UI & sistema de diseño |
| [**Esquema de BD**](06_DATABASE.md) | Modelos Prisma & relaciones |
| [**Guía de Testing**](07_TESTING.md) | Tests unitarios, integración & E2E |
| [**Deployment**](08_DEPLOYMENT.md) | Desplegar en AWS, Azure, GCP, VPS |
| [**Seguridad**](09_SECURITY.md) | Mejores prácticas de seguridad |
| [**Cumplimiento**](10_COMPLIANCE.md) | GDPR, CCPA, privacidad de datos |
| [**FAQ**](11_FAQ.md) | Preguntas frecuentes |
| [**Troubleshooting**](12_TROUBLESHOOTING.md) | Problemas comunes & soluciones |
| [**Roadmap**](13_ROADMAP.md) | Características futuras & visión |

## ✨ Características

### Motor de Coaching Central
- ✅ Coaching conversacional con IA de Claude
- ✅ Metodología GROW de 7 etapas con indicadores visuales
- ✅ Establecimiento de metas & seguimiento de compromisos
- ✅ Dashboard de progreso con analíticas
- ✅ Historial de sesiones & notas
- ✅ Soporte multiidioma (ES/EN)

### Base de Conocimiento
- 📚 **20 marcos de coaching integrales** (Español + Inglés)
- 🎯 Modelo C.O.A.C.H. (Ortiz & Webb)
- ❓ 400+ preguntas de coaching (McPheat)
- 🏆 Mejores prácticas ICF (Brooks & Vogt)
- 👔 Preguntas de liderazgo (Posner)
- 🧠 Prompts de pensamiento crítico (Elder & Paul)
- 👨‍👩‍👧‍👦 Guías de coaching para jóvenes & familia
- 💼 Casos de estudio del mundo real

### Características de la Plataforma
- 🌐 Aplicación web (React 18)
- 💻 Aplicaciones desktop (Windows, Mac vía Electron)
- 📱 Aplicaciones móviles (iOS, Android vía React Native)
- 🔐 Soporte de cifrado end-to-end
- 🌍 Multiidioma (Español, Inglés)
- ♿ Accesibilidad WCAG 2.1 AA
- 🎨 Modo oscuro & modo claro

## 🏗️ Stack Tecnológico

### Backend
- **Runtime:** Node.js 18+ con TypeScript
- **Framework:** Express.js
- **ORM:** Prisma (agnóstico de BD)
- **Bases de Datos:** PostgreSQL, Oracle, MySQL
- **IA:** API Anthropic Claude, Embeddings OpenAI
- **Autenticación:** JWT + OAuth 2.0
- **Cache:** Redis
- **Cola:** Bull

### Frontend
- **Web:** React 18 + Vite + TailwindCSS
- **Desktop:** Electron (basado en Chromium)
- **Mobile:** React Native + Expo
- **Componentes UI:** Headless UI + Radix UI
- **Estado:** Redux + Redux Thunk
- **Cliente API:** React Query + Axios

### Infraestructura
- **Contenedorización:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoreo:** Sentry + DataDog
- **CDN:** CloudFront (opcional)
- **Deployment:** Docker, listo para Kubernetes

## 📂 Estructura del Proyecto

```
GrowAgentAI/
├── README.md                       # Archivo principal
├── QUICKSTART.md                   # Guía de inicio rápido 60 segundos
├── ARCHITECTURE.md                 # Arquitectura del sistema
├── LICENSE                         # Licencia GNU AGPLv3
├── CLA.md                          # Acuerdo de Licencia de Contribuidor
├── CONTRIBUTING.md                 # Guía de contribución
├── CODE_OF_CONDUCT.md              # Normas de la comunidad
├── SECURITY.md                     # Reporte de seguridad
├── CHANGELOG.md                    # Historial de versiones
│
├── .github/
│  ├── workflows/
│  │  ├── ci.yml                   # Tests, lint, build
│  │  ├── security-scan.yml        # SAST, npm audit
│  │  └── docs.yml                 # Build de documentación
│  ├── ISSUE_TEMPLATE/
│  │  ├── bug_report.md
│  │  ├── feature_request.md
│  │  └── security_report.md
│  └── PULL_REQUEST_TEMPLATE.md
│
├── docs/                          # Documentación completa
│  ├── 00_START_HERE.md
│  ├── 01_INSTALLATION.md
│  ├── 02_QUICK_START.md
│  ├── 03_ARCHITECTURE.md
│  ├── 04_API_REFERENCE.md
│  ├── 05_FRONTEND.md
│  ├── 06_DATABASE.md
│  ├── 07_TESTING.md
│  ├── 08_DEPLOYMENT.md
│  ├── 09_SECURITY.md
│  ├── 10_COMPLIANCE.md
│  ├── 11_FAQ.md
│  ├── 12_TROUBLESHOOTING.md
│  ├── 13_ROADMAP.md
│  └── README_es.md                # Este archivo
│
├── legal/
│  ├── TERMS_OF_SERVICE.md
│  ├── PRIVACY_POLICY.md
│  ├── COOKIES_POLICY.md
│  └── COMPLIANCE.md
│
├── base_conocimientos/            # Base de conocimiento de coaching
│  ├── es/                         # Marcos en español (10 archivos)
│  └── en/                         # Marcos en inglés (10 archivos)
│
├── backend/
│  ├── SPECIFICATIONS.md           # Blueprint del backend
│  ├── src/
│  │  ├── config/
│  │  ├── controllers/
│  │  ├── routes/
│  │  ├── services/
│  │  ├── middleware/
│  │  ├── utils/
│  │  └── server.ts
│  ├── prisma/
│  │  ├── schema.prisma.spec      # Especificación del esquema de BD
│  │  └── migrations/
│  ├── tests/
│  ├── docker-compose.yml.template
│  └── package.json.template
│
├── frontend/
│  ├── SPECIFICATIONS.md           # Blueprint del frontend
│  ├── DESIGN_SYSTEM.md
│  ├── web/
│  │  ├── src/
│  │  ├── components/
│  │  ├── pages/
│  │  └── package.json.template
│  ├── desktop/
│  │  └── electron-app/ (con package.json)
│  └── mobile/
│      └── react-native-app/
│
├── docker-compose.yml             # Desarrollo local
├── .env.example                   # Plantilla de entorno
├── .gitignore
├── .dockerignore
└── ROADMAP.md                     # Visión a largo plazo
```

## 🎓 Base de Conocimiento

GrowAgentAI incluye una **base de conocimiento de coaching de 20 archivos** que cubre:

### Español (10 archivos)
- Marco de Agente Coach
- Banco de Preguntas (McPheat)
- Modelo C.O.A.C.H. (Ortiz & Webb)
- Preguntas ICF
- Preguntas de Liderazgo
- Preguntas Esenciales
- Y más...

### Inglés (10 archivos)
- Coaching Agent Framework
- Question Bank (McPheat)
- C.O.A.C.H. Model (Ortiz & Webb)
- ICF Questions
- Leadership Questions
- Essential Questions
- And more...

**Acceder a Base de Conocimiento:** [`base_conocimientos/`](../base_conocimientos/)

## 🤝 Contribuir

¡Bienvenemos contribuciones! Ver [CONTRIBUTING.md](../CONTRIBUTING.md) para:
- Cómo reportar bugs
- Cómo sugerir características
- Configuración de desarrollo
- Estándares de código
- Proceso de PR

### Flujo Rápido de Contribución
```bash
# 1. Fork & clonar
git clone https://github.com/hvilleg-dev/GrowAgentAI.git
cd GrowAgentAI

# 2. Crear rama de característica
git checkout -b feature/tu-caracteristica

# 3. Hacer cambios, testear, commit
npm run test
npm run lint
git add .
git commit -m "feat(scope): descripción"

# 4. Push & crear PR
git push origin feature/tu-caracteristica

# 5. ¡Espera review y merge!
```

## 🔐 Seguridad

**NO reportes vulnerabilidades de seguridad en issues públicos.**

Ver [SECURITY.md](../SECURITY.md) para:
- Proceso de divulgación responsable
- Cómo reportar vulnerabilidades
- Guías de seguridad
- Mejores prácticas

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia GNU Affero General Public License v3** - ver archivo [LICENSE](../LICENSE) para detalles.

**Estás libre de:**
- Usar comercialmente
- Modificar el código
- Distribuir copias
- Usar privadamente

**Debes:**
- Incluir la licencia & aviso de copyright
- Divulgar el código fuente

## 🙋 Soporte & Comunidad

- **¿Preguntas?** Ver [FAQ](11_FAQ.md)
- **¿Problemas?** Revisar [Troubleshooting](12_TROUBLESHOOTING.md)
- **Discusiones:** [GitHub Discussions](https://github.com/hvilleg-dev/GrowAgentAI/discussions)
- **Discord:** [Unirse a Comunidad](https://discord.gg/growagentai)
- **Email:** support@growagentai.com (marcador)

## 🛣️ Roadmap

Ver [ROADMAP.md](13_ROADMAP.md) para:
- Características Q1 2026
- Visión Q2-Q4 2026
- Oportunidades de contribución
- Votación de la comunidad

## 📊 Estadísticas

- **20+ marcos de coaching** en 2 idiomas
- **400+ preguntas de coaching** curadas
- **Metodología GROW de 7 etapas** con seguimiento visual
- **3 objetivos de plataforma** (Web, Desktop, Mobile)
- **GDPR + CCPA listos**

## 👥 Créditos

Construido con ❤️ por la comunidad de coaching para el crecimiento personal & profesional.

### Marcos & Metodologías
- ICF (International Coach Federation)
- Ortiz & Webb (Modelo C.O.A.C.H.)
- Sean McPheat (400 Preguntas)
- James Posner (Liderazgo)
- Richard Paul & Linda Elder (Pensamiento Crítico)

## ⭐ Apoyo

Si encuentras GrowAgentAI útil, por favor:
- ⭐ Dale estrella a este repositorio
- 📢 Comparte con otros
- 💬 Únete a nuestra comunidad Discord
- 🐛 Reporta bugs
- 🎯 Sugiere características

## 📝 Changelog

Ver [CHANGELOG.md](../CHANGELOG.md) para historial de versiones y actualizaciones.

---

**Hecho con ❤️ para coaching y crecimiento personal** | [Licencia](../LICENSE) | [Seguridad](../SECURITY.md) | [Contribuir](../CONTRIBUTING.md)
