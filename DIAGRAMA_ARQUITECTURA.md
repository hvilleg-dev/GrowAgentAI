# 📐 DIAGRAMAS: ARQUITECTURA GROWAGENTAI

---

## 1. FLUJO GENERAL (High Level)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER (Frontend)                              │
│                      React + Framer Motion                           │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      CHAT CONTROLLER                                 │
│                    (Express endpoint)                                │
│                                                                      │
│  POST /api/coaching/chat                                            │
│  ├─ Validate input (length, encoding)                              │
│  ├─ Detect crisis (regex)                                          │
│  └─ Call Provider Router                                           │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      PROVIDER ROUTER                                 │
│                   (Decision logic)                                   │
│                                                                      │
│  selectProvider(context) {                                          │
│    if (context.detectCrisis)                                        │
│      → return Sonnet (95% confidence)                               │
│                                                                      │
│    if (context.requiresDeepReasoning)                               │
│      → return Sonnet                                                │
│                                                                      │
│    else                                                              │
│      → return Haiku (fast + cheap)                                  │
│  }                                                                   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                  ┌──────────────┼──────────────┐
                  │              │              │
                  ↓              ↓              ↓
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   Claude     │  │   OpenAI     │  │  [Future:    │
        │   (Primary)  │  │  (Fallback)  │  │  DeepSeek]   │
        │              │  │              │  │              │
        │ Haiku/Sonnet │  │ Luna         │  │ Flash        │
        └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
               │                 │                 │
               └─────────┬───────┴────────┬────────┘
                         │                │
                    Success?          Error?
                         │                │
                         ↓                ↓
                   ┌──────────────┐  ┌──────────────┐
                   │ Chat Response│  │ Fallback to  │
                   │  + Cost      │  │ OpenAI       │
                   │  + Metadata  │  │ (retry x2)   │
                   └──────┬───────┘  └──────┬───────┘
                          │                 │
                          └────────┬────────┘
                                   │
                                   ↓
                    ┌────────────────────────────┐
                    │   COST TRACKER             │
                    │                            │
                    │ - Log tokens               │
                    │ - Update monthly spend     │
                    │ - Alert if >80%            │
                    └────────────────────────────┘
                                   │
                                   ↓
                    ┌────────────────────────────┐
                    │   DATABASE (PostgreSQL)    │
                    │                            │
                    │ - Token usage              │
                    │ - Session history          │
                    │ - Cost tracking            │
                    └────────────────────────────┘
                                   │
                                   ↓
                    ┌────────────────────────────┐
                    │   RESPONSE to Frontend     │
                    │                            │
                    │ {                          │
                    │   text: "...",             │
                    │   latencyMs: 2500,         │
                    │   costUSD: 0.0025,         │
                    │   model: "haiku"           │
                    │ }                          │
                    └────────────────────────────┘
                                   │
                                   ↓
                    ┌────────────────────────────┐
                    │   UI: Chat bubble appear   │
                    │   (Framer Motion fade-in)  │
                    │                            │
                    │   Coach: "..."             │
                    └────────────────────────────┘
```

---

## 2. PROVIDER SELECTION LOGIC

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER MESSAGE ARRIVES                          │
│               "Realmente me siento abrumado..."                  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ↓                ↓                ↓
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │ REGEX SCAN   │  │ CRISIS AI    │  │ CONTEXT      │
        │ (fast)       │  │ (confirm)    │  │ (GROW stage) │
        │              │  │              │  │              │
        │ Keywords:    │  │ Sonnet:      │  │ Simple chat? │
        │ suicid*      │  │ 95% confid.  │  │ Complex?     │
        │ matarme      │  │              │  │ Reasoning?   │
        │ morirme      │  │              │  │              │
        └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
               │                 │                 │
               └────────┬────────┴────────┬────────┘
                        │
                  ┌─────┴──────────┐
                  │                │
              YES │                │ NO
                  │                │
                  ↓                ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ CRISIS DETECTED  │  │ Check complexity │
        │                  │  │                  │
        │ → USE SONNET     │  │ if complex:      │
        │ (95% confidence) │  │  → USE SONNET    │
        │                  │  │ else:            │
        │ Cost: $10/MTok   │  │  → USE HAIKU     │
        │ output           │  │                  │
        │                  │  │ Cost: $0.50/MTok │
        │                  │  │ output           │
        └────────┬─────────┘  └────────┬─────────┘
                 │                    │
                 └────────┬───────────┘
                          │
                    ┌─────┴──────────────┐
                    │                    │
                    ↓                    ↓
              ┌──────────┐         ┌──────────┐
              │ SONNET   │         │  HAIKU   │
              │ ~2-3s    │         │  ~1-2s   │
              │ 95%      │         │  95%     │
              │ quality  │         │ quality  │
              │ $$$$     │         │ $        │
              └──────────┘         └──────────┘
```

---

## 3. FALLBACK CHAIN (Error Handling)

```
┌─────────────────────────────────────────────────┐
│             TRY: Claude (Primary)                │
│             ├─ Model: Haiku or Sonnet           │
│             └─ Timeout: 30s                      │
└────────────────────────┬────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         Success              Error/Timeout
              │                     │
              ↓                     ↓
        ┌────────────┐      ┌──────────────────┐
        │ Return     │      │ FALLBACK CHAIN   │
        │ Response   │      │                  │
        │ (save cost)│      │ Attempt 1: Luna  │
        └────────────┘      │ Timeout: 30s     │
                            │ Wait: 2s         │
                            └────────┬─────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                      Success              Error/Timeout
                          │                     │
                          ↓                     ↓
                    ┌────────────┐      ┌──────────────────┐
                    │ Return     │      │ Attempt 2: Luna  │
                    │ from Luna  │      │ Timeout: 30s     │
                    │ (fallback) │      │ Wait: 4s         │
                    └────────────┘      └────────┬─────────┘
                                                 │
                          ┌──────────────────────┴──────────────┐
                          │                                     │
                      Success                             Error/Timeout
                          │                                     │
                          ↓                                     ↓
                    ┌────────────┐               ┌────────────────────┐
                    │ Return     │               │ ServiceUnavailable │
                    │ from Luna  │               │ Error              │
                    │ (attempt 2)│               │                    │
                    └────────────┘               │ Log incident       │
                                                │ Alert ops team     │
                                                │ Return error to UI │
                                                └────────────────────┘

RESULT:
- 99%+ uptime (both APIs would need to fail)
- Automatic recovery (transparent to user)
- Cost: same tier (Luna = Haiku price)
```

---

## 4. CRISIS DETECTION FLOW

```
┌──────────────────────────────────────────────────┐
│            USER MESSAGE                          │
│    "No veo por qué seguir viviendo..."          │
└──────────────────────────────┬───────────────────┘
                               │
                               ↓
                  ┌────────────────────────┐
                  │ REGEX CHECK (instant)  │
                  │                        │
                  │ Patterns:              │
                  │ - suicid*              │
                  │ - matarme              │
                  │ - morirme              │
                  │ - ya no quiero         │
                  │ - fin a todo           │
                  │ - cortar mis venas     │
                  │                        │
                  │ Confidence: 85-99%     │
                  └────────┬───────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
          MATCH            NO MATCH / UNCERTAIN
              │                         │
              ↓                         ↓
        ┌──────────┐          ┌──────────────────────┐
        │ HIGH     │          │ ASK SONNET FOR       │
        │ CONFIDENCE
        │ CRISIS   │          │ CONFIRMATION         │
        │ (95%+)   │          │                      │
        │          │          │ Prompt:              │
        │ → Sonnet │          │ "¿Es ideación        │
        │   ALWAYS │          │  suicida de verdad?" │
        │          │          │                      │
        │          │          │ Sonnet: 95% confid   │
        └────┬─────┘          └──────────┬───────────┘
             │                           │
             └───────────┬───────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
    CRISIS          NO CRISIS / UNCERTAIN
    CONFIRMED            │
        │                │
        ↓                ↓
  ┌──────────────┐  ┌─────────────┐
  │ 1. PROTOCOL  │  │ Continue    │
  │    DERIVATION│  │ normal chat │
  │              │  │             │
  │ 2. HIDE from │  └─────────────┘
  │    History   │
  │              │
  │ 3. ANONYMOUSLY
  │    LOG        │
  │    {          │
  │      user:    │
  │      hash(),  │
  │      fecha,   │
  │      tipo,    │
  │      nivel    │
  │    }          │
  │              │
  │ 4. RETURN:   │
  │    "Veo que  │
  │     esto es  │
  │     crítico. │
  │     Aquí hay │
  │     recursos" │
  │              │
  └──────────────┘

GOAL: ~99% detection (2 layers) + 0% false positives
```

---

## 5. COST TRACKING FLOW

```
┌─────────────────────────────────────────┐
│         CADA RESPUESTA API               │
│                                         │
│ {                                       │
│   text: "...",                          │
│   tokensInput: 1500,                    │
│   tokensOutput: 3000,                   │
│   model: "claude-haiku",                │
│   latencyMs: 2150                       │
│ }                                       │
└────────────────────┬────────────────────┘
                     │
                     ↓
          ┌────────────────────┐
          │ CALCULATE COST     │
          │                    │
          │ Haiku:             │
          │ Input: (1500/1M)   │
          │        × $0.10     │
          │        = $0.00015  │
          │                    │
          │ Output: (3000/1M)  │
          │         × $0.50    │
          │         = $0.0015  │
          │                    │
          │ TOTAL: $0.00165    │
          └────────┬───────────┘
                   │
                   ↓
          ┌────────────────────┐
          │ LOG TO DATABASE    │
          │                    │
          │ INSERT INTO        │
          │ tokenUsage {       │
          │   userId,          │
          │   sessionId,       │
          │   provider,        │
          │   model,           │
          │   inputTokens,     │
          │   outputTokens,    │
          │   costUSD,         │
          │   timestamp        │
          │ }                  │
          └────────┬───────────┘
                   │
                   ↓
          ┌────────────────────┐
          │ AGGREGATE MONTHLY  │
          │                    │
          │ SELECT SUM(cost)   │
          │ FROM tokenUsage    │
          │ WHERE              │
          │  timestamp >=      │
          │  THIS_MONTH_START  │
          │                    │
          │ Result: $45.32     │
          └────────┬───────────┘
                   │
          ┌────────┴─────────────┐
          │                      │
      <80%?               >80%?
          │                      │
          ↓                      ↓
    ┌──────────┐         ┌────────────────┐
    │ Continue │         │ SEND ALERT     │
    │ normally │         │                │
    │          │         │ "Warning:      │
    │          │         │  80% budget    │
    │          │         │  used"         │
    │          │         │                │
    │          │         │ Dashboard:     │
    │          │         │ 🟡 Warning     │
    └──────────┘         └────────────────┘

>100%?
  ↓
┌────────────────────┐
│ CIRCUIT BREAKER    │
│ (future feature)   │
│                    │
│ Stop processing?   │
│ Requires ops OK    │
└────────────────────┘
```

---

## 6. DATABASE SCHEMA (Coaching Context)

```
┌─────────────────────┐
│     usuarios        │
├─────────────────────┤
│ id (UUID) ⭐        │
│ email               │
│ nombre              │
│ idioma              │
│ edad_rango          │
│ fecha_registro      │
│ last_login          │
└────────┬────────────┘
         │
         │ 1:N
         │
         ↓
┌─────────────────────┐
│     sesiones        │
├─────────────────────┤
│ id (UUID) ⭐        │
│ usuario_id (FK)     │
│ fecha_inicio        │
│ fecha_fin           │
│ tema (carrera, etc) │
│ objetivo            │
│ etapa_actual (1-7)  │
│ estado              │
└────────┬────────────┘
         │
         │ 1:N
         │
         ├──────────────────────┬──────────────────────┐
         │                      │                      │
         ↓                      ↓                      ↓
    ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
    │  interacciones  │  │   compromisos   │  │  creencias_      │
    ├─────────────────┤  ├─────────────────┤  │  limitantes      │
    │ id ⭐           │  │ id ⭐           │  ├──────────────────┤
    │ sesion_id (FK)  │  │ sesion_id (FK)  │  │ id ⭐            │
    │ rol (user/coach)│  │ enunciado       │  │ usuario_id (FK)  │
    │ mensaje         │  │ fecha_límite    │  │ creencia         │
    │ timestamp       │  │ indicador_éxito │  │ sesion_origen    │
    │ etapa           │  │ pasos_concretos │  │ fecha            │
    │ intención       │  │ estado          │  │ desafiada        │
    │ fuente_pregunta │  │ evaluación_final│  │ fecha_desafío    │
    └─────────────────┘  └─────────────────┘  └──────────────────┘

┌──────────────────────┐
│   metas_usuario      │
├──────────────────────┤
│ id ⭐               │
│ usuario_id (FK)     │
│ descripción         │
│ fecha_creación      │
│ fecha_meta          │
│ progreso (0-100%)   │
│ área (carrera, etc) │
│ hitos (JSON)        │
│ estado              │
└──────────────────────┘

┌──────────────────────┐
│  fragmentos_rag      │
├──────────────────────┤
│ id ⭐               │
│ archivo             │
│ sección             │
│ contenido           │
│ embedding (pgvector)│
│ tema                │
└──────────────────────┘

┌──────────────────────┐
│  eventos_crisis      │ (ANONYMOUS)
├──────────────────────┤
│ id ⭐               │
│ usuario_anónimo     │ ← hash, not ID
│ fecha               │
│ tipo                │
│ nivel               │
│ derivado_a          │
│ registrado          │
└──────────────────────┘

┌──────────────────────┐
│   tokenUsage         │ (Cost tracking)
├──────────────────────┤
│ id ⭐               │
│ userId (FK)         │
│ sessionId (FK)      │
│ provider            │
│ model               │
│ inputTokens         │
│ outputTokens        │
│ costUSD             │
│ timestamp           │
└──────────────────────┘
```

---

## 7. DECISION TREE: PROVIDER SELECTION

```
                     REQUEST ARRIVES
                           │
                           ↓
                    ┌──────────────────┐
                    │ DETECT CRISIS?   │
                    │ (regex + Sonnet) │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
             YES │                        │ NO
                │                         │
                ↓                         ↓
            ┌──────────┐          ┌──────────────┐
            │ SONNET   │          │ CHECK ETAPA  │
            │ (95% conf)          │ GROW         │
            │ crisis OK │          │              │
            └──────────┘          └────────┬─────┘
                                           │
                        ┌──────────────────┼──────────────┐
                        │                  │              │
                    1-3 │              4-5 │          6-7
                  (simple)         (medium)      (complex)
                        │                  │              │
                        ↓                  ↓              ↓
                ┌──────────────┐   ┌──────────────┐  ┌──────────┐
                │ HAIKU        │   │ COMPLEX?     │  │ SONNET   │
                │              │   │ (reasoning)  │  │ (complex)│
                │ 1-2s latency │   │              │  │ 2-3s     │
                │ $0.0064/user │   │ IF yes→      │  │ $1.28/user
                │              │   │  SONNET      │  │          │
                │ (default OK) │   │ ELSE→        │  │ (edge)   │
                │              │   │  HAIKU       │  │          │
                └──────────────┘   └──────────────┘  └──────────┘
                        │                  │              │
                        └──────────────┬───┴──────────────┘
                                       │
                                       ↓
                    ┌────────────────────────────┐
                    │ CALL PROVIDER + LOG COST   │
                    └────────────────────────────┘
                                       │
                         ┌─────────────┴──────────────┐
                         │                            │
                     Success                      Error
                         │                            │
                         ↓                            ↓
                    Return response          Fallback to OpenAI
                    (track cost)                  (retry x2)
                                                      │
                                           ┌──────────┴──────────┐
                                           │                     │
                                       Success              Error
                                           │                     │
                                           ↓                     ↓
                                    Return from Luna     ServiceUnavailable
                                    (log fallback)       Error to user
```

---

## 8. IMPLEMENTACIÓN: FASES

```
PHASE 1: MVP (Weeks 1-6)
├─ Repo setup
├─ Claude provider
├─ OpenAI provider
├─ Router logic
├─ Basic UI chat
└─ Test fallback

PHASE 2: Features (Weeks 7-12)
├─ Máquina de estados (1-7)
├─ RAG vectorial
├─ Crisis detection
├─ JSON extraction
├─ Dashboard
└─ Commitment tracking

PHASE 3: Polish (Weeks 13-15)
├─ Animations
├─ Dark mode
├─ Accessibility
├─ Performance
└─ Cost dashboard

PHASE 4: Extensions (Future)
├─ DeepSeek provider [template ready]
├─ Ollama provider [template ready]
├─ Mobile apps
└─ Analytics
```

---

*Arquitectura lista. Pseudocódigo en ARQUITECTURA_PROVIDER_ROUTER.md*
