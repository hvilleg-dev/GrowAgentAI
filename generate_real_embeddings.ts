import OpenAI from 'openai';
import { Pool } from 'pg';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

interface Chunk {
  id: string;
  contenido: string;
  idioma: string;
  archivo: string;
}

async function generateEmbeddings() {
  try {
    console.log('📚 Fetching chunks without embeddings...');

    const result = await pool.query(
      'SELECT id, contenido, idioma, archivo FROM knowledge_chunks WHERE vector IS NULL ORDER BY archivo'
    );

    const chunks: Chunk[] = result.rows;
    console.log(`Found ${chunks.length} chunks needing real embeddings\n`);

    if (chunks.length === 0) {
      console.log('✅ All chunks already have embeddings');
      await pool.end();
      return;
    }

    const BATCH_SIZE = 20;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, Math.min(i + BATCH_SIZE, chunks.length));
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);
      
      console.log(`🔄 Batch ${batchNum}/${totalBatches}: ${batch.length} chunks`);

      const texts = batch.map(c => c.contenido);

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts
      });

      console.log(`   📤 Generated ${response.data.length} embeddings from OpenAI API`);

      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        const embedding = response.data[j].embedding;
        const vectorStr = `[${embedding.join(',')}]`;

        await pool.query(
          'UPDATE knowledge_chunks SET vector = $1::vector WHERE id = $2',
          [vectorStr, chunk.id]
        );

        console.log(`   ✅ ${chunk.archivo.substring(0, 30)}: ${chunk.idioma}`);
      }

      console.log(`   ✨ Batch ${batchNum} complete\n`);
    }

    // Final verification
    const verify = await pool.query(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN vector IS NOT NULL THEN 1 END) as with_vectors FROM knowledge_chunks'
    );

    const { total, with_vectors } = verify.rows[0];
    console.log(`\n🎉 SUCCESS: ${with_vectors}/${total} chunks now have REAL OpenAI embeddings!`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateEmbeddings();
