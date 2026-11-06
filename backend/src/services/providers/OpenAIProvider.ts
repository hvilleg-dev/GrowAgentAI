import OpenAI from 'openai';
import { ILLMProvider } from '@/types/providers';
import { ProviderError } from '@/errors/AppError';
import { LIMITES_COSTO } from '@/constants/coaching';

export class OpenAIProvider implements ILLMProvider {
  name = 'openai' as const;
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4-mini') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async getCompletion(prompt: string, context?: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: context || 'Eres un coach profesional de GROW framework.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1024
      });

      if (!response.choices[0].message.content) {
        throw new Error('No content in response');
      }

      return response.choices[0].message.content;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        const retryable = error.status === 429 || error.status === 500;
        throw new ProviderError('openai', error.message, error.status, retryable);
      }
      throw error;
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
      });

      return response.data[0].embedding;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new ProviderError('openai', error.message, error.status);
      }
      throw error;
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens * LIMITES_COSTO.OPENAI_GPT_4_MINI_INPUT) +
           (outputTokens * LIMITES_COSTO.OPENAI_GPT_4_MINI_OUTPUT);
  }
}
