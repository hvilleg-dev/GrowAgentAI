# Database Schema & ORM

Prisma database models and migration guide.

## Overview

**ORM:** Prisma (database-agnostic)
**Supported Databases:** PostgreSQL (default), Oracle, MySQL
**Schema Location:** `backend/prisma/schema.prisma`

## Core Models

### User Model

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password_hash String
  name          String
  avatar_url    String?
  bio           String?
  language      String   @default("en") // "en" or "es"
  
  // Relationships
  goals         Goal[]
  sessions      Session[]
  
  // Metadata
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
}
```

### Goal Model

```prisma
model Goal {
  id            String       @id @default(cuid())
  user_id       String
  user          User         @relation(fields: [user_id], references: [id])
  
  title         String
  description   String
  grow_stage    String       @default("G") // "G", "R", "O", "W"
  status        String       @default("active") // "active", "completed", "archived"
  progress      Int          @default(0) // 0-100
  
  // Relationships
  milestones    Milestone[]
  sessions      Session[]
  
  // Metadata
  created_at    DateTime     @default(now())
  updated_at    DateTime     @updatedAt
  completed_at  DateTime?
  
  @@index([user_id])
}
```

### Milestone Model

```prisma
model Milestone {
  id            String       @id @default(cuid())
  goal_id       String
  goal          Goal         @relation(fields: [goal_id], references: [id], onDelete: Cascade)
  
  title         String
  description   String?
  order         Int          // Display order
  completed     Boolean      @default(false)
  
  // Metadata
  created_at    DateTime     @default(now())
  completed_at  DateTime?
  
  @@index([goal_id])
}
```

### Session Model

```prisma
model Session {
  id            String       @id @default(cuid())
  user_id       String
  user          User         @relation(fields: [user_id], references: [id])
  goal_id       String?
  goal          Goal?        @relation(fields: [goal_id], references: [id])
  
  title         String
  grow_stage    String       @default("G")
  completed     Boolean      @default(false)
  
  // Relationships
  messages      Message[]
  
  // Metadata
  created_at    DateTime     @default(now())
  updated_at    DateTime     @updatedAt
  completed_at  DateTime?
  
  @@index([user_id, goal_id])
}
```

### Message Model

```prisma
model Message {
  id            String       @id @default(cuid())
  session_id    String
  session       Session      @relation(fields: [session_id], references: [id], onDelete: Cascade)
  
  role          String       // "user" or "assistant"
  content       String       @db.Text
  
  // Token usage
  tokens_input  Int?
  tokens_output Int?
  
  // Metadata
  created_at    DateTime     @default(now())
  
  @@index([session_id])
}
```

### KnowledgeVector Model

```prisma
model KnowledgeVector {
  id            String       @id @default(cuid())
  
  source_file   String       // e.g., "01_marco_agente_coach_es.md"
  title         String
  content       String       @db.Text
  
  // Vector embedding (stored as JSON or PostgreSQL vector)
  embedding     Float[]      // 1536 dimensions for OpenAI
  
  // Metadata
  language      String       // "es" or "en"
  category      String       // Framework type
  
  created_at    DateTime     @default(now())
  
  @@index([language, category])
}
```

## Database Setup

### PostgreSQL

```bash
# Create database
createdb growagentai

# Run migrations
cd backend
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

### Oracle Database

```bash
# Update .env
DATABASE_URL=oracle://user:password@localhost:1521/XE

# Run migrations
cd backend
npx prisma migrate deploy
```

## Migrations

### Create Migration

```bash
# After schema changes
npx prisma migrate dev --name add_user_language

# Review SQL
cat prisma/migrations/[timestamp]_add_user_language/migration.sql

# Deploy to production
npx prisma migrate deploy
```

### View Migrations

```bash
# List all migrations
npx prisma migrate status

# Show migration history
git log prisma/migrations/
```

## Queries with Prisma

### Create

```typescript
// Create user with goals
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password_hash: hashedPassword,
    name: 'John Doe',
    language: 'en',
    goals: {
      create: [
        {
          title: 'Learn TypeScript',
          description: 'Master the basics',
        },
      ],
    },
  },
  include: { goals: true },
});
```

### Read

```typescript
// Get user with all relationships
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    goals: {
      where: { status: 'active' },
      include: { milestones: true },
    },
    sessions: {
      take: 10,
      orderBy: { created_at: 'desc' },
    },
  },
});
```

### Update

```typescript
// Update goal progress
await prisma.goal.update({
  where: { id: goalId },
  data: {
    progress: 45,
    grow_stage: 'O',
  },
});
```

### Delete

```typescript
// Delete goal (cascades to milestones)
await prisma.goal.delete({
  where: { id: goalId },
});
```

## Vector Search

### Store Embeddings

```typescript
// When loading knowledge base
const vectors = await prisma.knowledgeVector.createMany({
  data: documents.map(doc => ({
    source_file: doc.filename,
    title: doc.title,
    content: doc.content,
    embedding: await getEmbedding(doc.content), // OpenAI
    language: doc.language,
    category: doc.category,
  })),
});
```

### RAG Semantic Search

```typescript
// PostgreSQL with pgvector extension
const results = await prisma.$queryRaw`
  SELECT id, title, content, language,
    1 - (embedding <=> ${queryEmbedding}::vector) as similarity
  FROM "KnowledgeVector"
  WHERE language = ${language}
  AND 1 - (embedding <=> ${queryEmbedding}::vector) > 0.7
  ORDER BY similarity DESC
  LIMIT 5
`;
```

## Performance Tips

### Indexes
```prisma
// Already indexed in schema:
@@index([user_id])
@@index([goal_id])
@@index([session_id])
```

### N+1 Query Prevention
```typescript
// Good: Include relationships
await prisma.user.findMany({
  include: { goals: true }
});

// Bad: N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
  user.goals = await prisma.goal.findMany();
}
```

### Pagination
```typescript
const goals = await prisma.goal.findMany({
  where: { user_id: userId },
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { created_at: 'desc' },
});
```

## Backup & Recovery

### PostgreSQL Backup

```bash
# Full backup
pg_dump growagentai > backup.sql

# Restore
psql growagentai < backup.sql

# Docker backup
docker exec postgres_container pg_dump -U user growagentai > backup.sql
```

## Monitoring

### Check Connections

```bash
# PostgreSQL
psql growagentai -c "SELECT count(*) FROM pg_stat_activity;"

# Connection pool
# Check backend logs for connection pool size
```

## References

- [Prisma Docs](https://www.prisma.io/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Oracle Database](https://www.oracle.com/database/)
- [Vector Search](./09_SECURITY.md#vector-search-security)

---

[Back to Docs](00_START_HERE.md)
