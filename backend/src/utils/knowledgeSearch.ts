import OpenAI from 'openai';
import { AppDataSource } from '@/database/db';
import logger from './logger';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const embeddingCache = new Map<string, number[]>();

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

  const response = await openai.embeddings.create({
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
