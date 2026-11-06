# RAG Strategy: Fragmentación, Indexación y Recuperación Vectorial

**Versión:** 1.0 | **Idioma:** Español/Inglés | **Fecha:** 2026-11-01 | **Estado:** Diseño operativo

---

## 1. PROBLEMA A RESOLVER

Los 20 archivos .md (~2500 líneas totales) contienen metodología de coaching altamente interconectada:
- **Inyectar todo en cada prompt → context overflow** (llena tokens, pierde precisión).
- **Fragmentar arbitrariamente → semántica rota** (una pregunta potente cortada a mitad pierde significado).
- **Sin índice jerárquico → búsqueda lenta** (recuperación O(n)).

**Solución:** chunking semántico + indexación jerárquica + búsqueda por similitud vectorial.

---

## 2. ESTRATEGIA DE CHUNKING SEMÁNTICO

### 2.1 Criterios de fragmentación

| Criterio | Especificación | Razonamiento |
|---|---|---|
| **Unidad semántica** | No cortar preguntas, etapas o secciones completas | Una pregunta sin su contexto (ej: "¿Por qué?") es vacía |
| **Completitud** | Cada chunk es autónomo: tiene intro, contenido, aplicabilidad | Permite embeddings independientes sin pérdida de sentido |
| **Tamaño ideal** | 300-500 tokens (300-600 palabras promedio) | Optimal para embedding-3-small; < 8k context |
| **Overlap coherente** | 100 tokens de sobreposición entre chunks | Mantiene conexión semántica sin duplicación |
| **Marcadores** | Preservar encabezados (## §Etapa, ### Pregunta) | Facilita parsing y reconstrucción de estructura |

### 2.2 Ejemplos de chunking VÁLIDO vs INVÁLIDO

**✅ VÁLIDO — Etapa 1 Conectar (chunk completo):**
```
Sección: Etapa 1 — CONECTAR [COACH][McPheat]
- Meta: confianza y claridad sobre cómo llega la persona hoy; retomar compromisos previos si los hay.
- Hacer: saludo breve y humano; una pregunta abierta de estado ("¿cómo estás?", "¿qué tienes en mente?"). Si responde "bien/ok" sin emoción: "cuéntame más sobre ese 'ok'".
- Evitar: empezar de golpe con metas; formular una batería de preguntas; sonar como formulario.
- Avanzar cuando: la persona ha hablado con libertad y aparece un tema que le importa.
[Tokens: ~180 | Autónomo: SÍ | Embedding: coherente]
```

**❌ INVÁLIDO — Etapa 1 cortada:**
```
Chunk A: "Etapa 1 — CONECTAR [COACH][McPheat] - Meta: confianza y claridad..."
Chunk B: "...retomar compromisos previos si los hay. Hacer: saludo breve y humano; una pregunta..."
Chunk C: "...abierta de estado ("¿cómo estás?"). Si responde 'bien/ok'..."
[Tokens: ~60 cada uno | Autónomo: NO | Embedding: fragmentado, pierde significado]
```

### 2.3 Criterios para decidir si segmentar o no segmentar

| Elemento | Segmentar | No Segmentar | Razón |
|---|---|---|---|
| Etapa GROW completa | ✅ Chunk separado | — | Unidad semántica clara |
| Sección de técnicas (ej: 8 elementos) | ✅ Uno por técnica + tabla | — | Cada técnica es aplicable independientemente |
| Bloque de preguntas (archivo 02) | ✅ Por sección (A, B, C...) | ❌ Todo junto | Permite retrieval específico (crear metas vs. realidad) |
| Tabla con múltiples filas | ✅ Mantener tabla completa | ❌ Separar filas | Contexto necesario para la semántica |
| Caso práctico (archivo 10) | ✅ Tema + recorrido + técnica | ❌ Párrafo por párrafo | Necesita narrativa completa |
| Párrafos de definición | ✅ Agrupar 2-3 párrafos cortos | ❌ Cada párrafo | Evitar chunks < 150 tokens |

---

## 3. ÍNDICE JERÁRQUICO MULTILINGÜE

### 3.1 Estructura de indexación

```
Índice Global
├─ Idioma: "ES" (Español)
│  ├─ Archivo 01: "01_marco_agente_coach_es.md"
│  │  ├─ Sección: "Identidad_Misión"
│  │  │  └─ Chunk: "id_01_01" | Identidad y misión del coach
│  │  ├─ Sección: "7_Principios_No_Negociables"
│  │  │  ├─ Chunk: "id_01_02" | Principios 1-3 (persona experta, proceso vs contenido, cambiar consejos)
│  │  │  └─ Chunk: "id_01_03" | Principios 4-7 (acción+reflexión, adelante, construir, calidad preguntas)
│  │  ├─ Sección: "7_Etapas_GROW"
│  │  │  ├─ Chunk: "id_01_04" | Etapa 1 CONECTAR (meta, hacer, evitar, avanzar)
│  │  │  ├─ Chunk: "id_01_05" | Etapa 2 OBJETIVO (los 4 movimientos)
│  │  │  ├─ Chunk: "id_01_06" | Etapa 3 REALIDAD (qué está pasando)
│  │  │  ├─ Chunk: "id_01_07" | Etapa 4 AMPLIAR (perspectiva, creencias)
│  │  │  ├─ Chunk: "id_01_08" | Etapa 5 OPCIONES (generar y elegir)
│  │  │  ├─ Chunk: "id_01_09" | Etapa 6 CONCRETAR (MARTE, pasos, fecha)
│  │  │  └─ Chunk: "id_01_10" | Etapa 7 HITOS & CIERRE (resumen, aprendizaje)
│  │  ├─ Sección: "Habilidades_Escucha"
│  │  │  └─ Chunk: "id_01_11" | Presencia, reflejar, aclarar, verificar, silencio
│  │  ├─ Sección: "Matriz_Intervenciones"
│  │  │  └─ Chunk: "id_01_12" | Tabla de qué hacer según lo que dice (10 situaciones)
│  │  ├─ Sección: "Arte_Preguntas_Potentes"
│  │  │  ├─ Chunk: "id_01_13" | Arquitectura de pregunta: construcción, alcance, supuestos
│  │  │  ├─ Chunk: "id_01_14" | 7 criterios de evaluación de preguntas
│  │  │  ├─ Chunk: "id_01_15" | 8 elementos del pensamiento (diagnóstico)
│  │  │  └─ Chunk: "id_01_16" | Preguntas a evitar y alternativas
│  │  ├─ Sección: "Creencias_Limitantes"
│  │  │  └─ Chunk: "id_01_17" | Detectar, cuestionar, reemplazar creencias
│  │  ├─ Sección: "Seguridad_Límites_Derivación"
│  │  │  └─ Chunk: "id_01_18" | Guardrails: crisis, menores, temas especiales
│  │  ├─ Sección: "Adaptación_Contexto"
│  │  │  └─ Chunk: "id_01_19" | Por edad, condición, nivel cognitivo, cultura
│  │  └─ Sección: "Mapa_Temas"
│  │     └─ Chunk: "id_01_20" | Mapeo tema → archivos (universal, laboral, familia, etc.)
│  ├─ Archivo 02: "02_banco_preguntas_mcpheat_es.md"
│  │  ├─ Sección: "A_Crear_Metas"
│  │  │  └─ Chunk: "id_02_01" | Preguntas para apertura y objetivo (17 preguntas)
│  │  ├─ Sección: "B_Períodos_Evaluación"
│  │  │  └─ Chunk: "id_02_02" | Preguntas para evaluación anual o cierre de ciclo
│  │  ├─ Sección: "C_Explorar_Porqué"
│  │  │  └─ Chunk: "id_02_03" | Exploración de motivación y significado (18 preguntas)
│  │  ├─ Sección: "D_Metas_Específicas"
│  │  │  └─ Chunk: "id_02_04" | Claridad, medición, SMART (11 preguntas)
│  │  ├─ Sección: "E_Necesidades_Realidad"
│  │  │  └─ Chunk: "id_02_05" | Realidad actual, obstáculos, recursos
│  │  └─ [Continuar A-Z con misma estructura]
│  ├─ Archivo 03: "03_modelo_coach_ortiz_webb_es.md"
│  │  ├─ Chunk: "id_03_01" | Definición y 7 principios C.O.A.C.H.
│  │  ├─ Chunk: "id_03_02" | Fases C-O-A-C-H (tabla: propósito + claves)
│  │  └─ Chunk: "id_03_03" | Preguntas por fase (Conectar, Objetivo, Ampliar, etc.)
│  │  [hasta 10 chunks según secciones]
│  └─ [Archivos 04-10 con misma estructura jerárquica]
└─ Idioma: "EN" (Inglés)
   └─ [Estructura idéntica pero con archivos *_en.md]
```

### 3.2 Metadatos por chunk

```json
{
  "chunk_id": "id_01_07",
  "idioma": "es",
  "archivo": "01_marco_agente_coach_es.md",
  "archivo_num": 1,
  "seccion": "7_Etapas_GROW",
  "etapa_grow": "AMPLIAR",
  "tema_clave": ["ampliar", "perspectiva", "creencias", "conciencia"],
  "tipo": "framework",
  "tamaño_tokens": 320,
  "titulo_descriptivo": "Etapa 4 — AMPLIAR: Perspectiva, motivación y creencias limitantes",
  "contenido_resumen": "Meta de la etapa, técnicas para ganar perspectiva, exploración de porqué, creencias limitantes, criterios de avance",
  "embedding_vector": [0.124, -0.034, ..., 0.891],  // 1536 dims para embedding-3-small
  "fuentes_originales": ["[COACH]", "[McPheat]", "[Vogt]", "[Elder-Paul]"],
  "relevancia_temas": {
    "coaching_general": 1.0,
    "creencias_limitantes": 0.95,
    "emociones": 0.85,
    "liderazgo": 0.60,
    "adolescentes": 0.55
  }
}
```

---

## 4. MAPEO TEMÁTICO PARA RETRIEVAL

Cuando un usuario dice algo, el sistema ejecuta:

1. **Detección de tema primario** (classifier rápido):
   - Usuario: "No sé cómo hablar con mi hijo"
   - Tema: **familia + comunicación**
   - Archivos relacionados: 08 (preguntas familia), 07 (adolescentes), 05 (comunicación)

2. **Búsqueda vectorial en subespacio**:
   - Query embedding de "hablar con hijo"
   - Busca en chunks de archivos 07, 08
   - Relevancia: descender por similaridad coseno

3. **Ranking y filtro**:
   - Top 5 chunks candidatos
   - Filter: solo chunks con relevancia > 0.75
   - Resultado final: 3 chunks inyectados

### 4.1 Mapeo Archivo → Tema → Chunks

| Archivo | Tema Primario | Tema Secundario | Usar cuando... | Chunks principales |
|---|---|---|---|---|
| 01 | **metodología_core** | escucha, etapas, principios | Siempre (contexto base) | id_01_04 a 01_10 (etapas), 01_11-12 (habilidades) |
| 02 | **bancopreguntas_general** | objetivo, realidad, opciones | Necesita preguntas adaptadas | id_02_01 a 02_11 (A-L secciones) |
| 03 | **modelo_coach_framework** | C.O.A.C.H., fases, principios | Comprensión de estructura | id_03_02 (fases), 03_03 (preguntas por fase) |
| 04 | **preguntas_icf_poderosas** | escucha, creencias, cambio | Profundidad ICF/UNT/Vogt/Brooks | Filtrar por competencia ICF |
| 05 | **liderazgo_decisiones** | decisiones, prioridades, gestión | Usuario con rol/equipo | id_05_XX (capítulos: decisiones, prioridades, comunicación) |
| 06 | **pensamiento_crítico** | razonamiento, evidencia, sesgos | Creencias, supuestos sin examinar | id_06_XX (8 elementos, estándares, socrático) |
| 07 | **adolescentes** | jóvenes, lenguaje simple, rompehielo | Usuario < 18 años | id_07_XX (por tema: amistad, escuela, familia, futuro) |
| 08 | **familia_crianza** | hijos, comunicación familiar, dinámica | Padres/educadores o tema familia | id_08_XX (relaciones, adolescentes, dinámicas) |
| 09 | **guías_por_tema** | carrera, tiempo, hábitos, cambio, duelo | Buscar por área de vida específica | Index por subtema (educación, laboral, espiritual, etc.) |
| 10 | **casos_prácticos** | conversaciones reales, ritmo, secuencia | Entrenar ritmo de sesión o resolver bloqueos | id_10_XX (por personaje: James, Rodrigo, Danila) |

---

## 5. PIPELINE DE RETRIEVAL RAG

### 5.1 Pseudocódigo operativo

```python
def retrieve_rag_chunks(user_message: str, language: str, session_context: dict) -> list[dict]:
    """
    Entrada: mensaje del usuario, idioma, contexto de sesión (etapa GROW, tema, meta)
    Salida: top-3 chunks ordenados por relevancia
    """
    
    # Paso 1: Detectar idioma
    lang = language or detect_language(user_message)  # "es" o "en"
    
    # Paso 2: Obtener vectores
    user_query_vector = embed_text(user_message, model="embedding-3-small")
    # Si hay contexto previo, mezclar vectores:
    if session_context.get("previous_responses"):
        context_vector = average_embeddings(session_context["previous_responses"])
        user_query_vector = 0.7 * user_query_vector + 0.3 * context_vector
    
    # Paso 3: Seleccionar índice (ES o EN)
    index = load_index(f"coaching_index_{lang}")
    
    # Paso 4: Búsqueda vectorial inicial (amplía)
    candidates = index.search(
        vector=user_query_vector,
        top_k=10,  # Ampliar primero
        filter_min_relevance=0.65
    )
    
    # Paso 5: Reranking con contexto de etapa GROW
    if session_context.get("current_stage"):
        stage = session_context["current_stage"]  # "1_conectar", "4_ampliar", etc.
        # Priorizar chunks de esa etapa
        candidates = sorted(
            candidates,
            key=lambda x: (
                0.6 * x["relevance_score"] +
                0.4 * (1.0 if x["etapa_grow"] == stage else 0.5)
            ),
            reverse=True
        )
    
    # Paso 6: Diversidad de archivos (evitar repetición)
    selected = []
    seen_archives = set()
    for candidate in candidates:
        if candidate["archivo_num"] not in seen_archives or len(selected) < 3:
            selected.append(candidate)
            seen_archives.add(candidate["archivo_num"])
        if len(selected) == 3:
            break
    
    # Paso 7: Retornar ordenados por relevancia
    return sorted(selected, key=lambda x: x["relevance_score"], reverse=True)

def inject_rag_into_prompt(chunks: list[dict], system_prompt: str, user_message: str) -> str:
    """
    Construye el prompt final inyectando chunks recuperados
    """
    rag_context = "\n".join([
        f"[Relevancia: {c['relevance_score']:.2%}]\n{c['titulo_descriptivo']}\n{c['contenido']}"
        for c in chunks
    ])
    
    final_prompt = f"""{system_prompt}

---
CONTEXTO RELEVANTE RECUPERADO PARA ESTA SESIÓN:
{rag_context}

---
HISTORIAL RECIENTE:
{session_context.get('last_3_messages', '')}

---
NUEVO MENSAJE DEL USUARIO:
{user_message}

RESPUESTA DEL COACH:
"""
    return final_prompt
```

---

## 6. ESTRATEGIA BILINGÜE: ÍNDICES SEPARADOS (RECOMENDADO)

### 6.1 Ventajas de separar índices ES/EN

| Aspecto | Índice Unificado | Índices Separados |
|---|---|---|
| **Precisión** | ⚠️ Ambigüedad en embeddings multilingües | ✅ Máxima precisión por idioma |
| **Velocidad** | ✅ Un índice | ⚠️ Dos índices (pero rápidos) |
| **Escalabilidad** | ✅ Una base de datos | ✅ Dos bases de datos (simples) |
| **Mantenimiento** | ✅ Un embedding model | ✅ Mismo model, dos índices |
| **Calidad de traducción** | ✅ No necesita traducción | ⚠️ Requiere traducción paralela manual |

**Decisión:** **Opción A — Índices Separados** (precisión > latencia en coaching)

### 6.2 Arquitectura bilingüe

```
Chatbot entrada
    ↓
detect_language(user_message)
    ├─ "es" → load_index("coaching_index_es.json")
    ├─ "en" → load_index("coaching_index_en.json")
    └─ [otro] → fallback a "en"
    ↓
retrieve_rag_chunks(...)
    ↓
inject_into_prompt(system_prompt_[idioma], chunks, user_message)
    ↓
call_claude_api()
```

### 6.3 Construcción de índices

**Paso 1:** Leer todos los archivos .md (20 archivos)
**Paso 2:** Fragmentar según criterios de chunking (sección 2)
**Paso 3:** Generar embeddings con `embedding-3-small` (1536 dims)
**Paso 4:** Serializar como JSON + FAISS para búsqueda rápida

```python
# Pseudocódigo de construcción
for lang in ["es", "en"]:
    all_chunks = []
    for file_num in range(1, 11):
        file_path = f"./base_conocimientos/{lang}/0{file_num}_*.md"
        chunks = parse_and_chunk_markdown(file_path)
        all_chunks.extend(chunks)
    
    # Generar embeddings
    embeddings = batch_embed(
        texts=[c["contenido"] for c in all_chunks],
        model="text-embedding-3-small"
    )
    
    # Construir índice FAISS
    index = faiss.IndexFlatL2(1536)
    index.add(embeddings)
    
    # Guardar metadatos
    metadata = {c["chunk_id"]: c for c in all_chunks}
    save_json(f"coaching_index_{lang}_metadata.json", metadata)
    save_faiss(f"coaching_index_{lang}.index", index)
```

---

## 7. CASOS DE USO Y EJEMPLOS DE RETRIEVAL

### Ejemplo 1: Usuario con ansiedad social (Etapa AMPLIAR)

**Usuario:** "Me da miedo hablar en público."
**Contexto:** Español, etapa: AMPLIAR (fase 4)
**Query:** Usuario
**Retrieval esperado:**

```
1. [Relevancia: 0.91] id_01_07 — Etapa 4 AMPLIAR: creencias limitantes, perspectiva
2. [Relevancia: 0.88] id_06_XX — Pensamiento crítico: cuestionar creencias, evidencia
3. [Relevancia: 0.82] id_04_XX — Preguntas ICF sobre miedo, resistencia, recursos
```

**Inyección:** System prompt (ES) + estos 3 chunks → Coach responde sobre creencias que frenan.

### Ejemplo 2: Padre preocupado por hijo adolescente (Etapa OBJETIVO)

**Usuario (EN):** "My 15-year-old won't talk to me anymore."
**Contexto:** Inglés, etapa: OBJETIVO (fase 2)
**Retrieval esperado:**

```
1. [Relevancia: 0.93] id_07_XX — Adolescentes: comunicación, escucha, rompehielo
2. [Relevancia: 0.87] id_08_XX — Familia: dinámicas, generacional, empatía
3. [Relevancia: 0.79] id_02_01 — Banco de preguntas: crear metas, aclaración
```

**Inyección:** System prompt (EN) + chunks sobre familia adolescente → Coach ayuda a enfocar la meta.

### Ejemplo 3: Usuario cambia de tema (Redetección)

**Conversación anterior:** "Cambio de carrera" (archivo 05, liderazgo)
**Nuevo mensaje:** "Pero mi relación está en riesgo por esto."
**Redetección:** Nuevo tema: **familia + relaciones** (archivo 08)
**Retrieval:** Limpia archivos previos, carga familia

---

## 8. MÉTRICAS Y VALIDACIÓN

### 8.1 Calidad de chunks

```
✅ Chunk válido si:
- Tokens 300-500: ✓
- Autónomo (sin referencias rotas): ✓
- Relevancia semántica claro: ✓
- No repite contenido entre chunks: ✓

❌ Chunk inválido si:
- < 150 tokens: rechazar, fusionar
- > 700 tokens: dividir
- Referencias a figuras/tablas omitidas: rechazar
- Duplicado del 80%+ con otro chunk: fusionar
```

### 8.2 Métricas de retrieval

| Métrica | Meta | Medición |
|---|---|---|
| **Relevancia promedio** | > 0.80 | Cosine similarity en test set |
| **Cobertura temática** | 100% de temas | ¿Se recuperan chunks de todos los archivos en queries variadas? |
| **Latencia** | < 200ms | Tiempo FAISS search + embedding |
| **Precisión@3** | > 85% | ¿Los 3 chunks inyectados son realmente útiles? (human eval) |
| **Diversidad** | ≥ 2 archivos en top-3 | Evitar repetición de fuentes |

### 8.3 Test cases para validación

```
Test 1: "Tengo miedo de cambiar de carrera" (ES)
Expected: Archivo 05 (liderazgo, decisiones), 06 (creencias)
Result: ✓ o ✗

Test 2: "My teenager is isolating" (EN)
Expected: Archivo 07 (adolescentes), 08 (familia)
Result: ✓ o ✗

Test 3: Cambio de idioma mid-sesión: "I was thinking in Spanish but now English"
Expected: Detector cambia a "en", retrieves EN index
Result: ✓ o ✗
```

---

## 9. IMPLEMENTACIÓN PHASE

### Fase 1: Chunking manual (1-2 días)
- Leer los 20 archivos
- Aplicar criterios de sección 2
- Generar 200-300 chunks
- QA manual: ¿cada chunk es autónomo?

### Fase 2: Embedding y indexación (1 día)
- Generar embeddings con OpenAI API
- Construir índices FAISS (2 índices: ES + EN)
- Guardar JSON metadatos

### Fase 3: Integration + testing (3-5 días)
- Implementar retrieve_rag_chunks()
- Probar con 10 queries de cada idioma
- Validar latencia y relevancia
- Ajustar pesos de reranking si es necesario

---

## CONCLUSIÓN

Este diseño RAG permite:
- **Precisión:** chunking semántico preserva contexto
- **Escalabilidad:** índices jerárquicos + FAISS rápido
- **Bilingüismo real:** índices separados ES/EN
- **Mantenimiento:** agregar archivos nuevos sin reconstruir todo
- **Costo:** embeddings bajo (API pricing minimal)

**Token savings:** Inyectar solo 3 chunks (~1500 tokens) en vez de todos los archivos (~50k tokens) = **97% reducción de contexto**.

---

**Versión:** 1.0  
**Última revisión:** 2026-11-01  
**Estado:** Listo para implementación  
**Próximo paso:** Ejecutar Fase 1 (chunking manual)
