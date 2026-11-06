# 🎯 PROPUESTA V3 — Agente Coach: Arquitectura Completa y Definitiva

> **Integración de 3 rondas de análisis:** V1 propuesta inicial → V2 correcciones críticas → V3 refinamientos técnicos + model o open-source

---

## 📌 RESUMEN EJECUTIVO

**Proyecto:** Plataforma multiplataforma de coaching conversacional con seguimiento de metas, donde usuarios iniciando en sesión 1 obtienen un seguimiento longitudinal basado en 10 archivos .md metodológicamente rigurosos.

**Diferencial:** Motor de coaching IA + máquina de estados determinística + RAG vectorial + guardrails de crisis + memoria a largo plazo = coaching humano sin replicar sesgo humano.

**Público:** Cualquier persona que quiera clarity en metas, cambio de comportamiento, desarrollo profesional o personal.

**Modelo:** Open-Core (GitHub community-driven) + SaaS comercial opcional.

---

## 🏗️ ARQUITECTURA TÉCNICA CORREGIDA (V3)

### **Layer 1: Backend Determinístico + IA**

```
┌─────────────────────────────────────────────────────────────────┐
│                       NODE.JS / EXPRESS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 1. MÁQUINA DE ESTADOS (coaching_state_machine.js)     │   │
│  │    - Etapa 1-7 del ciclo GROW                         │   │
│  │    - Criterios de avance con confianza (0-1)         │   │
│  │    - NO deja todo a IA; backend controla flujo       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 2. FILTRO PRE-GROW (estado_detector.js)              │   │
│  │    - Detecta: emoción, bloqueo, coachability, crisis │   │
│  │    - Si crisis → PARAR y derivar                      │   │
│  │    - Si bloqueado → activar protocolo de bloqueos    │   │
│  │    - Si disposición baja → confrontar sutilmente     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 3. RAG VECTORIAL LIGERO (rag_engine.js)              │   │
│  │    - ChromaDB (SQLite) o pgvector (PostgreSQL)        │   │
│  │    - Indexa fragmentos de 9 archivos .md             │   │
│  │    - Búsqueda semántica, no palabras clave           │   │
│  │    - Extrae SOLO relevante por mensaje del usuario   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 4. GESTOR DE MEMORIA (memoria_agente.js)            │   │
│  │    - Rastreo de creencias limitantes                  │   │
│  │    - Patrones recurrentes del usuario                │   │
│  │    - Historial de sesiones resumido                  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 5. EXTRACTOR DE COMPROMISOS (extractor_compromisos.js)  │   │
│  │    - Post-sesión: IA devuelve JSON estructurado      │   │
│  │    - {compromiso, fecha, indicador, obstáculos}      │   │
│  │    - Auto-guarda en BD                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 6. GUARDRAILS DE CRISIS (crisis_handler.js)          │   │
│  │    - Detector de palabras clave de riesgo             │   │
│  │    - Si detecta: registra (anónimo) y NO guarda sesión│   │
│  │    - Devuelve protocolo de derivación + líneas ayuda │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────┐
│         LLAMADA A CLAUDE API (o compatible)                    │
│         - System Prompt = Archivo 01 + fragmentos RAG          │
│         - Messages = Historial sesión actual                   │
│         - Response = Respuesta adaptada + validación de etapa  │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Layer 2: Base de Datos Relacional (PostgreSQL + pgvector)**

```sql
-- Tabla: usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  nombre VARCHAR,
  idioma VARCHAR DEFAULT 'es',
  edad_rango VARCHAR,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Tabla: sesiones
CREATE TABLE sesiones (
  id UUID PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  fecha_inicio TIMESTAMP DEFAULT NOW(),
  fecha_fin TIMESTAMP,
  tema VARCHAR, -- ej: "carrera", "familia", "educación"
  objetivo TEXT,
  etapa_actual INT DEFAULT 1, -- 1-7
  estado VARCHAR DEFAULT 'activa', -- activa, completada, pausada
  archivo_raíz VARCHAR -- archivo .md usado (ej: "09_guías_C")
);

-- Tabla: interacciones
CREATE TABLE interacciones (
  id UUID PRIMARY KEY,
  sesion_id UUID NOT NULL REFERENCES sesiones(id),
  rol VARCHAR NOT NULL, -- 'usuario' o 'coach'
  mensaje TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  etapa INT,
  intención VARCHAR, -- 'conectar', 'aclarar', 'desafiar', etc
  fuente_pregunta VARCHAR -- referencia al archivo .md
);

-- Tabla: compromisos
CREATE TABLE compromisos (
  id UUID PRIMARY KEY,
  sesion_id UUID NOT NULL REFERENCES sesiones(id),
  enunciado TEXT NOT NULL,
  fecha_límite DATE,
  fecha_creación TIMESTAMP DEFAULT NOW(),
  indicador_éxito TEXT,
  pasos_concretos JSONB, -- ["paso 1", "paso 2"]
  obstáculos_previstos JSONB,
  recursos_necesarios JSONB,
  estado VARCHAR DEFAULT 'activo', -- activo, completado, pendiente
  evaluación_final TEXT
);

-- Tabla: metas_usuario
CREATE TABLE metas_usuario (
  id UUID PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  descripción TEXT,
  fecha_creación TIMESTAMP DEFAULT NOW(),
  fecha_meta DATE,
  progreso INT DEFAULT 0, -- 0-100
  área VARCHAR, -- carrera, familia, educación, salud
  hitos JSONB, -- referencias a compromisos completados
  estado VARCHAR DEFAULT 'activa'
);

-- Tabla: creencias_limitantes
CREATE TABLE creencias_limitantes (
  id UUID PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  creencia TEXT,
  sesion_origen UUID REFERENCES sesiones(id),
  fecha TIMESTAMP DEFAULT NOW(),
  contexto TEXT,
  desafiada BOOLEAN DEFAULT FALSE,
  fecha_desafío TIMESTAMP
);

-- Tabla: eventos_crisis (anónimos)
CREATE TABLE eventos_crisis (
  id UUID PRIMARY KEY,
  usuario_anónimo VARCHAR, -- hash del usuario, no id real
  fecha TIMESTAMP DEFAULT NOW(),
  tipo VARCHAR, -- suicidio, autolesión, trauma, burnout
  nivel VARCHAR, -- crítico, severo
  derivado_a VARCHAR, -- línea de ayuda
  registrado BOOLEAN DEFAULT TRUE
);

-- Extensión pgvector para embeddings de RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla: fragmentos_rag
CREATE TABLE fragmentos_rag (
  id UUID PRIMARY KEY,
  archivo VARCHAR NOT NULL, -- ej: "09_guías_C"
  sección VARCHAR, -- ej: "3.1", "4.2"
  contenido TEXT,
  embedding vector(1536), -- Embeddings de OpenAI / Claude
  tema VARCHAR, -- carrera, familia, educación
  CONSTRAINT fragmentos_tema_idx USING GiST (embedding)
);
```

---

### **Layer 3: RAG Vectorial Ligero — Corrección V3**

**Problema V2:** Mapeo estático por palabras clave puede fallar con sinónimos.  
**Solución V3:** Embeddings semánticos locales.

```javascript
// backend/services/ragEngine.js

const { ChromaDB } = require("chromadb");
const { OpenAI } = require("openai"); // O Anthropic embeddings

class RAGEngine {
  constructor() {
    this.client = new ChromaDB();
    this.collection = null;
  }

  async indexarArchivos() {
    // Carga los 9 archivos .md una sola vez al inicio
    const archivos = [
      "01_marco_agente_coach.md",
      "02_banco_preguntas_mcpheat.md",
      // ... resto
    ];

    for (const archivo of archivos) {
      const contenido = fs.readFileSync(`./bases/${archivo}`, "utf8");
      const fragmentos = this.fragmentar(contenido, {
        tamaño: 500, // caracteres
        solapamiento: 100
      });

      for (const fragment of fragmentos) {
        const embedding = await this.generarEmbedding(fragment.texto);
        await this.client.add({
          ids: [fragment.id],
          documents: [fragment.texto],
          embeddings: [embedding],
          metadatas: [{
            archivo: archivo,
            sección: fragment.sección,
            tema: this.detectarTema(fragment.texto)
          }]
        });
      }
    }
  }

  async buscarFragmentosRelevantes(usuarioMsg, tema) {
    // Búsqueda semántica: ¿qué fragmentos son similares a esto?
    const embedding = await this.generarEmbedding(usuarioMsg);
    
    const resultados = await this.client.query({
      query_embeddings: [embedding],
      n_results: 5, // Top 5 fragmentos
      where: { tema: { $eq: tema } } // Filtrar por tema si aplica
    });

    // Deduplica y ordena por relevancia
    return resultados.map(r => ({
      texto: r.document,
      relevancia: r.distance,
      archivo: r.metadata.archivo,
      sección: r.metadata.sección
    }));
  }

  async generarEmbedding(texto) {
    // Opción 1: OpenAI (costo mínimo)
    // Opción 2: Anthropic (integrado si usas Claude)
    // Opción 3: Local (HuggingFace embeddings)
    
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // económico
      input: texto
    });
    return response.data[0].embedding;
  }

  fragmentar(contenido, opciones) {
    // Simple: divide por párrafos y tamaño
    const párrafos = contenido.split("\n\n");
    const fragmentos = [];

    párrafos.forEach((párrafo, idx) => {
      if (párrafo.length > opciones.tamaño) {
        // Subdividir si es muy largo
        const subfrags = párrafo.match(
          new RegExp(`.{1,${opciones.tamaño}}`, "g")
        );
        subfrags.forEach((subfrag, subidx) => {
          fragmentos.push({
            id: `frag_${idx}_${subidx}`,
            texto: subfrag,
            sección: this.extraerSección(párrafo)
          });
        });
      } else {
        fragmentos.push({
          id: `frag_${idx}`,
          texto: párrafo,
          sección: this.extraerSección(párrafo)
        });
      }
    });

    return fragmentos;
  }

  detectarTema(texto) {
    // Detectar automáticamente si habla de carrera, familia, etc
    const keywords = {
      carrera: ["trabajo", "empleo", "carrera", "profesión", "ascenso"],
      familia: ["familia", "pareja", "relaciones", "hijos"],
      educación: ["estudio", "aprender", "universidad", "examen"],
      // ...
    };

    for (const [tema, palabras] of Object.entries(keywords)) {
      if (palabras.some(p => texto.toLowerCase().includes(p))) {
        return tema;
      }
    }
    return "general";
  }
}

module.exports = new RAGEngine();
```

---

### **Layer 4: Máquina de Estados con Confianza (Corrección V3)**

**Problema V2:** Criterios simples falsos positivos ("tiene más de 20 caracteres").  
**Solución V3:** Clasificador de confianza con mini-modelo.

```javascript
// backend/services/coachingStateMachine.js

class CoachingStateMachine {
  async evaluarAvanceDeEtapa(sesionId, respuestaUsuario) {
    const sesión = await db.sesiones.findById(sesionId);
    const etapaActual = sesión.etapa_actual;

    // ANTES: simple regex
    // const criterio = respuestaUsuario.length > 20;

    // AHORA: llamada a modelo clasificador
    const clasificación = await this.clasificarCriterioEtapa(
      etapaActual,
      respuestaUsuario,
      sesión
    );

    // ⚠️ Solo avanza si confianza > 0.7
    if (clasificación.confianza > 0.7) {
      sesión.etapa_actual = etapaActual + 1;
      await db.sesiones.update(sesionId, {
        etapa_actual: sesión.etapa_actual
      });
      return { avanzó: true, etapa_siguiente: sesión.etapa_actual };
    } else {
      // Si no cumple, ajusta la pregunta para profundizar
      return {
        avanzó: false,
        razón: clasificación.razón,
        intervención: `Cuéntame más sobre ${clasificación.tema_pendiente}`
      };
    }
  }

  async clasificarCriterioEtapa(etapa, respuesta, sesión) {
    // Llamada económica a Claude / GPT para evaluar
    const prompt = `
    El usuario está en Etapa ${etapa} del ciclo de coaching.
    Etapa ${etapa} = "${this.ETAPAS[etapa]}"
    
    Criterio de éxito para avanzar:
    ${this.CRITERIOS_ETAPA[etapa]}
    
    Respuesta del usuario:
    "${respuesta}"
    
    Devuelve JSON:
    {
      "cumple_criterio": true/false,
      "confianza": 0.0-1.0,
      "razón": "explicación breve",
      "tema_pendiente": "qué falta explorar"
    }
    `;

    const response = await claude.messages.create({
      model: "claude-3-5-haiku", // Muy económico y rápido
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  ETAPAS = {
    1: "CONECTAR",
    2: "OBJETIVO",
    3: "REALIDAD",
    4: "AMPLIAR",
    5: "OPCIONES",
    6: "COMPROMETER",
    7: "CIERRE"
  };

  CRITERIOS_ETAPA = {
    1: "Usuario ha compartido cómo está hoy con alguna emoción o contexto",
    2: "Usuario ha identificado un objetivo claro con tema y resultado deseado",
    3: "Usuario describe su situación actual, qué ha intentado, qué funciona",
    4: "Usuario expresa una nueva comprensión, perspectiva o energía",
    5: "Usuario ha generado al menos 2 opciones distintas",
    6: "Usuario enuncia un compromiso concreto con fecha y acción observable",
    7: "Usuario resume con sus palabras qué se lleva de la sesión"
  };
}
```

---

### **Layer 5: Guardrails de Crisis Mejorado (V3)**

**Corrección:** Proteger privacidad del usuario en crisis.

```javascript
// backend/services/crisisHandler.js

const KEYWORDS_CRISIS = [
  {
    patrón: /suicid|matarme|morirme|ya no quiero|fin a todo|cortar mis venas/,
    nivel: "crítico",
    traducción: "ideación suicida"
  },
  {
    patrón: /no hay esperanza|todo es inútil|vacío|nada importa|soy una carga/,
    nivel: "severo",
    traducción: "depresión clínica"
  },
  // ... más patrones
];

async function chequearCrisis(mensaje, usuarioId) {
  for (const keyword of KEYWORDS_CRISIS) {
    if (keyword.patrón.test(mensaje)) {
      // LOGGING ANÓNIMO (GDPR compliant)
      await db.eventos_crisis.create({
        usuario_anónimo: hash(usuarioId), // No guardas el ID real
        fecha: new Date(),
        tipo: keyword.traducción,
        nivel: keyword.nivel,
        derivado_a: "línea de ayuda",
        registrado: true
      });

      // ⚠️ NO guardes esta sesión en el historial del usuario
      // para no triggerear recuerdos traumáticos
      const sesión = await db.sesiones.findById(usuarioId);
      sesión.estado = "bloqueada"; // No aparece en dashboard
      await db.sesiones.update(sesión.id, { estado: "bloqueada" });

      return {
        detectado: true,
        nivel: keyword.nivel,
        mensaje: PROTOCOLO_DERIVACION[keyword.nivel]
      };
    }
  }
  return { detectado: false };
}

const PROTOCOLO_DERIVACION = {
  crítico: `
He percibido que necesitas apoyo inmediato que va más allá del coaching.

**Por favor contacta a profesionales de salud mental:**
🆘 Línea de Crisis (Países Hispanohablantes):
- Argentina: 135 (Teléfono de la Esperanza) / 130 (SAME)
- España: 024 (Teléfono de la Esperanza)
- México: 5255 4161 9270 (Instituto Nacional de Psiquiatría)
- Chile: 1 800 013 616 (Teléfono de la Esperanza)
- Colombia: 01 8000 933 097 (Línea PAS)

Mi rol como agente de coaching termina aquí. Cuando recibas el apoyo que necesitas, podremos volver.`,

  severo: `
Percibo signos de depresión o agotamiento emocional severo.

Te recomiendo conectar con un **psicólogo clínico** o **psiquiatra** ANTES de continuar.
¿Te ayudo a buscar referencias locales?`
};
```

---

### **Layer 6: Extractor de Compromisos (V3 — Mejorado)**

```javascript
// backend/services/extractorCompromisos.js

async function extraerYGuardarCompromiso(sesionId, respuestaUsuario) {
  const sistemático = `
  Eres un extractor de compromisos de coaching profesional.
  
  Extrae del siguiente texto el compromiso que la persona se propone.
  Debes devolver SOLO JSON válido, sin texto adicional.
  
  Devuelve:
  {
    "compromiso": "descripción clara y específica de la acción (no vaga)",
    "fecha_límite": "YYYY-MM-DD",
    "indicador_éxito": "¿cómo sabrás que lo lograste? Observable, no vago",
    "pasos_concretos": ["paso 1", "paso 2", "paso 3"],
    "obstáculos_previstos": ["obstáculo interno o externo"],
    "recursos_necesarios": ["recursos para lograrlo"],
    "nivel_dificultad": "fácil | medio | difícil",
    "reflexión_cierre": "aprendizaje clave de esta sesión"
  }
  
  Respuesta del usuario: "${respuestaUsuario}"
  `;

  const respuesta = await claude.messages.create({
    model: "claude-3-5-sonnet", // Más robusto para extracción compleja
    max_tokens: 500,
    messages: [{ role: "user", content: respuestaUsuario }]
  });

  const compromiso = JSON.parse(respuesta.content[0].text);

  // Guardar en BD
  const inserción = await db.compromisos.create({
    sesion_id: sesionId,
    enunciado: compromiso.compromiso,
    fecha_límite: compromiso.fecha_límite,
    indicador_éxito: compromiso.indicador_éxito,
    pasos_concretos: compromiso.pasos_concretos,
    obstáculos_previstos: compromiso.obstáculos_previstos,
    recursos_necesarios: compromiso.recursos_necesarios,
    estado: "activo",
    fecha_creación: new Date()
  });

  // Actualizar progreso de meta general
  const usuario = await db.usuarios.findById(
    await db.sesiones.findById(sesionId).usuario_id
  );
  await actualizarProgresoMeta(usuario.id, compromiso.nivel_dificultad);

  return inserción;
}
```

---

## 🌐 MODELO OPEN-CORE + SaaS (V3)

### **Repositorio GitHub — Estructura**

```
agente-coach/
├── docker-compose.yml          # Levanta todo en 1 cmd
├── README.md                   # Docs claras
├── .env.example                # Variables template
├── INSTALL.md                  # Pasos instalación
│
├── backend/
│  ├── src/
│  │  ├── services/
│  │  │  ├── coachingStateMachine.js
│  │  │  ├── ragEngine.js
│  │  │  ├── estadoDetector.js
│  │  │  ├── crisisHandler.js
│  │  │  ├── memoriaAgente.js
│  │  │  └── extractorCompromisos.js
│  │  ├── routes/
│  │  │  ├── sesiones.js
│  │  │  ├── usuarios.js
│  │  │  └── metas.js
│  │  └── middleware/
│  │     └── autenticación.js
│  ├── migrations/              # Schema PostgreSQL
│  └── Dockerfile
│
├── frontend/
│  ├── src/
│  │  ├── pages/
│  │  │  ├── Chat.jsx
│  │  │  ├── Dashboard.jsx
│  │  │  └── Metas.jsx
│  │  ├── components/
│  │  │  ├── ChatMessage.jsx
│  │  │  ├── CompromisoCard.jsx
│  │  │  └── ProgresoBarra.jsx
│  │  └── hooks/
│  │     └── useCoachingSession.js
│  ├── Dockerfile
│  └── .env.example
│
├── bases/                       # Archivos .md (versionados)
│  ├── 01_marco_agente_coach.md
│  ├── 02_banco_preguntas_mcpheat.md
│  └── ... (9 archivos totales)
│
├── docs/
│  ├── ARQUITECTURA.md
│  ├── MODELO_GROW.md
│  ├── GUARDRAILS_CRISIS.md
│  └── DEPLOY.md
│
└── tests/
   ├── unit/
   ├── integration/
   └── e2e/
```

### **Instalación en 3 pasos (Usuario self-hosted)**

```bash
# Paso 1: Clonar
git clone https://github.com/tu-org/agente-coach.git
cd agente-coach

# Paso 2: Variables de entorno (BYOK = Bring Your Own Key)
cp .env.example .env
# Editar .env con:
# - CLAUDE_API_KEY=sk_...   (o OPENAI_API_KEY)
# - DATABASE_URL=postgresql://...
# - JWT_SECRET=tu_secreto

# Paso 3: Levanta todo
docker compose up -d
# ✅ App disponible en http://localhost:3000
```

---

## 💰 MODELO COMERCIAL: Open-Core vs SaaS

```
┌───────────────────────────────────────┬──────────────────────────────────────┐
│  🟢 VERSIÓN OPEN-CORE (GitHub)       │  🔵 VERSIÓN SAAS (Comercial)        │
├───────────────────────────────────────┼──────────────────────────────────────┤
│ Modelo: Community self-hosted          │ Modelo: Suscripción
│                                        │
│ ✅ Código 100% público                │ ✅ Hospedaje manejado (sin DevOps)
│ ✅ Usuario pone su API Key (costo↓)  │ ✅ Almacenamiento seguro
│ ✅ BD local o cloud personal          │ ✅ Análisis + reportes
│ ✅ Ideal para devs, startups, self    │ ✅ Apps nativas (iOS/Android)
│   -hosted                             │ ✅ Soporte 24/7
│ ✅ Premium: templates, integraciones  │ ✅ Sincronización cross-device
│                                        │
│ Costo: $0                             │ Costo: $9.99/mes o $99/año
│ (Usuario paga consumo API)            │                                      │
└───────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 🚀 FASES DE IMPLEMENTACIÓN (4 meses)

### **Fase 1: MVP Backend + Web Básica (Mes 1-2)**
- [ ] DB schema + migrations
- [ ] Backend services (RAG + máquina de estados + guardrails)
- [ ] Chat web simple (React)
- [ ] Login/registro básico
- [ ] CI/CD GitHub Actions

### **Fase 2: Completar Funcionalidades (Mes 2-3)**
- [ ] Dashboard de metas
- [ ] Seguimiento de compromisos
- [ ] Visualización de progreso
- [ ] Exportar reflexiones
- [ ] Sistema de alertas

### **Fase 3: Multiplataforma (Mes 3-4)**
- [ ] Empaquetar Electron para Windows
- [ ] React Native para Android
- [ ] Sincronización de datos

### **Fase 4: Publicación Open-Source**
- [ ] Documentación exhaustiva
- [ ] Docker Compose simplificado
- [ ] Template .env
- [ ] Licencia (MIT o Apache 2.0)
- [ ] Publicar en GitHub

---

## 📊 INFRAESTRUCTURA RECOMENDADA

### **Self-Hosted (Usuario en su propia máquina/VPS)**

```
┌─ VPS 2vCPU / 4GB RAM (Hetzner €6/mes o DigitalOcean $24/mes)
│
├─ Docker Container: Backend Node.js (1 vCPU)
├─ Docker Container: PostgreSQL (1 vCPU)
├─ Docker Container: Frontend Nginx (static)
│
└─ Soporta: ~1,000 MAU | ~50-100 usuarios concurrentes
```

### **Versión SaaS (Tu infraestructura)**

```
AWS ECS / Kubernetes (auto-scaling)
├─ Backend × N replicas
├─ PostgreSQL RDS (managed)
├─ Redis (caché)
├─ S3 (backups)
└─ CloudFront (CDN)

Soporta: ~100,000 MAU | multi-tenant
```

---

## ✅ CHECKLIST PARA COMENZAR DESARROLLO

- [ ] **Semana 1:** Setupear repo GitHub + estructura folders + Docker Compose
- [ ] **Semana 2:** Implementar Máquina de Estados + Mock de IA
- [ ] **Semana 3:** RAG vectorial + indexación archivos .md
- [ ] **Semana 4:** Backend API (sesiones, mensajes, compromisos)
- [ ] **Semana 5:** Frontend chat básico + React
- [ ] **Semana 6:** Dashboard + visualización de metas
- [ ] **Semana 7:** Guardrails + manejo de crisis
- [ ] **Semana 8:** Pruebas + documentación + publicación inicial

---

## 🎯 DIFERENCIAL VS COMPETIDORES

| Aspecto | Agente Coach | ChatGPT | Coach Humano |
|--------|-------------|---------|-------------|
| **Costo** | $0-9.99/mes | $0-20/mes | $100-300/sesión |
| **Disponibilidad** | 24/7 | 24/7 | Horario comercial |
| **Seguimiento** | ✅ Automático | ❌ No | ✅ Sí (caro) |
| **Base metodológica** | ✅ ICF riguroso | ❌ Genérico | ✅ Varía por coach |
| **Sin sesgos humanos** | ✅ | ✅ | ❌ |
| **Escalable** | ✅ | ✅ | ❌ |
| **Guardrails crisis** | ✅ | ❌ | ✅ |
| **Memoria LP** | ✅ | ❌ | ✅ |

---

**¿Por dónde empiezas? ¿Quieres que diseñe el schema de BD en detalle o el system prompt base para la IA?**
