export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ILLMProvider {
  name: 'claude' | 'openai';
  getCompletion(prompt: string, context?: string, history?: ChatMessage[]): Promise<string>;
  estimateCost(inputTokens: number, outputTokens: number): number;
}

export interface ProviderConfig {
  provider: 'claude' | 'openai';
  apiKey: string;
  model: string;
  enabled?: boolean;
}

export interface RouterConfig {
  providers: ProviderConfig[];
  fallbackOrder?: string[];
  enableCostTracking?: boolean;
  maxRetries?: number;
  costLimit?: number;
}

export interface LLMResponse {
  provider: string;
  content: string;
  model: string;
  tokens: {
    input: number;
    output: number;
  };
  cost: number;
  timestamp?: Date;
}

export interface CrisisDetectionRequest {
  text: string;
  enableAI?: boolean;
  enableRegex?: boolean;
  userId?: string;
  sessionId?: string;
}

export interface CrisisDetectionResult {
  level: 'bajo' | 'medio' | 'alto' | 'critico';
  indicator: string;
  confidence?: number;
  detectedAt: Date;
  detectionMethod: 'regex' | 'ai' | 'hybrid';
}
