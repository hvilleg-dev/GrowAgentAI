# 🗄️ Neon pgvector Setup

**Database**: `neondb` on Neon  
**Connection**: Already have `postgresql://...`

---

## Step 1: Go to Neon Console

https://console.neon.tech

## Step 2: Enable pgvector Extension

1. Click your project
2. Click **"SQL Editor"** (left sidebar)
3. Run this SQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

✅ You should see: "Extension created successfully"

## Step 3: Initialize Knowledge Base Schema

In the SQL Editor, run:

```sql
-- Run the entire knowledgeBase.sql script

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
```

✅ Tables and indices created

## Step 4: Verify Knowledge Chunks

Check that all 10 chunks are present:

```sql
SELECT COUNT(*) as total_chunks, 
       COUNT(CASE WHEN vector IS NOT NULL THEN 1 END) as with_vectors
FROM knowledge_chunks;

-- Expected: 10 chunks, 10 with vectors
```

## Step 5: Test Similarity Search

```sql
-- Test cosine similarity search
SELECT archivo, seccion, similarity
FROM (
  SELECT archivo, seccion, 
         1 - (vector <=> '[0.2, 0.3, 0.4, 0.5...]'::vector) as similarity
  FROM knowledge_chunks
  WHERE idioma = 'es'
  ORDER BY vector <=> '[0.2, 0.3, 0.4, 0.5...]'::vector
  LIMIT 3
) results
ORDER BY similarity DESC;
```

✅ Should return 3 most similar chunks

---

## 📊 Database Stats

```sql
-- Check database size
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as db_size;

-- Check table sizes
SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔍 Monitoring

Monitor database health from Neon dashboard:
- **Connections**: Should show 1-2 active from backend
- **CPU**: Should be low (<5% idle)
- **Storage**: Should be < 100MB

---

## ⚠️ Troubleshooting

### "pgvector extension not found"
```sql
-- Try creating it explicitly
CREATE EXTENSION vector;

-- If still fails, contact Neon support
```

### "Vector index creation failed"
```sql
-- Check if extension is really created
SELECT extname FROM pg_extension WHERE extname = 'vector';

-- Recreate indices
DROP INDEX idx_knowledge_chunks_vector;
CREATE INDEX idx_knowledge_chunks_vector ON knowledge_chunks
USING hnsw (vector vector_cosine_ops);
```

### "Slow similarity search"
```sql
-- Check if index is being used
EXPLAIN SELECT * FROM knowledge_chunks 
WHERE vector <=> '[0.1,0.2,...]'::vector 
LIMIT 3;

-- Should show "Index Scan" using hnsw
```

---

## ✅ Verification Checklist

- [ ] pgvector extension created
- [ ] knowledge_chunks table exists
- [ ] All 10 chunks inserted
- [ ] Vectors not NULL for all chunks
- [ ] HNSW indices created
- [ ] Similarity search works

---

**Status**: ✅ Database ready  
**Next**: Test end-to-end (login → chat → RAG context)
