import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { Pool } from 'pg';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const KB_PATH = path.resolve(__dirname, '../../base_conocimientos');
const BATCH_SIZE = 20;
const CHUNK_SIZE_TOKENS = 400;
const OVERLAP_TOKENS = 100;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not set in .env');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

interface Chunk {
  archivo: string;
  seccion: string;
  contenido: string;
  tokens: number;
  idioma: string;
  vector?: number[];
}

// Tokenize text (approximate: ~4 chars = 1 token)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Split text into semantic chunks
function chunkText(text: string, archivo: string, seccion: string, idioma: string): Chunk[] {
  const chunks: Chunk[] = [];
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);

  let currentChunk = '';
  let currentTokens = 0;

  for (const para of paragraphs) {
    const paraTokens = estimateTokens(para);

    if (currentTokens + paraTokens > CHUNK_SIZE_TOKENS && currentChunk.length > 0) {
      chunks.push({
        archivo,
        seccion,
        contenido: currentChunk.trim(),
        tokens: currentTokens,
        idioma
      });

      // Overlap: reuse last 100 tokens
      const lines = currentChunk.split('\n');
      currentChunk = lines.slice(Math.max(0, lines.length - 3)).join('\n');
      currentTokens = estimateTokens(currentChunk);
    }

    currentChunk += (currentChunk ? '\n\n' : '') + para;
    currentTokens = estimateTokens(currentChunk);
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      archivo,
      seccion: seccion || 'general',
      contenido: currentChunk.trim(),
      tokens: currentTokens,
      idioma
    });
  }

  return chunks;
}

// Read KB files
function readKBFiles(): { idioma: string; archivo: string; contenido: string }[] {
  const files: { idioma: string; archivo: string; contenido: string }[] = [];

  for (const idioma of ['es', 'en']) {
    const dir = path.join(KB_PATH, idioma);
    if (!fs.existsSync(dir)) continue;

    const fileList = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of fileList) {
      const filePath = path.join(dir, file);
      const contenido = fs.readFileSync(filePath, 'utf-8');
      files.push({ idioma, archivo: file, contenido });
    }
  }

  return files;
}

// Generate embeddings batch (max 2048 per request)
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts
  });

  return response.data.map(d => d.embedding);
}

// Process files in parallel batches (2-4 at a time)
async function processFilesParallel(files: ReturnType<typeof readKBFiles>): Promise<Chunk[]> {
  const allChunks: Chunk[] = [];
  const batchSize = 3; // Process 3 files in parallel

  console.log(`📖 Processing ${files.length} files in batches of ${batchSize}...`);

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.map(f => f.archivo).join(', ')}`);

    const batchChunks = await Promise.all(
      batch.map(file => {
        const lines = file.contenido.split('\n');
        let currentSection = 'general';

        const sections: { seccion: string; contenido: string }[] = [];
        let sectionContent = '';

        for (const line of lines) {
          if (line.match(/^#{1,3}\s/)) {
            if (sectionContent.trim()) {
              sections.push({ seccion: currentSection, contenido: sectionContent.trim() });
            }
            currentSection = line.replace(/^#+\s/, '').trim();
            sectionContent = '';
          } else {
            sectionContent += (sectionContent ? '\n' : '') + line;
          }
        }

        if (sectionContent.trim()) {
          sections.push({ seccion: currentSection, contenido: sectionContent.trim() });
        }

        const fileChunks: Chunk[] = [];
        for (const section of sections) {
          const chunks = chunkText(section.contenido, file.archivo, section.seccion, file.idioma);
          fileChunks.push(...chunks);
        }

        return fileChunks;
      })
    );

    allChunks.push(...batchChunks.flat());
  }

  return allChunks;
}

// Save chunks to DB with embeddings
async function saveChunks(chunks: Chunk[]) {
  console.log(`\n💾 Generating ${chunks.length} embeddings...`);

  const chunksWithEmbeddings: Chunk[] = [];

  // Process in batches of 20 for embedding API
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, Math.min(i + BATCH_SIZE, chunks.length));
    console.log(`  Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}...`);

    const embeddings = await generateEmbeddings(batch.map(c => c.contenido));

    batch.forEach((chunk, idx) => {
      chunksWithEmbeddings.push({ ...chunk, vector: embeddings[idx] });
    });
  }

  console.log(`\n📝 Saving ${chunksWithEmbeddings.length} chunks to DB...`);

  for (const chunk of chunksWithEmbeddings) {
    await pool.query(
      `INSERT INTO knowledge_chunks (archivo, seccion, contenido, tokens, vector, idioma)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [chunk.archivo, chunk.seccion, chunk.contenido, chunk.tokens, JSON.stringify(chunk.vector), chunk.idioma]
    );
  }

  console.log(`✅ Seeded ${chunksWithEmbeddings.length} chunks`);
}

// Main
async function main() {
  try {
    // Create table
    console.log('🗄️  Creating knowledge_chunks table...');
    const sql = fs.readFileSync(path.join(__dirname, '../../knowledgeBase.sql'), 'utf-8');
    await pool.query(sql);

    // Read and process files
    const files = readKBFiles();
    console.log(`\n📚 Found ${files.length} knowledge base files`);

    const chunks = await processFilesParallel(files);
    console.log(`\n✂️  Created ${chunks.length} chunks`);

    // Save with embeddings
    await saveChunks(chunks);

    // Verify
    const result = await pool.query('SELECT COUNT(*) FROM knowledge_chunks');
    console.log(`\n✨ Total chunks in DB: ${result.rows[0].count}`);

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

main();
