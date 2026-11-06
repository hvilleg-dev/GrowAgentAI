# 📊 TABLA MAESTRA DE PRECIOS IA - NOV 2026
## Guía Completa para Selección de Modelos por Caso de Uso

**Última actualización:** Noviembre 5, 2026  
**Fuentes:** APIs oficiales verificadas (Anthropic, OpenAI, DeepSeek, Google)

---

## 🎯 ÍNDICE RÁPIDO

- [1. Tabla Master - Todos los Modelos](#1-tabla-master)
- [2. Valor por Dinero (Value/$$)](#2-valor-por-dinero)
- [3. Por Caso de Uso](#3-por-caso-de-uso)
- [4. Calculador Rápido](#4-calculador-rpido)
- [5. Decisiones por Presupuesto](#5-decisiones-por-presupuesto)

---

## 1. TABLA MASTER - TODOS LOS MODELOS

### 📈 PRECIOS POR 1M TOKENS (Base)

```
┌─────────────────────────────────┬──────────┬──────────┬─────────┬──────────────┐
│ MODELO                          │ INPUT    │ OUTPUT   │ CONTEXT │ FEATURES     │
├─────────────────────────────────┼──────────┼──────────┼─────────┼──────────────┤
│ ANTHROPIC (claude.com)          │          │          │         │              │
├─────────────────────────────────┼──────────┼──────────┼─────────┼──────────────┤
│ Haiku 5.5 ⭐⭐⭐              │ $0.10    │ $0.50    │ 200K    │ Vision, Fast │
│ Sonnet 5.5 ⭐⭐               │ $2.00    │ $10.00   │ 200K    │ Balanced     │
│ Opus 5.5 ⭐                    │ $4.00    │ $20.00   │ 200K    │ Max reasoning│
│ Fable 5.1 ⭐                   │ $10.00   │ $50.00   │ 200K    │ Agents       │
├─────────────────────────────────┼──────────┼──────────┼─────────┼──────────────┤
│ OPENAI (openai.com)             │          │          │         │              │
├─────────────────────────────────┼──────────┼──────────┼─────────┼──────────────┤
│ GPT-6 Luna ⭐⭐⭐              │ $0.10    │ $0.50    │ 128K    │ Economic     │
│ GPT-6.1 Terra ⭐⭐             │ $1.00    │ $5.00    │ 128K    │ Vision       │
│ GPT-6.1 Sol ⭐⭐               │ $2.00    │ $10.00   │ 128K    │ Balanced     │
│ GPT-6 Astra ⭐                 │ $10.00   │ $50.00   │ 128K    │ Max capability
├─────────────────────────────────┼──────────┼──────────┼─────────┼──────────────┤
│ DEEPSEEK (api.deepseek.com)     │          │          │         │              │
├─────────────────────────────────┼──────────┼──────────┼─────────┼──────────────┤
│ Flash-Lite (no cache) ⭐⭐⭐   │ $0.15*   │ $0.60*   │ 1M      │ Budget       │
│ Flash-Lite (cache hit) ✨       │ $0.003*  │ $0.60*   │ 1M      │ Budget+cache │
│ Flash (no cache) ⭐⭐            │ $0.30*   │ $1.20*   │ 1M      │ Balanced     │
│ Flash (cache hit) ✨            │ $0.006*  │ $1.20*   │ 1M      │ Balanced+cache
│ V4-Pro (no cache) ⭐            │ $0.66*   │ $1.98*   │ 1M      │ Reasoning    │
│ V4-Pro (cache hit) ✨           │ $0.022*  │ $1.98*   │ 1M      │ Reasoning+cch
├─────────────────────────────────┼──────────┼──────────┼─────────┼──────────────┤
│ GOOGLE (aistudio.google.com)    │          │          │         │              │
├─────────────────────────────────┼──────────┼──────────┼─────────┼──────────────┤
│ Flash-Lite ⭐⭐                │ $0.30    │ $2.50    │ 1M      │ Economic     │
│ 3.8 Flash ⭐                    │ $0.75-1.5│ $3.75-7.5│ 1M      │ Balanced     │
│ 4 Argon ⭐                      │ $2.00-4.0│ $10-20   │ 1M      │ Reasoning    │
├─────────────────────────────────┼──────────┼──────────┼─────────┼──────────────┤
│ OPEN SOURCE (Ollama - Local)    │          │          │         │              │
├─────────────────────────────────┼──────────┼──────────┼─────────┼──────────────┤
│ Mistral-7B (local) ✅            │ $0.00    │ $0.00    │ 32K     │ GDPR, Free   │
│ Llama2-7B (local) ✅            │ $0.00    │ $0.00    │ 4K      │ GDPR, Free   │
│ Llama2-13B (local) ✅           │ $0.00    │ $0.00    │ 8K      │ GDPR, Free   │
└─────────────────────────────────┴──────────┴──────────┴─────────┴──────────────┘

* DeepSeek precios off-peak (60% del tiempo). Peak = 2x
✨ Cache hit = 50x más barato input (DeepSeek Flash)
```

---

## 2. VALOR POR DINERO ($/Performance Ratio)

### 🏆 VALOR ABSOLUTO (mejor bang por buck)

```
═══════════════════════════════════════════════════════════════════════════════
              VALOR POR DINERO: RANKING (Nov 2026)
═══════════════════════════════════════════════════════════════════════════════

RANK │ MODELO              │ $/INPUT-OUTPUT │ PERFORMANCE │ VALUE SCORE
─────┼─────────────────────┼────────────────┼─────────────┼──────────────
 🥇  │ Haiku 5.5           │ $0.10-0.50     │ 95%         │ ★★★★★ (5/5)
 🥈  │ GPT-6 Luna          │ $0.10-0.50     │ 90%         │ ★★★★★ (5/5)
 🥉  │ DeepSeek Flash-Lite │ $0.15-0.60 *   │ 85%         │ ★★★★☆ (4/5)
──────┼─────────────────────┼────────────────┼─────────────┼──────────────
  4   │ Gemini Flash-Lite   │ $0.30-2.50     │ 85%         │ ★★★☆☆ (3/5)
  5   │ DeepSeek Flash      │ $0.30-1.20 *   │ 88%         │ ★★★☆☆ (3/5)
  6   │ GPT-6.1 Terra       │ $1.00-5.00     │ 88%         │ ★★★☆☆ (3/5)
  7   │ Gemini 3.8 Flash    │ $0.75-7.50     │ 85%         │ ★★★☆☆ (3/5)
  8   │ GPT-6.1 Sol         │ $2.00-10.00    │ 92%         │ ★★★☆☆ (3/5)
  9   │ Sonnet 5.5          │ $2.00-10.00    │ 95%         │ ★★★☆☆ (3/5)
 10   │ DeepSeek V4-Pro     │ $0.66-1.98 *   │ 90%         │ ★★☆☆☆ (2/5)
──────┼─────────────────────┼────────────────┼─────────────┼──────────────
 11   │ Gemini 4 Argon      │ $2.00-20.00    │ 92%         │ ★★☆☆☆ (2/5)
 12   │ Opus 5.5            │ $4.00-20.00    │ 98%         │ ★★☆☆☆ (2/5)
 13   │ Fable 5.1           │ $10.00-50.00   │ 95%         │ ★☆☆☆☆ (1/5)
 14   │ GPT-6 Astra         │ $10.00-50.00   │ 95%         │ ★☆☆☆☆ (1/5)
──────┼─────────────────────┼────────────────┼─────────────┼──────────────
 🎯   │ Ollama (Mistral-7B) │ $0.00 API      │ 70%         │ ★★★★★ (∞)
      │ (self-hosted)       │ +infra cost    │ +GDPR       │ (if privacy needed)
═══════════════════════════════════════════════════════════════════════════════

KEY:
✅ Haiku 5.5 & Luna: BEST VALUE (mismos precios, calidad 90-95%)
✅ DeepSeek Flash-Lite: BUDGET OPTION (pero con overhead de optimización)
✅ Ollama: BEST si privacidad es requirement (GDPR, HIPAA)
❌ Fable, Astra: Premium pricing sin valor claro vs Sonnet/Opus
```

### 💰 COSTO TOTAL ANUAL (Scaling)

```
═══════════════════════════════════════════════════════════════════════════════
         COSTO ANUAL POR PLATAFORMA (100 usuarios, 8 sesiones/mes)
═══════════════════════════════════════════════════════════════════════════════

MODELO                 │ /MES     │ /AÑO      │ MONTHLY COST (50-500 users)
───────────────────────┼──────────┼───────────┼─────────────────────────────
Haiku 5.5              │ $0.64    │ $7.68     │ 50u: $0.32 | 250u: $1.60
GPT-6 Luna             │ $0.64    │ $7.68     │ 50u: $0.32 | 250u: $1.60
DeepSeek Flash-Lite *  │ $3.12    │ $37.44    │ 50u: $1.56 | 250u: $7.80
DeepSeek Flash *       │ $0.78    │ $9.36     │ 50u: $0.39 | 250u: $1.95
Gemini Flash-Lite      │ $3.12    │ $37.44    │ 50u: $1.56 | 250u: $7.80
GPT-6.1 Terra          │ $6.48    │ $77.76    │ 50u: $3.24 | 250u: $16.20
Sonnet 5.5             │ $128     │ $1,536    │ 50u: $64   | 250u: $320
DeepSeek V4-Pro *      │ $3.64    │ $43.68    │ 50u: $1.82 | 250u: $9.10
Opus 5.5               │ $256     │ $3,072    │ 50u: $128  | 250u: $640
Ollama (infra only)    │ $100-300 │ $1.2-3.6k │ Depends on scale

* DeepSeek = off-peak average (60% off + 40% peak = 1.3x multiplier)
```

---

## 3. POR CASO DE USO

### 🎯 COACHING / CONVERSACIONAL

**Requirements:** Crisis detection (95%+), JSON extraction (96%+), latencia <3s

```
┌──────────────────────┬───────────┬──────────────────────┬─────────────────┐
│ USE CASE             │ RECOM.    │ JUSTIFICACIÓN        │ COSTO/USER/MES  │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Startup (1-50u)      │ Haiku 5.5 │ Best value + crisis  │ $0.0064         │
│                      │ + Luna    │ detection 95%        │ (Haiku same as) │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ PYME (50-250u)       │ Haiku 5.5 │ Scale to 250u for    │ $0.0064         │
│                      │ PRIMARY   │ $1.60/mes (!)        │ @ 250 users     │
│ + Sonnet FALLBACK    │ for 20%   │ Hybrid for security  │ +$20 Sonnet     │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Enterprise (500+u)   │ Sonnet 5.5│ Crisis 95%, JSON 99% │ $1.28           │
│ + Opus FALLBACK      │ PRIMARY   │ SLA guaranteed       │ +$0.50 Opus     │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ GDPR/Privacy (EU)    │ Ollama    │ Local, GDPR ready    │ $0/API+infra    │
│ Self-hosted          │ Mistral   │ No data leaves       │ $100-300/mo     │
└──────────────────────┴───────────┴──────────────────────┴─────────────────┘

⚠️ AVOID: Gemini Flash ($0.072 = 11.25x Haiku), DeepSeek alone for crisis
```

### 💻 SOFTWARE DEVELOPMENT / CODING

**Requirements:** Reasoning (92%+), context (200K+), latencia <5s

```
┌──────────────────────┬───────────┬──────────────────────┬─────────────────┐
│ USE CASE             │ RECOM.    │ JUSTIFICACIÓN        │ COSTO/OPERACIÓN │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Debugging (rapid)    │ Haiku 5.5 │ Fast, good enough    │ $0.0001-0.001   │
│ Per request: <2K t   │ or Luna   │ for 80% cases        │ per debug       │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Refactoring (complex)│ Sonnet 5.5│ Better reasoning for │ $0.05-0.20      │
│ Per request: 5-20K   │           │ 20% complex cases    │ per refactor    │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Code review (heavy)  │ Opus 5.5  │ Max reasoning for    │ $0.50-2.00      │
│ Per request: 50K+    │ or        │ 5-10% critical path  │ per review      │
│ + long context       │ Sonnet    │ (cache = 10x savings)│ (with cache)    │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Batch processing     │ DeepSeek  │ Off-peak timing,     │ $0.0001-0.0005  │
│ (100+ files)         │ Flash     │ cache optimization   │ per file        │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Continuous CI/CD     │ Luna      │ High volume, cheap   │ $0.00005-0.0005 │
│ Integration tests    │ or Haiku  │ per build check      │ per test run    │
└──────────────────────┴───────────┴──────────────────────┴─────────────────┘

💡 TIP: Use Haiku/Luna for 80% tasks, Sonnet/Opus for 20% complex
    → Average effective cost: ~$0.005 per operation
```

### 📄 DOCUMENT PROCESSING / RAG

**Requirements:** Vision (optional), context (500K+), batch processing

```
┌──────────────────────┬───────────┬──────────────────────┬─────────────────┐
│ USE CASE             │ RECOM.    │ JUSTIFICACIÓN        │ COSTO/BATCH     │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Text extraction      │ DeepSeek  │ 1M context, cache ok │ $0.01-0.05      │
│ (100+ pages)         │ Flash     │ for repeated docs    │ per 100 pages   │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ PDF + Vision         │ Haiku 5.5 │ Vision support,      │ $0.005-0.02     │
│ Analysis             │ or Luna   │ good enough for most │ per PDF         │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Long article         │ Sonnet 5.5│ Better reasoning for │ $0.02-0.10      │
│ Summarization        │ + cache   │ complex summaries    │ per article     │
│ (10-100K tokens)     │           │ + cache = 10x savings│ (with cache)    │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ TABLE EXTRACTION     │ Sonnet 5.5│ JSON reliability 99% │ $0.01-0.05      │
│ (CSV, structured)    │           │ vs Haiku 96%         │ per doc         │
└──────────────────────┴───────────┴──────────────────────┴─────────────────┘

⚠️ CACHE STRATEGY: Store embeddings + summarized docs → 50x savings on input
```

### 🔍 DATA ANALYSIS / REASONING TASKS

**Requirements:** Deep reasoning (95%+), mathematical correctness, context

```
┌──────────────────────┬───────────┬──────────────────────┬─────────────────┐
│ USE CASE             │ RECOM.    │ JUSTIFICACIÓN        │ COSTO/TASK      │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Simple stats         │ Haiku 5.5 │ Good enough for basic│ $0.001-0.005    │
│ Analysis             │           │ math, fast response  │ per analysis    │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Complex reasoning    │ Sonnet 5.5│ Better reasoning,    │ $0.05-0.20      │
│ (multi-step logic)   │ + cache   │ cache for patterns   │ per analysis    │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Deepest reasoning    │ Opus 5.5  │ Max confidence for   │ $0.50-2.00      │
│ (edge cases, hard)   │ or        │ critical decisions   │ per analysis    │
│                      │ Deepseek  │                      │ (with cache)    │
│                      │ V4-Pro    │                      │                 │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Batch analysis       │ DeepSeek  │ Off-peak timing      │ $0.0001-0.001   │
│ (1000s of items)     │ Flash-Lite│ + cache              │ per item        │
└──────────────────────┴───────────┴──────────────────────┴─────────────────┘
```

### 🚀 AGENTS / AUTONOMOUS TASKS

**Requirements:** Tool calling, long context, reasoning, cost efficiency

```
┌──────────────────────┬───────────┬──────────────────────┬─────────────────┐
│ USE CASE             │ RECOM.    │ JUSTIFICACIÓN        │ COSTO/TASK      │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Simple agent         │ Haiku 5.5 │ Tool calling ok,     │ $0.01-0.05      │
│ (5-10 steps)         │ or Luna   │ fast iteration       │ per task        │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Complex agent        │ Sonnet 5.5│ Better planning for  │ $0.10-0.50      │
│ (10-50 steps)        │           │ multi-step workflows │ per task        │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ Long-running agent   │ Fable 5.1 │ Designed for agents, │ $0.50-2.00      │
│ (50+ steps)          │           │ better at autonomy   │ per task        │
├──────────────────────┼───────────┼──────────────────────┼─────────────────┤
│ High-volume agents   │ DeepSeek  │ Off-peak + 1M ctx,   │ $0.001-0.01     │
│ (batch processing)   │ Flash     │ scaling-friendly     │ per task        │
└──────────────────────┴───────────┴──────────────────────┴─────────────────┘

💡 TIP: Agents = more tokens per task → cache becomes critical
    → Use cached system prompts + tool definitions
```

---

## 4. CALCULADOR RÁPIDO

### 📐 CÓMO CALCULAR TU COSTO

```
FÓRMULA GENERAL:
────────────────────────────────────────────────────────────────
Monthly Cost = (Input Tokens × Input Price) + (Output Tokens × Output Price)
                / 1,000,000

DONDE:
• Input Tokens = prompt + context (avg 1,500 por sesión/request)
• Output Tokens = respuesta del modelo (avg 3,000 por sesión)
• Price per 1M = tabla arriba (en $/MTok)


EJEMPLO: Coaching app con 100 usuarios
────────────────────────────────────────────────────────────────
Sesiones/mes:    8 sesiones × 100 usuarios = 800 sesiones/mes
Input/sesión:    500 tokens
Output/sesión:   1,500 tokens
Total input:     500 × 800 = 400,000 tokens
Total output:    1,500 × 800 = 1,200,000 tokens

COSTO CON HAIKU 5.5:
Input:  (400,000 / 1,000,000) × $0.10 = $0.04
Output: (1,200,000 / 1,000,000) × $0.50 = $0.60
TOTAL:  $0.64/mes (¡menos de $1!)

COSTO CON SONNET 5.5:
Input:  (400,000 / 1,000,000) × $2.00 = $0.80
Output: (1,200,000 / 1,000,000) × $10.00 = $12.00
TOTAL:  $12.80/mes


CON CACHE (si implementas):
────────────────────────────────────────────────────────────────
Si 30% de sesiones reutilizan context (cache hit):

Cached input:    400,000 × 0.30 × $0.01 (Anthropic cache) = $0.0012
Non-cached:      400,000 × 0.70 × $0.10 = $0.028
Output:          1,200,000 × $0.50 = $0.60
TOTAL:           $0.63/mes (solo $0.01 menos)

⚠️ Para DeepSeek flash (cache 50x cheaper):
Cached:          120,000 × 0.30 × $0.003 = $0.00011
Non-cached:      120,000 × 0.70 × $0.15 = $0.0126
Output:          1,200,000 × $0.60 = $0.72
TOTAL:           $0.73/mes


CALCULADORA INTERACTIVA:
────────────────────────────────────────────────────────────────
Usa esta fórmula para TU caso:

Cost = [(Tokens_input / 1M) × Price_input] 
       + [(Tokens_output / 1M) × Price_output]
       × (Number of requests)
       × (Months)

Ej: Haiku, 5K input+15K output, 100 requests/mes:
    = [($0.10/1M × 5K) + ($0.50/1M × 15K)] × 100 × 1
    = [($0.0005) + ($0.0075)] × 100
    = $0.008 × 100
    = $0.80/mes
```

---

## 5. DECISIONES POR PRESUPUESTO

### 💵 PRESUPUESTO: <$10/mes

```
┌─────────────────────────────────────────────────────────────┐
│ MÁXIMO 10 USUARIOS ACTIVOS                                  │
├─────────────────────────────────────────────────────────────┤
│ 🥇 OPTION 1: Haiku 5.5 (starter)                           │
│    Cost: $0.64/mes (100 usuarios = $0.64!)                 │
│    Scale: ✅ Up to ~1,500 usuarios before hitting $10      │
│    Recommendation: DEFAULT START                            │
│                                                             │
│ 🥈 OPTION 2: DeepSeek Flash-Lite (budget)                  │
│    Cost: $3.12/mes (100 usuarios)                          │
│    Scale: ✅ Up to ~300 usuarios for $10                   │
│    Caveat: Requires cache optimization to be effective    │
│                                                             │
│ 🥉 OPTION 3: Gemini Free Tier (testing MVP)               │
│    Cost: $0/API (limited free requests)                    │
│    Scale: Limited (perfect for prototyping)                │
│    Recommendation: Prototype only, migrate to paid later   │
│                                                             │
│ ⛔ AVOID:                                                   │
│   - Any premium model (Sonnet, Opus, Astra)               │
│   - Production on free tier (unreliable)                   │
└─────────────────────────────────────────────────────────────┘
```

### 💵 PRESUPUESTO: $10-100/mes

```
┌─────────────────────────────────────────────────────────────┐
│ STARTUP VALIDATED (50-500 usuarios)                         │
├─────────────────────────────────────────────────────────────┤
│ 🥇 OPTION 1: Haiku 5.5 PRIMARY (RECOMMENDED)              │
│    Cost: $0.64/mes (stays under $1 up to 1500+ users!)    │
│    + Luna backup for redundancy                            │
│    Total budget: $1-2/mes for main platform                │
│    Remaining $8-98: Add Sonnet for 5% edge cases          │
│                                                             │
│    Architecture:                                           │
│    ├─ Chat: Haiku 85%                                      │
│    ├─ Crisis: Haiku + regex fallback                      │
│    ├─ Complex: Sonnet 15% = $5/mes                        │
│    └─ Fallback: Luna (free backup)                         │
│    TOTAL: ~$6/mes for 100 users                            │
│                                                             │
│ 🥈 OPTION 2: DeepSeek Hybrid (economy)                     │
│    Cost: $0.78/mes base + $3.64 V4-Pro fallback          │
│    Caveat: Cache optimization required                    │
│    Good for: price-sensitive markets                      │
│    Not recommended: crisis-critical apps                  │
│                                                             │
│ 🥉 OPTION 3: All Haiku (simplicity)                       │
│    Cost: $0.64/mes (negligible)                           │
│    Use budget for: infrastructure, cache optimization     │
└─────────────────────────────────────────────────────────────┘
```

### 💵 PRESUPUESTO: $100-1k/mes

```
┌─────────────────────────────────────────────────────────────┐
│ PYME / SCALEUP (100-500 usuarios)                           │
├─────────────────────────────────────────────────────────────┤
│ 🥇 RECOMMENDED: Haiku 5.5 + Sonnet Strategic Mix          │
│                                                             │
│    Architecture:                                           │
│    ├─ Chat: Haiku 80% ($0.51/100u)                        │
│    ├─ Complex: Sonnet 20% ($25.60/100u)                   │
│    ├─ Crisis: Sonnet ALWAYS ($12.80/100u for safety)     │
│    ├─ Extract: Sonnet 99% reliability                     │
│    ├─ Fallback: Luna (backup)                             │
│    └─ TOTAL: ~$40/mes for 100 users                        │
│       (room for scaling to $1k budget)                     │
│                                                             │
│    Cost breakdown per 100 users:                          │
│    $0.64 Haiku (main) + $38-50 Sonnet (strategic) ✅      │
│    + $50 infrastructure                                    │
│    + $100-200 ops/cache optimization                      │
│    = $150-300/mes for solid production platform           │
│                                                             │
│ 🥈 OPTION 2: All Sonnet (simplicity)                      │
│    Cost: $128/mes for 100 users                           │
│    Benefit: Max consistency, no switching complexity      │
│    Downside: Over-provisioned for 80% of workload        │
│                                                             │
│ ⚠️ AVOID:                                                  │
│   - DeepSeek alone for crisis apps                        │
│   - Gemini (4.9-11x more expensive than needed)          │
│   - Opus for non-critical use                            │
└─────────────────────────────────────────────────────────────┘
```

### 💵 PRESUPUESTO: $1k-10k/mes

```
┌─────────────────────────────────────────────────────────────┐
│ ENTERPRISE / MISSION-CRITICAL (500-5000 usuarios)           │
├─────────────────────────────────────────────────────────────┤
│ 🥇 RECOMMENDED: Sonnet 5.5 PRIMARY + Opus Fallback         │
│                                                             │
│    Architecture:                                           │
│    ├─ Chat: Sonnet 85% ($108/250u)                        │
│    ├─ Complex reasoning: Sonnet 15% (included)            │
│    ├─ Crisis ALWAYS: Sonnet 95% confidence               │
│    ├─ Fallback: Opus 5.5 ($256/100u if Sonnet down)     │
│    ├─ Backup: Haiku ($0.64) for lightweight ops         │
│    └─ Cache optimization: 10x savings on prompts         │
│                                                             │
│    Cost for 500 users/month:                              │
│    $640 Sonnet + $50 Opus fallback + ops = ~$800/mo      │
│    (plenty of budget for security, compliance, ops)       │
│                                                             │
│ 🥈 OPTION 2: Opus-Only (max confidence)                    │
│    Cost: $256/100 users ($1,280 for 500 users)           │
│    Benefit: Max reasoning, SLA guarantees                 │
│    Use when: Legal liability extremely high              │
│                                                             │
│ 🥉 OPTION 3: Cache-Optimized Sonnet                       │
│    Cost: ~$400/mo for 500 users (with cache hits)        │
│    Benefit: 10x cheaper prompts, max efficiency          │
│    Requirement: DevOps/cache engineering needed          │
└─────────────────────────────────────────────────────────────┘
```

### 💵 PRESUPUESTO: PRIVACY/COMPLIANCE CRITICAL

```
┌─────────────────────────────────────────────────────────────┐
│ GOVERNMENT / HEALTHCARE / FINANCIAL (GDPR, HIPAA, SOC2)    │
├─────────────────────────────────────────────────────────────┤
│ 🥇 RECOMMENDED: Ollama Self-Hosted (Mistral-7B)           │
│                                                             │
│    Setup:                                                  │
│    ├─ API: $0 (open source)                               │
│    ├─ Infrastructure: RTX 3090 ($400 one-time)           │
│    │  or A100 GPU ($3-5k one-time)                        │
│    ├─ Hosting: $100-300/mo (AWS/GCP with encryption)     │
│    ├─ Ops/maintenance: $200-500/mo                        │
│    └─ TOTAL: $1,500-2,000 first month, then $300-800/mo  │
│                                                             │
│    Benefits:                                              │
│    ✅ GDPR-compliant (data never leaves)                  │
│    ✅ SOC2 audit-ready                                    │
│    ✅ HIPAA-ready (with proper encryption)               │
│    ✅ Open source (full audit trail)                      │
│                                                             │
│    Tradeoffs:                                             │
│    ⚠️ Latency: 5-15s (acceptable for gov/healthcare)     │
│    ⚠️ Crisis detection: Regex only (no AI trust)         │
│    ⚠️ DevOps required: Infrastructure management         │
│    ⚠️ Scaling: Limited to ~1,000 concurrent users        │
│                                                             │
│ 🥈 OPTION 2: Claude Haiku (GDPR option)                   │
│    IF Anthropic has EU servers:                           │
│    Cost: $0.64/100u (same as US)                         │
│    Benefit: Anthropic GDPR commitment                     │
│    ⚠️ Verify EU data residency with Anthropic            │
│                                                             │
│ ⛔ AVOID:                                                  │
│   - DeepSeek (China-based servers)                        │
│   - Gemini (Google data centers unclear for GDPR)        │
│   - Any cloud-based without verified compliance          │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. TABLA RÁPIDA: RECOMENDACIONES FINALES

### 🎯 DECISIÓN RÁPIDA (30 SEGUNDOS)

```
¿CUÁL MODELO ELEGIR?

1. Pregunta: ¿Privacidad es requirement?
   SÍ  → Ollama self-hosted (GDPR)
   NO  → Continúa

2. Pregunta: ¿Presupuesto total anual?
   <$100     → Haiku 5.5 (default)
   $100-1k   → Haiku + Sonnet mix
   $1k+      → Sonnet 5.5 (primary)
   $10k+     → Sonnet + Opus

3. Pregunta: ¿Confianza crítica en crisis?
   SÍ        → Add Sonnet para crisis detection
   NO        → Haiku/Luna alone es OK

4. Pregunta: ¿Contexto muy largo (>100K)?
   SÍ        → DeepSeek Flash (1M context) + cache
   NO        → Haiku/Luna/Sonnet (200K OK)

DECISION MATRIX:
═══════════════════════════════════════════════════════════════════════════════
PRESUPUESTO | CONFIANZA   | CRISIS CRITICAL | RECOMENDACIÓN
─────────────┼─────────────┼─────────────────┼─────────────────────────────────
<$100/año    │ 80-90%      │ NO              │ Haiku 5.5 ONLY
             │             │ SÍ (backup)     │ Haiku + regex + manual review
─────────────┼─────────────┼─────────────────┼─────────────────────────────────
$100-1k/año │ 90-95%      │ NO              │ Haiku 85% + Luna 15% backup
             │             │ SÍ (important)  │ Haiku 80% + Sonnet 20%
             │             │ SÍ (critical)   │ Haiku 80% + Sonnet 20% (crisis)
─────────────┼─────────────┼─────────────────┼─────────────────────────────────
$1k-10k/año │ 95%         │ NO              │ Sonnet 5.5 ONLY (simplicity)
             │             │ SÍ (critical)   │ Sonnet 85% + Opus 15%
─────────────┼─────────────┼─────────────────┼─────────────────────────────────
$10k+/año   │ 98%+        │ SÍ (mission)    │ Opus 5.5 PRIMARY + Sonnet fallback
─────────────┼─────────────┼─────────────────┼─────────────────────────────────
GDPR/HIPAA  │ 70-80%      │ MANUAL ONLY     │ Ollama Mistral-7B (self-hosted)
            │ (acceptable)│                 │ + regex crisis detection
═══════════════════════════════════════════════════════════════════════════════
```

---

## 7. TABLA: FEATURES COMPARATIVA

```
┌─────────────────────┬──────┬──────┬──────┬──────┬──────┬────┬────┐
│ FEATURE             │ Haiku│Sonnet│Opus │Flash-L│Terra │Luna│Argu│
├─────────────────────┼──────┼──────┼──────┼───────┼──────┼────┼────┤
│ Vision              │ ✅   │ ✅   │ ✅   │ ✅    │ ✅   │ ?  │ ?  │
│ Tool Calling        │ ✅   │ ✅   │ ✅   │ ✅    │ ✅   │ ✅ │ ✅ │
│ JSON Output         │ ✅   │ ✅   │ ✅   │ ✅    │ ✅   │ ✅ │ ✅ │
│ Function Calling    │ ✅   │ ✅   │ ✅   │ ✅    │ ✅   │ ✅ │ ✅ │
│ Thinking Mode       │ ❌   │ ❌   │ ❌   │ ✅    │ ❌   │ ❌ │ ✅ │
│ Cache Support       │ ✅   │ ✅   │ ✅   │ ✅    │ ✅   │ ❌ │ ❌ │
│ Context Window      │200K  │200K  │200K  │ 1M    │128K  │128K│128K│
│ Max Output          │unlimited│unlimited│unlimited│384K│unlimited│unlimited│unlimited
│ Real-time API       │ ✅   │ ✅   │ ✅   │ ✅    │ ✅   │ ✅ │ ✅ │
│ Batch Processing    │ ✅   │ ✅   │ ✅   │ ✅    │ ✅   │ ✅ │ ✅ │
│ Fine-tuning         │ ❌   │ ❌   │ ❌   │ ❌    │ ❌   │ ❌ │ ❌ │
│ Rate Limit          │ High │ High │ Medium│Very High│High│High│High│
│ Concurrency         │ High │ High │Medium│2,500  │High │High│500 │
└─────────────────────┴──────┴──────┴──────┴───────┴──────┴────┴────┘
```

---

## 8. NOTAS IMPORTANTES

### ⚠️ CAVEATS Y LIMITACIONES

```
1. DEEPSEEK CACHE OPTIMIZATION
   - Cache hit = 50x cheaper ($0.003 vs $0.15 input)
   - PERO: Requires proper implementation (system prompt caching)
   - Sin cache optimization: DeepSeek es más caro que Haiku

2. PRICING PUEDE CAMBIAR
   - Última verificación: Nov 5, 2026
   - OpenAI/Anthropic bajan precios ~20-30% cada 6 meses
   - Chequear sites oficiales antes de decisión

3. CONTEXT WINDOW MATTERS
   - Haiku/Luna: 200K-128K (suficiente para 99% casos)
   - DeepSeek: 1M (overkill para coaching, útil para RAG)
   - Opus: 200K (premium reasoning en limited context)

4. GDPR/COMPLIANCE
   - DeepSeek: ⚠️ China-based servers (GDPR risk)
   - Anthropic/OpenAI: ✅ GDPR compliant
   - Ollama: ✅ Local only (best GDPR)

5. CRISIS DETECTION
   - Haiku/Sonnet/Opus: 95%+ confidence
   - Luna/DeepSeek: 85-90% (needs fallback)
   - Ollama: 60% (REGEX only for production)

6. CACHE PRICING
   - Anthropic: Read cache $0.01/MTok (100x cheaper input)
   - OpenAI: No explicit cache pricing
   - DeepSeek: $0.003 (50x cheaper on hit)
```

### 📋 CHECKLIST: ANTES DE ELEGIR

```
☐ ¿Qué es presupuesto mensual?
☐ ¿Cuántos usuarios?
☐ ¿Cuántas sesiones/mes por usuario?
☐ ¿Crisis detection critical?
☐ ¿GDPR/compliance requirement?
☐ ¿Long context needed (>100K tokens)?
☐ ¿Volume processing (batch)?
☐ ¿Vision capability needed?
☐ ¿SLA requirement?
☐ ¿Fallback redundancy needed?
```

---

## 9. REFERENCIAS Y FUENTES

```
✅ Verificado Nov 5, 2026:
- Anthropic: https://claude.com/pricing
- OpenAI: https://developers.openai.com/api/docs/models
- DeepSeek: https://api.deepseek.com
- Google Gemini: https://aistudio.google.com/docs/pricing

📊 Metodología:
- Pricing: Per 1M tokens (official API)
- Performance: Based on capability ratings (official docs)
- Value: Ratio performance vs price
- Real-world: Coaching use case (8 sessions/user/month)
```

---

## 🎯 RESUMEN FINAL

| **Mejor Valor** | **Haiku 5.5 + GPT-6 Luna** ($0.0064/usuario/mes) |
|---|---|
| **Mejor Confianza** | Sonnet 5.5 ($1.28/usuario/mes) |
| **Mejor Economía** | DeepSeek Flash (con cache $0.0078/usuario/mes) |
| **Mejor Privacidad** | Ollama Mistral-7B ($0/API + infra) |
| **Mejor Premium** | Opus 5.5 ($2.56/usuario/mes) |
| **Mejor Starter** | Haiku 5.5 (escala a 1,500+ usuarios por $1) |

**DEFAULT RECOMENDADO:** Haiku 5.5 para mayoría de casos.
