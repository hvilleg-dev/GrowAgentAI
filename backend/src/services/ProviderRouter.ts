import { ILLMProvider, RouterConfig, LLMResponse } from '@/types/providers';
import { ProviderError } from '@/errors/AppError';
import { ClaudeProvider } from './providers/ClaudeProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import logger from '@/utils/logger';

export class ProviderRouter {
  private providers: Map<string, ILLMProvider> = new Map();
  private config: RouterConfig;
  private costTracker: Map<string, number> = new Map();

  constructor(config: RouterConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    for (const providerConfig of this.config.providers) {
      try {
        if (providerConfig.provider === 'claude') {
          const provider = new ClaudeProvider(
            providerConfig.apiKey,
            providerConfig.model
          );
          this.providers.set('claude', provider);
        } else if (providerConfig.provider === 'openai') {
          const provider = new OpenAIProvider(
            providerConfig.apiKey,
            providerConfig.model
          );
          this.providers.set('openai', provider);
        }
      } catch (error) {
        logger.error(`Failed to initialize ${providerConfig.provider}:`, error);
      }
    }
  }

  async route(
    prompt: string,
    context?: string,
    preferredProvider?: string
  ): Promise<LLMResponse> {
    if (preferredProvider && this.providers.has(preferredProvider)) {
      return this.useProvider(preferredProvider, prompt, context);
    }

    for (const [name] of this.providers) {
      try {
        return await this.useProvider(name, prompt, context);
      } catch (error) {
        logger.warn(`Provider ${name} failed:`, error);
        if (error instanceof ProviderError && !error.retryable) {
          throw error;
        }
        continue;
      }
    }

    throw new Error('All providers failed');
  }

  private async useProvider(
    providerName: string,
    prompt: string,
    context?: string
  ): Promise<LLMResponse> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    const content = await provider.getCompletion(prompt, context);

    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(content.length / 4);
    const cost = provider.estimateCost(inputTokens, outputTokens);

    this.trackCost(providerName, cost);

    return {
      provider: providerName,
      content,
      tokens: { input: inputTokens, output: outputTokens },
      cost,
      model: providerName === 'claude' ? 'claude-3-5-sonnet-20241022' : 'gpt-4-mini'
    };
  }

  private trackCost(provider: string, cost: number): void {
    const current = this.costTracker.get(provider) || 0;
    const updated = current + cost;
    this.costTracker.set(provider, updated);

    if (this.config.costLimit && updated > this.config.costLimit) {
      logger.warn(`Cost limit exceeded for ${provider}: $${updated}`);
    }
  }

  getCostSummary(): Record<string, number> {
    return Object.fromEntries(this.costTracker);
  }

  getTotalCost(): number {
    return Array.from(this.costTracker.values()).reduce((a, b) => a + b, 0);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
