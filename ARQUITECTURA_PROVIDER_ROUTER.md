# 🏗️ ARQUITECTURA: PROVIDER ROUTER (Claude + OpenAI)
## Diseño extensible para agregar DeepSeek/Ollama después

**Status:** Design Document (pseudocódigo)  
**Fecha:** Nov 2026  
**Providers:** Claude (primary) + OpenAI (fallback) + [placeholder DeepSeek/Ollama]

---

## 📋 ÍNDICE

1. [Arquitectura General](#1-arquitectura-general)
2. [Interface Abstracta](#2-interface-abstracta)
3. [Implementación Claude](#3-implementación-claude)
4. [Implementación OpenAI](#4-implementación-openai)
5. [Provider Router](#5-provider-router)
6. [Crisis Detection](#6-crisis-detection)
7. [Cost Tracking](#7-cost-tracking)
8. [Fallback Strategy](#8-fallback-strategy)
9. [Cómo Agregar DeepSeek/Ollama](#9-cómo-agregar-deepseekollama)

---

## 1. ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                      COACHING BACKEND                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  chatController.js                                              │
│    ↓                                                             │
│  providerRouter.js (décide: Haiku vs Sonnet vs OpenAI)         │
│    ↓                                                             │
│  ILLMProvider (interface)                                        │
│    ├─ implementations/claudeProvider.js                         │
│    ├─ implementations/openaiProvider.js                         │
│    ├─ implementations/deepseekProvider.js [FUTURE]             │
│    └─ implementations/ollamaProvider.js [FUTURE]               │
│                                                                 │
│  supportingServices/                                            │
│    ├─ crisisDetector.js (crisis → Sonnet ALWAYS)              │
│    ├─ costTracker.js (monitorear spend)                        │
│    ├─ fallbackHandler.js (Claude falla → OpenAI)              │
│    └─ cacheManager.js (prompt caching)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

FLOW:
1. User message → chatController
2. Router decides: Simple? → Haiku | Complex? → Sonnet | Crisis? → Sonnet
3. Call provider (Claude)
4. If error → fallback (OpenAI)
5. Track cost + response
```

---

## 2. INTERFACE ABSTRACTA

```javascript
// backend/services/providers/ILLMProvider.js
// INTERFAZ: Todos los providers deben implementar esto

interface ILLMProvider {
  // Core chat
  chat(
    messages: Message[],
    systemPrompt: string,
    options?: ProviderOptions
  ): Promise<ChatResponse>;

  // Streaming (para UX de "typing...")
  chatStream(
    messages: Message[],
    systemPrompt: string,
    onChunk: (chunk: string) => void
  ): Promise<ChatResponse>;

  // Classification (para máquina de estados)
  classify(
    etapa: number,
    respuestaUsuario: string,
    context: SessionContext
  ): Promise<ClassificationResult>;

  // JSON extraction (para compromisos)
  extractJSON(
    prompt: string,
    schema: JSONSchema
  ): Promise<ExtractionResult>;

  // Crisis detection
  detectCrisis(
    mensaje: string
  ): Promise<CrisisDetectionResult>;

  // Metadata
  getName(): string;               // "claude-haiku", "gpt-6-luna"
  getModel(): string;              // Full model name
  getMaxTokens(): number;          // Context window
  getCostPerMillion(type: 'input'|'output'): number;
  getLatencyMs(): number;          // Typical response time
}

// Supporting types
type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ChatResponse = {
  text: string;
  tokensInput: number;
  tokensOutput: number;
  model: string;
  latencyMs: number;
  costUSD: number;
};

type ClassificationResult = {
  cumpleCriterio: boolean;
  confianza: number;              // 0-1
  razon: string;
  temaPendiente?: string;
};

type CrisisDetectionResult = {
  detectado: boolean;
  nivel: 'crítico' | 'severo' | null;
  confianza: number;              // 0-1
  palabrasClaveEncontradas: string[];
};
```

---

## 3. IMPLEMENTACIÓN CLAUDE

```javascript
// backend/services/providers/implementations/claudeProvider.js

const Anthropic = require("@anthropic-ai/sdk");

class ClaudeProvider implements ILLMProvider {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(apiKey: string, model: 'haiku' | 'sonnet' | 'opus' = 'haiku') {
    this.client = new Anthropic({ apiKey });
    
    // Map to actual Claude model names
    const modelMap = {
      'haiku': 'claude-3-5-haiku-20241022',
      'sonnet': 'claude-3-5-sonnet-20241022',
      'opus': 'claude-3-opus-20240229'
    };
    
    this.model = modelMap[model];
    this.maxTokens = 4096; // Safe default
  }

  async chat(
    messages: Message[],
    systemPrompt: string,
    options?: ProviderOptions
  ): Promise<ChatResponse> {
    try {
      const startTime = Date.now();
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxOutputTokens || this.maxTokens,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      const latencyMs = Date.now() - startTime;
      const usage = response.usage;
      const text = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';

      const cost = this.calculateCost(usage.input_tokens, usage.output_tokens);

      return {
        text,
        tokensInput: usage.input_tokens,
        tokensOutput: usage.output_tokens,
        model: this.model,
        latencyMs,
        costUSD: cost
      };
    } catch (error) {
      // Log error, let router handle fallback
      logger.error(`Claude error: ${error.message}`);
      throw new ProviderError('claude', error);
    }
  }

  async chatStream(
    messages: Message[],
    systemPrompt: string,
    onChunk: (chunk: string) => void
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    let totalText = '';
    let inputTokens = 0;
    let outputTokens = 0;

    const stream = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemPrompt,
      messages: messages,
      stream: true
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = event.delta.text;
        totalText += chunk;
        onChunk(chunk);
      }
      
      if (event.type === 'message_start') {
        inputTokens = event.message.usage.input_tokens;
      }
      
      if (event.type === 'message_delta') {
        outputTokens = event.usage.output_tokens;
      }
    }

    return {
      text: totalText,
      tokensInput: inputTokens,
      tokensOutput: outputTokens,
      model: this.model,
      latencyMs: Date.now() - startTime,
      costUSD: this.calculateCost(inputTokens, outputTokens)
    };
  }

  async classify(
    etapa: number,
    respuestaUsuario: string,
    context: SessionContext
  ): Promise<ClassificationResult> {
    const prompt = `
    Eres un evaluador de etapas del coaching GROW.
    
    Etapa ${etapa}: ${ETAPAS[etapa]}
    Criterio: ${CRITERIOS_ETAPA[etapa]}
    
    Respuesta del usuario: "${respuestaUsuario}"
    
    Devuelve JSON:
    {
      "cumpleCriterio": true/false,
      "confianza": 0.0-1.0,
      "razon": "explicación breve",
      "temaPendiente": "qué falta explorar"
    }
    `;

    try {
      const response = await this.chat(
        [{ role: 'user', content: prompt }],
        'Eres un experto en coaching. Responde siempre con JSON válido.'
      );

      const result = JSON.parse(response.text);
      return {
        cumpleCriterio: result.cumpleCriterio,
        confianza: result.confianza,
        razon: result.razon,
        temaPendiente: result.temaPendiente
      };
    } catch (error) {
      logger.error(`Claude classification failed: ${error}`);
      throw new ProviderError('claude-classify', error);
    }
  }

  async extractJSON(
    prompt: string,
    schema: JSONSchema
  ): Promise<ExtractionResult> {
    const systemPrompt = `
    Eres un extractor de datos JSON perfecto.
    Devuelve SOLO JSON válido, sin texto adicional.
    Respeta este schema:
    ${JSON.stringify(schema, null, 2)}
    `;

    try {
      const response = await this.chat(
        [{ role: 'user', content: prompt }],
        systemPrompt
      );

      const extracted = JSON.parse(response.text);
      
      return {
        success: true,
        data: extracted,
        confidence: 0.99  // Haiku muy confiable (96%+)
      };
    } catch (error) {
      logger.error(`Claude JSON extraction failed: ${error}`);
      throw new ExtractionError('claude', error);
    }
  }

  async detectCrisis(mensaje: string): Promise<CrisisDetectionResult> {
    const systemPrompt = `
    Eres un detector de crisis especializado en ideación suicida y autolesión.
    Analiza el mensaje y devuelve JSON:
    {
      "detectado": true/false,
      "nivel": "crítico" | "severo" | null,
      "confianza": 0.0-1.0,
      "palabrasClaveEncontradas": ["palabra1", "palabra2"]
    }
    `;

    try {
      const response = await this.chat(
        [{ role: 'user', content: mensaje }],
        systemPrompt
      );

      const result = JSON.parse(response.text);
      return {
        detectado: result.detectado,
        nivel: result.nivel,
        confianza: result.confianza,
        palabrasClaveEncontradas: result.palabrasClaveEncontradas
      };
    } catch (error) {
      logger.error(`Claude crisis detection failed: ${error}`);
      throw new ProviderError('claude-crisis', error);
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    const modelPrices = {
      'claude-3-5-haiku-20241022': { input: 0.10, output: 0.50 },    // per 1M
      'claude-3-5-sonnet-20241022': { input: 2.00, output: 10.00 },
      'claude-3-opus-20240229': { input: 4.00, output: 20.00 }
    };

    const prices = modelPrices[this.model];
    if (!prices) throw new Error(`Unknown model: ${this.model}`);

    const inputCost = (inputTokens / 1_000_000) * prices.input;
    const outputCost = (outputTokens / 1_000_000) * prices.output;
    
    return inputCost + outputCost;
  }

  getName(): string { return 'claude'; }
  getModel(): string { return this.model; }
  getMaxTokens(): number { return 200_000; }
  getCostPerMillion(type: 'input' | 'output'): number {
    const prices = {
      'claude-3-5-haiku-20241022': { input: 0.10, output: 0.50 },
      'claude-3-5-sonnet-20241022': { input: 2.00, output: 10.00 },
      'claude-3-opus-20240229': { input: 4.00, output: 20.00 }
    }[this.model];
    return prices?.[type] || 0;
  }
  getLatencyMs(): number { return 2000; } // Haiku: 1-2s, Sonnet: 2-3s
}

module.exports = ClaudeProvider;
```

---

## 4. IMPLEMENTACIÓN OPENAI

```javascript
// backend/services/providers/implementations/openaiProvider.js

const OpenAI = require("openai");

class OpenAIProvider implements ILLMProvider {
  private client: OpenAI;
  private model: string;
  private maxTokens: number;

  constructor(apiKey: string, model: 'luna' | 'sol' | 'terra' = 'luna') {
    this.client = new OpenAI({ apiKey });
    
    const modelMap = {
      'luna': 'gpt-6-luna',
      'sol': 'gpt-6.1-sol',
      'terra': 'gpt-6.1-terra'
    };
    
    this.model = modelMap[model];
    this.maxTokens = 4096;
  }

  async chat(
    messages: Message[],
    systemPrompt: string,
    options?: ProviderOptions
  ): Promise<ChatResponse> {
    try {
      const startTime = Date.now();
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: options?.maxOutputTokens || this.maxTokens,
        system: systemPrompt,
        messages: messages,
        temperature: 0.7
      });

      const latencyMs = Date.now() - startTime;
      const usage = response.usage;
      const text = response.choices[0].message.content || '';

      const cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens);

      return {
        text,
        tokensInput: usage.prompt_tokens,
        tokensOutput: usage.completion_tokens,
        model: this.model,
        latencyMs,
        costUSD: cost
      };
    } catch (error) {
      logger.error(`OpenAI error: ${error.message}`);
      throw new ProviderError('openai', error);
    }
  }

  async chatStream(
    messages: Message[],
    systemPrompt: string,
    onChunk: (chunk: string) => void
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    let totalText = '';
    
    const stream = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: this.maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      stream: true,
      temperature: 0.7
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        totalText += content;
        onChunk(content);
      }
    }

    // OpenAI no proporciona token count en streaming
    // Estimamos: ~4 caracteres per token
    const estimatedTokens = Math.ceil(totalText.length / 4);

    return {
      text: totalText,
      tokensInput: 0,        // No disponible en stream
      tokensOutput: estimatedTokens,
      model: this.model,
      latencyMs: Date.now() - startTime,
      costUSD: this.estimateCost(estimatedTokens)
    };
  }

  async classify(
    etapa: number,
    respuestaUsuario: string,
    context: SessionContext
  ): Promise<ClassificationResult> {
    // Idéntico a Claude (interface común)
    const prompt = `...`; // Mismo prompt que Claude

    try {
      const response = await this.chat(
        [{ role: 'user', content: prompt }],
        'Eres un experto en coaching. Responde siempre con JSON válido.'
      );

      const result = JSON.parse(response.text);
      return {
        cumpleCriterio: result.cumpleCriterio,
        confianza: result.confianza,
        razon: result.razon,
        temaPendiente: result.temaPendiente
      };
    } catch (error) {
      logger.error(`OpenAI classification failed: ${error}`);
      throw new ProviderError('openai-classify', error);
    }
  }

  async extractJSON(
    prompt: string,
    schema: JSONSchema
  ): Promise<ExtractionResult> {
    // Similar a Claude pero con ajustes OpenAI
    const systemPrompt = `
    Eres un extractor de datos JSON.
    Devuelve SOLO JSON válido.
    Schema: ${JSON.stringify(schema)}
    `;

    try {
      const response = await this.chat(
        [{ role: 'user', content: prompt }],
        systemPrompt
      );

      const extracted = JSON.parse(response.text);
      
      return {
        success: true,
        data: extracted,
        confidence: 0.92  // Luna: 92% reliability (vs Haiku 96%)
      };
    } catch (error) {
      logger.error(`OpenAI JSON extraction failed: ${error}`);
      throw new ExtractionError('openai', error);
    }
  }

  async detectCrisis(mensaje: string): Promise<CrisisDetectionResult> {
    // Similar a Claude pero menos confianza
    const systemPrompt = `
    Detecta ideación suicida o autolesión.
    Devuelve JSON: {
      "detectado": bool,
      "nivel": "crítico|severo|null",
      "confianza": 0-1,
      "palabrasClaveEncontradas": [...]
    }
    `;

    try {
      const response = await this.chat(
        [{ role: 'user', content: mensaje }],
        systemPrompt
      );

      const result = JSON.parse(response.text);
      return {
        detectado: result.detectado,
        nivel: result.nivel,
        confianza: result.confianza * 0.90,  // 90% de confianza de Claude
        palabrasClaveEncontradas: result.palabrasClaveEncontradas
      };
    } catch (error) {
      logger.error(`OpenAI crisis detection failed: ${error}`);
      throw new ProviderError('openai-crisis', error);
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    const modelPrices = {
      'gpt-6-luna': { input: 0.10, output: 0.50 },
      'gpt-6.1-sol': { input: 2.00, output: 10.00 },
      'gpt-6.1-terra': { input: 1.00, output: 5.00 }
    };

    const prices = modelPrices[this.model];
    if (!prices) throw new Error(`Unknown model: ${this.model}`);

    const inputCost = (inputTokens / 1_000_000) * prices.input;
    const outputCost = (outputTokens / 1_000_000) * prices.output;
    
    return inputCost + outputCost;
  }

  getName(): string { return 'openai'; }
  getModel(): string { return this.model; }
  getMaxTokens(): number { return 128_000; }
  getCostPerMillion(type: 'input' | 'output'): number {
    const prices = {
      'gpt-6-luna': { input: 0.10, output: 0.50 },
      'gpt-6.1-sol': { input: 2.00, output: 10.00 },
      'gpt-6.1-terra': { input: 1.00, output: 5.00 }
    }[this.model];
    return prices?.[type] || 0;
  }
  getLatencyMs(): number { return 2500; }
}

module.exports = OpenAIProvider;
```

---

## 5. PROVIDER ROUTER

```javascript
// backend/services/providers/providerRouter.js

const ClaudeProvider = require('./implementations/claudeProvider');
const OpenAIProvider = require('./implementations/openaiProvider');

class ProviderRouter {
  private claude: ClaudeProvider;
  private openai: OpenAIProvider;
  private costTracker: CostTracker;
  private fallbackHandler: FallbackHandler;

  constructor(config: Config) {
    this.claude = new ClaudeProvider(config.anthropic_api_key, 'haiku');
    this.openai = new OpenAIProvider(config.openai_api_key, 'luna');
    this.costTracker = new CostTracker();
    this.fallbackHandler = new FallbackHandler();
  }

  async selectProvider(context: SelectionContext): Promise<ILLMProvider> {
    /*
    LÓGICA DE SELECCIÓN:
    
    1. CRISIS → ALWAYS Sonnet (max confianza 95%)
    2. COMPLEX REASONING → Sonnet
    3. SIMPLE CHAT → Haiku (económico)
    
    Esta lógica es SIMPLE. Agregar DeepSeek/Ollama:
    - Solo cambiar esta función
    - Resto del código no cambia
    */

    // Crisis detection (siempre primero)
    if (context.detectCrisis) {
      logger.info('Crisis detected: using Sonnet (max confidence)');
      return new ClaudeProvider(config.anthropic_api_key, 'sonnet');
    }

    // Complex reasoning (etapas difíciles, extraction, etc)
    if (context.requiresDeepReasoning) {
      logger.info('Complex task: using Sonnet');
      return new ClaudeProvider(config.anthropic_api_key, 'sonnet');
    }

    // Default: simple chat with Haiku (cheap & fast)
    logger.info('Simple chat: using Haiku');
    return this.claude;
  }

  async chat(
    messages: Message[],
    systemPrompt: string,
    context: SelectionContext
  ): Promise<ChatResponse> {
    try {
      // 1. Select provider
      const provider = await this.selectProvider(context);
      
      // 2. Call primary provider
      logger.info(`Calling ${provider.getName()}`);
      const response = await provider.chat(messages, systemPrompt);

      // 3. Track cost
      this.costTracker.recordUsage({
        provider: provider.getName(),
        model: provider.getModel(),
        inputTokens: response.tokensInput,
        outputTokens: response.tokensOutput,
        costUSD: response.costUSD,
        sessionId: context.sessionId,
        userId: context.userId
      });

      return response;

    } catch (error) {
      // 4. FALLBACK: If primary fails, try backup
      logger.error(`Primary provider failed: ${error.message}`);
      
      return await this.fallbackHandler.handle(
        error,
        messages,
        systemPrompt,
        context
      );
    }
  }

  async chatStream(
    messages: Message[],
    systemPrompt: string,
    context: SelectionContext,
    onChunk: (chunk: string) => void
  ): Promise<ChatResponse> {
    try {
      const provider = await this.selectProvider(context);
      const response = await provider.chatStream(messages, systemPrompt, onChunk);

      this.costTracker.recordUsage({
        provider: provider.getName(),
        model: provider.getModel(),
        inputTokens: response.tokensInput,
        outputTokens: response.tokensOutput,
        costUSD: response.costUSD,
        sessionId: context.sessionId,
        userId: context.userId
      });

      return response;
    } catch (error) {
      logger.error(`Stream failed: ${error.message}`);
      throw error; // Streams can't fallback gracefully
    }
  }

  // Debugging: get stats por provider
  async getStats(): Promise<ProviderStats> {
    return this.costTracker.getStats();
  }

  // Debugging: get current model configs
  getProviderInfo(): { claude: string; openai: string } {
    return {
      claude: this.claude.getModel(),
      openai: this.openai.getModel()
    };
  }
}

module.exports = ProviderRouter;
```

---

## 6. CRISIS DETECTION

```javascript
// backend/services/crisisDetector.js

class CrisisDetector {
  private sonnetProvider: ILLMProvider;
  private regexPatterns: Map<string, RegExp>;

  constructor(sonnetProvider: ILLMProvider) {
    this.sonnetProvider = sonnetProvider;  // Always use Sonnet
    this.initializeRegexPatterns();
  }

  private initializeRegexPatterns() {
    this.regexPatterns = new Map([
      [
        'suicidal_ideation',
        /suicid|matarme|morirme|ya no quiero vivir|fin a todo|cortar mis venas|ahorcarm/gi
      ],
      [
        'self_harm',
        /autolesión|cortarme|hacerme daño|quemarme|golpearme/gi
      ],
      [
        'hopelessness',
        /no hay esperanza|todo es inútil|nada importa|soy una carga|mejor sin mí/gi
      ]
    ]);
  }

  async detect(mensaje: string): Promise<CrisisDetectionResult> {
    // 1. REGEX FIRST (fast, 99% coverage for obvious cases)
    const regexResult = this.checkRegex(mensaje);
    
    if (regexResult.detectado && regexResult.confianza > 0.9) {
      logger.warn(`Crisis detected via regex: ${regexResult.nivel}`);
      return regexResult;
    }

    // 2. IF REGEX UNCERTAIN: Ask Sonnet (AI confirmation)
    logger.info('Regex inconclusive, asking Sonnet for confirmation');
    const aiResult = await this.sonnetProvider.detectCrisis(mensaje);

    // 3. COMBINE: Trust higher confidence
    return {
      detectado: aiResult.detectado || regexResult.detectado,
      nivel: aiResult.confianza > 0.8 ? aiResult.nivel : regexResult.nivel,
      confianza: Math.max(aiResult.confianza, regexResult.confianza),
      palabrasClaveEncontradas: [
        ...regexResult.palabrasClaveEncontradas,
        ...aiResult.palabrasClaveEncontradas
      ]
    };
  }

  private checkRegex(mensaje: string): CrisisDetectionResult {
    let maxConfianza = 0;
    let matchedPatterns: string[] = [];

    for (const [name, pattern] of this.regexPatterns) {
      if (pattern.test(mensaje)) {
        matchedPatterns.push(name);
        maxConfianza = Math.max(maxConfianza, 0.85);  // Regex confidence
      }
    }

    return {
      detectado: matchedPatterns.length > 0,
      nivel: maxConfianza > 0.85 ? 'crítico' : null,
      confianza: maxConfianza,
      palabrasClaveEncontradas: matchedPatterns
    };
  }

  async handleCrisis(
    mensaje: string,
    usuarioId: string,
    sesionId: string
  ): Promise<void> {
    // Log (anonymously)
    await db.eventosCrisis.create({
      usuario_anónimo: hashUserId(usuarioId),
      fecha: new Date(),
      tipo: 'ideación suicida',
      nivel: 'crítico',
      registrado: true
    });

    // DO NOT save this session to user history
    await db.sesiones.update(sesionId, {
      estado: 'bloqueada'  // Hidden from user
    });

    // Return crisis protocol
    return CRISIS_PROTOCOLS['crítico'];
  }
}

module.exports = CrisisDetector;
```

---

## 7. COST TRACKING

```javascript
// backend/services/costTracker.js

class CostTracker {
  private db: Database;
  private monthlyBudget: number = 1000;  // $1000/month default
  private alerts: AlertHandler;

  async recordUsage(usage: UsageRecord): Promise<void> {
    // 1. Insert into DB
    await db.tokenUsage.create({
      userId: usage.userId,
      sessionId: usage.sessionId,
      provider: usage.provider,
      model: usage.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costUSD: usage.costUSD,
      timestamp: new Date()
    });

    // 2. Check budget
    const monthlySpend = await this.getMonthlySpend();
    const percentUsed = (monthlySpend / this.monthlyBudget) * 100;

    if (percentUsed > 80) {
      logger.warn(`Cost warning: ${percentUsed.toFixed(1)}% of budget used`);
      this.alerts.send('cost_warning', {
        percentUsed,
        spent: monthlySpend,
        budget: this.monthlyBudget
      });
    }

    if (percentUsed > 100) {
      logger.error(`BUDGET EXCEEDED: ${percentUsed.toFixed(1)}%`);
      this.alerts.send('budget_exceeded', { percentUsed });
      // TODO: Implement circuit breaker (stop processing?)
    }
  }

  async getMonthlySpend(): Promise<number> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const result = await db.tokenUsage.aggregate([
      {
        $match: { timestamp: { $gte: monthStart } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$costUSD' }
        }
      }
    ]);

    return result[0]?.total || 0;
  }

  async getStats(): Promise<ProviderStats> {
    return {
      monthlySpend: await this.getMonthlySpend(),
      monthlyBudget: this.monthlyBudget,
      byProvider: await db.tokenUsage.aggregate([
        {
          $group: {
            _id: '$provider',
            tokens: { $sum: { $add: ['$inputTokens', '$outputTokens'] } },
            cost: { $sum: '$costUSD' },
            requests: { $sum: 1 }
          }
        }
      ])
    };
  }

  async getProviderBreakdown(days: number = 30): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return db.tokenUsage.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: { provider: '$provider', model: '$model' },
          avgLatency: { $avg: '$latencyMs' },
          totalCost: { $sum: '$costUSD' },
          totalRequests: { $sum: 1 },
          avgCostPerRequest: {
            $avg: '$costUSD'
          }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);
  }
}

module.exports = CostTracker;
```

---

## 8. FALLBACK STRATEGY

```javascript
// backend/services/fallbackHandler.js

class FallbackHandler {
  private claude: ILLMProvider;
  private openai: ILLMProvider;
  private maxRetries: number = 2;

  async handle(
    error: Error,
    messages: Message[],
    systemPrompt: string,
    context: SelectionContext
  ): Promise<ChatResponse> {
    logger.error(`Fallback triggered for ${context.sessionId}: ${error.message}`);

    // 1. Determine which provider failed
    const failedProvider = error instanceof ProviderError 
      ? error.provider 
      : 'unknown';

    // 2. Route to backup
    let backupProvider: ILLMProvider;

    if (failedProvider === 'claude') {
      logger.info('Claude failed, trying OpenAI');
      backupProvider = this.openai;
    } else if (failedProvider === 'openai') {
      logger.info('OpenAI failed, trying Claude');
      backupProvider = this.claude;
    } else {
      throw error;  // Can't fallback
    }

    // 3. Try backup (with retry logic)
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`Fallback attempt ${attempt}/${this.maxRetries}`);
        return await backupProvider.chat(messages, systemPrompt);
      } catch (retryError) {
        logger.warn(`Fallback attempt ${attempt} failed: ${retryError}`);
        
        if (attempt === this.maxRetries) {
          logger.error('All fallback attempts exhausted');
          throw new ServiceUnavailableError('All LLM providers failed');
        }

        // Exponential backoff
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = FallbackHandler;
```

---

## 9. CÓMO AGREGAR DEEPSEEK/OLLAMA

### 📝 PASO 1: Crear DeepSeek Provider

```javascript
// backend/services/providers/implementations/deepseekProvider.js
// (No ejecutar aún - template para futuro)

class DeepSeekProvider implements ILLMProvider {
  // Implementar interfaz exactamente igual a Claude/OpenAI
  // Ver templates arriba

  async chat(messages, systemPrompt, options) {
    // Call deepseek API
  }

  // ... resto de métodos
}
```

### 📝 PASO 2: Registrar en ProviderRouter

```javascript
// In providerRouter.js, agregar:

constructor(config: Config) {
  this.claude = new ClaudeProvider(...);
  this.openai = new OpenAIProvider(...);
  // NEW:
  this.deepseek = new DeepSeekProvider(...);
}

async selectProvider(context: SelectionContext) {
  // ... existing logic ...

  // AGREGAR: Option para DeepSeek (ej: para batch processing)
  if (context.useBudgetMode && !context.detectCrisis) {
    return this.deepseek;
  }
}
```

### 📝 PASO 3: Actualizar Config

```javascript
// .env
DEEPSEEK_API_KEY=sk_...
DEEPSEEK_ENABLED=false  // Puedes activar/desactivar

// config.json
{
  "providers": {
    "claude": { "enabled": true, "priority": 1 },
    "openai": { "enabled": true, "priority": 2 },
    "deepseek": { "enabled": false, "priority": 3 }  // Add this
  }
}
```

### ✅ Result:

Todo lo demás funciona sin cambios. El router elige automáticamente.

---

## 📋 RESUMEN IMPLEMENTACIÓN

```
ARCHIVOS A CREAR:
├── services/providers/
│   ├── ILLMProvider.ts (interface)
│   ├── implementations/
│   │   ├── claudeProvider.js (✅ ready)
│   │   ├── openaiProvider.js (✅ ready)
│   │   ├── deepseekProvider.js (📝 template para futuro)
│   │   └── ollamaProvider.js (📝 template para futuro)
│   └── providerRouter.js (✅ ready)
├── services/
│   ├── crisisDetector.js (✅ ready)
│   ├── costTracker.js (✅ ready)
│   ├── fallbackHandler.js (✅ ready)
│   └── cacheManager.js (opcional)
└── controllers/
    └── chatController.js (calls providerRouter)


FLUJO:
1. User message → chatController
2. chatController → providerRouter.selectProvider()
3. Router decides: Haiku? Sonnet? (OpenAI fallback)
4. Provider responds
5. Track cost, log usage
6. If error: fallbackHandler → try backup


EXTENSIBILIDAD:
✅ Agregar DeepSeek: 1 nuevo archivo + 3 líneas en router
✅ Agregar Ollama: 1 nuevo archivo + 3 líneas en router
✅ Cambiar lógica de selección: Editar selectProvider()
✅ NO breaks existing code
```

---

## 🎯 NEXT STEPS

1. ✅ **Design complete** (este documento)
2. ⏳ **Implementación** (pseudocódigo → TypeScript/JS real)
3. ⏳ **Testing** (unit tests per provider)
4. ⏳ **Integration** (con máquina de estados, RAG, etc.)
5. ⏳ **Deployment** (CI/CD, monitoring)

---

## ⚠️ NOTAS IMPORTANTES

- **Crisis detection SIEMPRE Sonnet** (95% confidence obligatorio)
- **Cache no implementado aún** (agregar después)
- **Cost tracking es advisory** (no bloquea, solo alerta)
- **Fallback = 2 intentos** con exponential backoff
- **DeepSeek/Ollama = future-ready** pero NO day-1

---

*Arquitectura preparada para escalar. Solo 2 providers ahora, agregar más sin refactor.*
