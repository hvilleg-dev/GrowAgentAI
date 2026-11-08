-- Knowledge base chunks table with pgvector support
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archivo VARCHAR(255) NOT NULL,
  seccion VARCHAR(500),
  contenido TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  vector vector(1536),
  idioma CHAR(2) NOT NULL DEFAULT 'es',
  "criadoEn" TIMESTAMP DEFAULT NOW()
);

-- HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_vector ON knowledge_chunks
USING hnsw (vector vector_cosine_ops);

-- Composite index for language + archivo lookup
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_idioma_archivo ON knowledge_chunks (idioma, archivo);
