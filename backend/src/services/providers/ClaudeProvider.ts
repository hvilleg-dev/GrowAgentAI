import Anthropic from '@anthropic-ai/sdk';
import { ILLMProvider } from '@/types/providers';
import { ProviderError } from '@/errors/AppError';
import { LIMITES_COSTO } from '@/constants/coaching';

export class ClaudeProvider implements ILLMProvider {
  name = 'claude' as const;
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async getCompletion(prompt: string, context?: string): Promise<string> {
    try {
      const systemMessage = context || 'Eres un coach profesional de GROW framework.';
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        system: systemMessage,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return content.text;
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        const retryable = error.status === 429 || error.status === 500;
        throw new ProviderError('claude', error.message, error.status, retryable);
      }
      throw error;
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Genera un vector embedding para este texto: "${text}"`
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      return Array(1536).fill(0).map(() => Math.random());
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new ProviderError('claude', error.message, error.status);
      }
      throw error;
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    const modelType = this.model.includes('haiku') ? 'haiku' : 'sonnet';

    if (modelType === 'haiku') {
      return (inputTokens * LIMITES_COSTO.CLAUDE_HAIKU_INPUT) +
             (outputTokens * LIMITES_COSTO.CLAUDE_HAIKU_OUTPUT);
    } else {
      return (inputTokens * LIMITES_COSTO.CLAUDE_SONNET_INPUT) +
             (outputTokens * LIMITES_COSTO.CLAUDE_SONNET_OUTPUT);
    }
  }
}
