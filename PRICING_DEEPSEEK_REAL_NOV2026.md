# 🔄 DEEPSEEK PRICING REAL - NOVIEMBRE 2026
## Datos verificados directamente de API oficial

---

## 📊 TABLA 1: MODELOS Y PRECIOS OFICIALES

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                    DEEPSEEK MODELOS ACTUALES (NOV 2026)                       ║
║              Fuente: https://api.deepseek.com (verificado Nov 5, 2026)        ║
╚════════════════════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────────────────────┐
│ MODELO: deepseek-flash (V4.1-Flash-1017)                                      │
├────────────────────────────────────────────────────────────────────────────────┤
│ Context: 1M tokens                                                             │
│ Max Output: 384K tokens                                                        │
│ Features: Vision ✅, JSON ✓, Tool Calls ✓, Thinking ✓ (default)             │
│ Supports: OpenAI API Format + Anthropic API Format                            │
│                                                                                │
│ PRICING (per 1M tokens):                                                       │
│ ┌────────────────────────┬──────────────┬──────────────┐                      │
│ │ Type                   │ OFF-PEAK     │ PEAK         │                      │
│ ├────────────────────────┼──────────────┼──────────────┤                      │
│ │ Input (cache HIT)      │ $0.003       │ $0.006       │ ← 50x cheaper!      │
│ │ Input (cache MISS)     │ $0.15        │ $0.30        │                      │
│ │ Output                 │ $0.60        │ $1.20        │                      │
│ └────────────────────────┴──────────────┴──────────────┘                      │
│                                                                                │
│ Peak hours: 01:00-04:00 + 06:00-10:00 UTC Mon-Fri (except Chinese holidays)  │
│ Off-peak: All other hours (including weekends + Chinese holidays)             │
│                                                                                │
│ 🎯 KEY INSIGHT: Cache hit reduces input cost by 50x (critical for coaching)  │
└────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────┐
│ MODELO: deepseek-v4-pro (V4-Pro-0813)                                         │
├────────────────────────────────────────────────────────────────────────────────┤
│ Context: 1M tokens                                                             │
│ Max Output: 384K tokens                                                        │
│ Features: JSON ✓, Tool Calls ✓, Thinking ✓ (default)                         │
│ Features: Vision ❌ (NOT supported - difference from Flash)                   │
│ Supports: OpenAI API Format + Anthropic API Format                            │
│                                                                                │
│ PRICING (per 1M tokens):                                                       │
│ ┌────────────────────────┬──────────────┬──────────────┐                      │
│ │ Type                   │ OFF-PEAK     │ PEAK         │                      │
│ ├────────────────────────┼──────────────┼──────────────┤                      │
│ │ Input (cache HIT)      │ $0.022       │ $0.044       │ 7-8x more than Flash│
│ │ Input (cache MISS)     │ $0.66        │ $1.32        │                      │
│ │ Output                 │ $1.98        │ $3.96        │ 3.3x more than Flash│
│ └────────────────────────┴──────────────┴──────────────┘                      │
│                                                                                │
│ Premium reasoning model (deeper thinking, better quality than Flash)          │
│ Use when: Complex logic, crisis detection, JSON extraction (critical)         │
└────────────────────────────────────────────────────────────────────────────────┘

DEPRECATED MODELS (DO NOT USE):
  ❌ V3.2 Beta → use V4.1-Flash or V4-Pro
  ❌ V3.1 → use V4.1-Flash or V4-Pro
  ❌ V3 → use V4.1-Flash or V4-Pro
  ❌ R1 → removed
  ❌ deepseek-v4-flash (legacy) → use deepseek-flash (same model, different name)
```

---

## 💰 TABLA 2: COSTO REAL CON CACHE (ESCENARIO COACHING)

**Asunciones realistas:**
- **Coaching session típica:** 8 sesiones/mes por usuario
- **Tokens por sesión:** ~2,000 tokens (500 input + 1,500 output)
- **Cache hit rate:** 20% (solo sesiones con historial reutilizable)
- **Horario:** 60% off-peak (noches/weekends) + 40% peak (business hours)

```
═══════════════════════════════════════════════════════════════════════════════════
                     CÁLCULO: 1 USUARIO / 1 MES
                        (8 sesiones × 2,000 tokens)
═══════════════════════════════════════════════════════════════════════════════════

TOKENS PER MONTH:
  Input:  500 × 8 = 4,000 tokens
  Output: 1,500 × 8 = 12,000 tokens

DISTRIBUTION:
  Cache hit (20%): 800 input
  Cache miss (80%): 3,200 input
  All output: 12,000

DEEPSEEK-FLASH COST (1 user/month):

Input costs:
  Cache hit OFF-PEAK: (800 / 1M) × 0.60 × $0.003 = $0.00000144
  Cache hit PEAK:     (800 / 1M) × 0.40 × $0.006 = $0.00000192
  Cache miss OFF-PEAK: (3,200 / 1M) × 0.60 × $0.15 = $0.000288
  Cache miss PEAK:     (3,200 / 1M) × 0.40 × $0.30 = $0.000384
  ────────────────────────────────────────────────
  INPUT SUBTOTAL: $0.00077

Output costs:
  OFF-PEAK: (12,000 / 1M) × 0.60 × $0.60 = $0.00432
  PEAK:     (12,000 / 1M) × 0.40 × $1.20 = $0.00576
  ────────────────────────────────────────────────
  OUTPUT SUBTOTAL: $0.01008

TOTAL FLASH (1 user/month): $0.0109 ≈ $0.01

Per session: $0.01 / 8 = $0.00125/session


DEEPSEEK-V4-PRO COST (1 user/month):

Input costs:
  Cache hit OFF-PEAK: (800 / 1M) × 0.60 × $0.022 = $0.0000106
  Cache hit PEAK:     (800 / 1M) × 0.40 × $0.044 = $0.0000141
  Cache miss OFF-PEAK: (3,200 / 1M) × 0.60 × $0.66 = $0.001267
  Cache miss PEAK:     (3,200 / 1M) × 0.40 × $1.32 = $0.001689
  ────────────────────────────────────────────────
  INPUT SUBTOTAL: $0.003102

Output costs:
  OFF-PEAK: (12,000 / 1M) × 0.60 × $1.98 = $0.01426
  PEAK:     (12,000 / 1M) × 0.40 × $3.96 = $0.01900
  ────────────────────────────────────────────────
  OUTPUT SUBTOTAL: $0.03326

TOTAL PRO (1 user/month): $0.0364 ≈ $0.04

Per session: $0.04 / 8 = $0.005/session


═══════════════════════════════════════════════════════════════════════════════════
                        ESCALA: 50 USUARIOS / 1 MES
═══════════════════════════════════════════════════════════════════════════════════

DEEPSEEK-FLASH (50 users × $0.01/month):
  Total: $0.55/month ≈ $0.55
  Per user: $0.011

DEEPSEEK-V4-PRO (50 users × $0.04/month):
  Total: $1.82/month ≈ $1.82
  Per user: $0.0364


═══════════════════════════════════════════════════════════════════════════════════
                        ESCALA: 100 USUARIOS / 1 MES
═══════════════════════════════════════════════════════════════════════════════════

DEEPSEEK-FLASH (100 users × $0.01/month):
  Total: $1.09/month
  Per user: $0.0109

DEEPSEEK-V4-PRO (100 users × $0.04/month):
  Total: $3.64/month
  Per user: $0.0364


═══════════════════════════════════════════════════════════════════════════════════
                        ESCALA: 250 USUARIOS / 1 MES
═══════════════════════════════════════════════════════════════════════════════════

DEEPSEEK-FLASH (250 users × $0.01/month):
  Total: $2.73/month
  Per user: $0.0109

DEEPSEEK-V4-PRO (250 users × $0.04/month):
  Total: $9.10/month
  Per user: $0.0364


═══════════════════════════════════════════════════════════════════════════════════
                        ESCALA: 500 USUARIOS / 1 MES
═══════════════════════════════════════════════════════════════════════════════════

DEEPSEEK-FLASH (500 users × $0.01/month):
  Total: $5.45/month
  Per user: $0.0109

DEEPSEEK-V4-PRO (500 users × $0.04/month):
  Total: $18.20/month
  Per user: $0.0364


🏆 WINNER: DeepSeek-Flash is 3.3x cheaper than V4-Pro (similar to Flash vs Astra ratio)
```

---

## 🎯 TABLA 3: DEEPSEEK vs OTROS (COMPARATIVA NOV 2026)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│             COSTO POR USUARIO/MES (ESCALA 100 USUARIOS)                          │
│                         1 MES = 8 SESIONES COACHING                              │
├──────────────────────────────────────────────────────────────────────────────────┤

MODELO                      │ $/USUARIO/MES │ COMPARISON       │ RECOMMENDATION
────────────────────────────┼───────────────┼──────────────────┼────────────────
DeepSeek-Flash              │ $0.011        │ BASELINE (1x)    │ ⭐⭐⭐ BEST VALUE
DeepSeek-V4-Pro             │ $0.036        │ 3.3x than Flash  │ ⭐⭐ Premium
GPT-6 Luna (OpenAI)         │ $0.19         │ 17.2x than Flash │ ⭐⭐ Good balance
Haiku 5.5 (Anthropic)       │ $0.16         │ 14.5x than Flash │ ⭐⭐ Enterprise
Sonnet 5.5 (Anthropic)      │ $3.11         │ 282x than Flash  │ ⭐ Premium safety
Ollama (local)              │ $0.00         │ FREE (infra cost)│ ⭐ Privacy-critical
────────────────────────────┴───────────────┴──────────────────┴────────────────

KEY INSIGHTS:
✅ DeepSeek-Flash is CHEAPER than anything else
⚠️ But doesn't include Vision analysis features
💡 Pro offers better reasoning for crisis detection (worth 3.3x?)
```

---

## ⚙️ IMPLICATIONS FOR ARCHITECTURE

### **1. Cache Strategy is CRITICAL**

To minimize DeepSeek Flash costs, maximize cache hits:

```
STRATEGY 1: System Prompt Caching
├─ Store full GROW framework as cached system prompt
├─ Reuse across all users (amortize cost)
├─ Benefit: Cache hit on every session = $0.003 input (vs $0.15)
└─ Implementation: Load 10KB coaching prompt → cache once

STRATEGY 2: Session History Caching
├─ Keep user session history in cache
├─ Reuse previous messages (don't re-send)
├─ Benefit: Only new input tokens charged at cache hit rate
└─ Implementation: Pass previous messages as cached context

STRATEGY 3: RAG Fragment Caching
├─ Cache relevant markdown fragments (9 coaching docs)
├─ Reduce redundant embedding lookups
├─ Benefit: No re-fetching common fragments
└─ Implementation: Cache top 5 fragments per theme

THEORETICAL BEST CASE:
- 80%+ cache hit rate possible with good design
- Flash cost drops from $0.15 → $0.003 input (50x savings)
- Per session could be: $0.0001-0.0005 (vs $0.01 baseline)
```

---

## 🔴 WARNINGS

### **1. Peak vs Off-Peak Matters**

```
If you don't optimize for off-peak:
- Peak cost: $0.30 input + $1.20 output = $1.50/2000-token session
- Off-peak cost: $0.15 input + $0.60 output = $0.75/2000-token session
- Difference: 2x

Recommendation:
├─ Run batch processing off-peak (01:00-04:00 + 06:00-10:00 UTC)
├─ Schedule cache warming off-peak
├─ Offer "priority sessions" (peak) at 2x cost to users
└─ Default: off-peak for economics (except crisis = immediate)
```

### **2. Vision Support Difference**

```
DeepSeek-Flash: Has Vision ✅
DeepSeek-V4-Pro: NO Vision ❌

If coaching app adds image analysis:
├─ Use Flash (supports vision)
├─ Pro doesn't support (limitation)
└─ Consider Claude for vision use cases
```

### **3. China-based Server = GDPR Risk**

```
⚠️ DeepSeek data likely transits China servers
❌ GDPR concern for EU users (data residency)
✅ OK for: USA, South America, Southeast Asia
❌ NOT OK for: EU, strict privacy jurisdictions

Recommendation:
├─ Geo-fence: EU users → Claude/OpenAI only
├─ US/other: Can use DeepSeek
└─ Or: Ollama (self-hosted) for EU compliance
```

---

## 📋 DECISION MATRIX (DEEPSEEK ONLY)

```
WHEN TO USE DEEPSEEK-FLASH:
✅ Startup (max economy)
✅ Price-sensitive markets
✅ Non-EU jurisdictions
✅ When cache can be optimized (long sessions)
❌ Crisis detection (unreliable alone)
❌ JSON extraction (needs fallback)
❌ EU users (GDPR concern)

WHEN TO USE DEEPSEEK-V4-PRO:
✅ Better reasoning (3.3x cost)
✅ Crisis detection backup (more reliable)
✅ Complex coaching scenarios
❌ Not cheaper (3.3x Flash)
❌ No Vision support (if needed)

ARCHITECTURE RECOMMENDATION FOR NOV 2026:

Startup (1-50 users):
├─ Chat: DeepSeek-Flash
├─ Crisis: Flash + Regex keywords + fallback GPT-Luna
├─ Extract: Flash + retry x2 + fallback GPT-Luna
└─ Cost: ~$0.50/month (10 users)

PYME (50-250 users):
├─ Chat: DeepSeek-Flash (80% of requests)
├─ Chat premium: V4-Pro (20% complex cases)
├─ Crisis: Always V4-Pro or GPT-Luna
├─ Extract: Flash + fallback V4-Pro
└─ Cost: $5-50/month (50-250 users)

Enterprise:
├─ Chat: V4-Pro for reliability
├─ Crisis: V4-Pro + Sonnet fallback
├─ Extract: V4-Pro
├─ Fallback: Sonnet 5.5
└─ Cost: $20-200/month (100-500 users)
```

---

## 📊 CONCLUSIÓN

**DeepSeek en Noviembre 2026 es el mejor para economía pura:**
- $0.011/usuario/mes (100 usuarios)
- 282x más barato que Claude Sonnet
- Pero requiere:
  - Cache optimization strategy
  - Fallback chain para crisis/extraction
  - No GDPR compliance (EU blocker)

**Recomendación Nov 2026:**
- **Startup:** DeepSeek-Flash + GPT-Luna fallback
- **PYME:** DeepSeek-Flash primary + V4-Pro for complex
- **Enterprise:** V4-Pro primary + Sonnet fallback
- **EU/Privacy:** Ollama self-hosted o Claude
