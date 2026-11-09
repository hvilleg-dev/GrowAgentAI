import OpenAI from 'openai';
import { AppDataSource } from '@/database/db';
import logger from './logger';

let openai: OpenAI | null = null;
const embeddingCache = new Map<string, number[]>();

function getOpenAIClient(): OpenAI {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }
  return openai;
}

export interface KnowledgeChunk {
  archivo: string;
  seccion: string;
  contenido: string;
  similarity: number;
}

async function getEmbedding(text: string): Promise<number[]> {
  const cacheKey = text.substring(0, 100);
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  // If OpenAI API key missing, use dummy embedding for testing
  if (!process.env.OPENAI_API_KEY) {
    const seed = text.charCodeAt(0) || 0;
    const dummy = [0.2 + (seed % 10) / 100, 0.3, 0.4, 0.5, 0.6];
    const embedding = dummy.concat(Array(1531).fill(0.01));
    embeddingCache.set(cacheKey, embedding);
    return embedding;
  }

  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });

  const embedding = response.data[0].embedding;
  embeddingCache.set(cacheKey, embedding);
  return embedding;
}

export async function searchKnowledge(
  query: string,
  idioma: string = 'es',
  topK: number = 3
): Promise<KnowledgeChunk[]> {
  try {
    // Generate query embedding
    const queryEmbedding = await getEmbedding(query);

    // Search using cosine similarity
    const result = await AppDataSource.query(
      `SELECT archivo, seccion, contenido,
              1 - (vector <=> $1::vector) as similarity
       FROM knowledge_chunks
       WHERE idioma = $2
       ORDER BY vector <=> $1::vector
       LIMIT $3`,
      [JSON.stringify(queryEmbedding), idioma, topK]
    );

    return result.map((row: any) => ({
      archivo: row.archivo,
      seccion: row.seccion,
      contenido: row.contenido,
      similarity: row.similarity
    }));
  } catch (error) {
    logger.warn('Knowledge search failed:', error);
    return [];
  }
}
