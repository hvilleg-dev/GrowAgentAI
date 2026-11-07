export interface ILLMProvider {
  name: 'claude' | 'openai';
  getCompletion(prompt: string, context?: string): Promise<string>;
  getCompletionWithUsage?(prompt: string, context?: string): Promise<{
    content: string;
    tokensInput: number;
    tokensOutput: number;
    costo: number;
  }>;
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
}

export interface LLMResponse {
  provider: string;
  content: string;
  model: string;
  tokensInput?: number;
  tokensOutput?: number;
  costo?: number;
  timestamp: Date;
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
