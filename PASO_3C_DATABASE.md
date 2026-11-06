# 🗄️ PASO 3C: DATABASE
## Modelos ORM + Migrations SQL

**Duración estimada:** 3-4 días  
**Dependencias:** PASO 3B completado  
**Tech:** TypeORM + PostgreSQL + pgvector

---

## 📋 CHECKLIST PASO 3C

- [ ] Setup TypeORM connection
- [ ] Create migration SQL (001_initial_schema)
- [ ] Create ORM models (8 entities)
- [ ] Setup database module
- [ ] Run migrations locally
- [ ] Seed test data (opcional)
- [ ] Run `npm run build` (debe pasar)
- [ ] Commit: "feat: add database schema and ORM models"

---

## 1. DATABASE/DB.TS - Connection Pool

```typescript
// backend/src/database/db.ts
// PostgreSQL + TypeORM connection setup

import { DataSource } from 'typeorm';
import { logger } from '../utils/logger';

// Import entities
import { Usuario } from './models/Usuario';
import { Sesion } from './models/Sesion';
import { Interaccion } from './models/Interaccion';
import { Compromiso } from './models/Compromiso';
import { Meta } from './models/Meta';
import { CreenciaLimitante } from './models/CreenciaLimitante';
import { EventoCrisis } from './models/EventoCrisis';
import { TokenUsage } from './models/TokenUsage';
import { FragmentoRAG } from './models/FragmentoRAG';

/**
 * Database connection
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  
  // ORM configuration
  entities: [
    Usuario,
    Sesion,
    Interaccion,
    Compromiso,
    Meta,
    CreenciaLimitante,
    EventoCrisis,
    TokenUsage,
    FragmentoRAG,
  ],
  
  // Migrations
  migrations: [
    `${__dirname}/migrations/*.ts`,
  ],
  
  // Development settings
  synchronize: false, // NEVER use sync in production
  logging: process.env.NODE_ENV === 'development',
  
  // Connection pool
  poolSize: 10,
  maxQueryExecutionTime: 30000, // 30s timeout
});

/**
 * Initialize database connection
 */
export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('✅ Database connection established');
    }
  } catch (error) {
    logger.error('❌ Failed to connect to database', error);
    process.exit(1);
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    logger.info('Database connection closed');
  }
}

/**
 * Get repository
 */
export function getRepository<T>(entity: any) {
  return AppDataSource.getRepository(entity);
}

export default AppDataSource;
```

---

## 2. DATABASE/MODELS - Entities (TypeORM)

### 2.1 Usuario.ts

```typescript
// backend/src/database/models/Usuario.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Sesion } from './Sesion';

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  nombre?: string;

  @Column({ type: 'varchar', default: 'es' })
  idioma: 'es' | 'en' | 'pt';

  @Column({ type: 'varchar', nullable: true })
  edad_rango?: string;

  @CreateDateColumn()
  fecha_registro: Date;

  @UpdateDateColumn()
  last_login?: Date;

  // Relations
  @OneToMany(() => Sesion, (sesion) => sesion.usuario)
  sesiones: Sesion[];
}
```

### 2.2 Sesion.ts

```typescript
// backend/src/database/models/Sesion.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Usuario } from './Usuario';
import { Interaccion } from './Interaccion';
import { Compromiso } from './Compromiso';

@Entity('sesiones')
@Index(['usuario_id'])
@Index(['estado'])
export class Sesion {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  usuario_id: string;

  @CreateDateColumn()
  fecha_inicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_fin?: Date;

  @Column({ type: 'varchar', nullable: true })
  tema?: string;

  @Column({ type: 'text', nullable: true })
  objetivo?: string;

  @Column({ type: 'int', default: 1 })
  etapa_actual: number;

  @Column({ type: 'varchar', default: 'activa' })
  estado: 'activa' | 'completada' | 'pausada' | 'bloqueada';

  @Column({ type: 'varchar', nullable: true })
  archivo_raíz?: string;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Usuario, (usuario) => usuario.sesiones)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => Interaccion, (interaccion) => interaccion.sesion, {
    cascade: true,
  })
  interacciones: Interaccion[];

  @OneToMany(() => Compromiso, (compromiso) => compromiso.sesion, {
    cascade: true,
  })
  compromisos: Compromiso[];
}
```

### 2.3 Interaccion.ts

```typescript
// backend/src/database/models/Interaccion.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Sesion } from './Sesion';

@Entity('interacciones')
@Index(['sesion_id'])
@Index(['rol'])
export class Interaccion {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  sesion_id: string;

  @Column({ type: 'varchar' })
  rol: 'usuario' | 'coach';

  @Column({ type: 'text' })
  mensaje: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'int' })
  etapa: number;

  @Column({ type: 'varchar', nullable: true })
  intención?: string;

  @Column({ type: 'varchar', nullable: true })
  fuente_pregunta?: string;

  // Relations
  @ManyToOne(() => Sesion, (sesion) => sesion.interacciones)
  @JoinColumn({ name: 'sesion_id' })
  sesion: Sesion;
}
```

### 2.4 Compromiso.ts

```typescript
// backend/src/database/models/Compromiso.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Sesion } from './Sesion';

@Entity('compromisos')
@Index(['sesion_id'])
@Index(['estado'])
export class Compromiso {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  sesion_id: string;

  @Column({ type: 'text' })
  enunciado: string;

  @Column({ type: 'date' })
  fecha_límite: Date;

  @CreateDateColumn()
  fecha_creación: Date;

  @Column({ type: 'text' })
  indicador_éxito: string;

  @Column({ type: 'simple-array' })
  pasos_concretos: string[];

  @Column({ type: 'simple-array', nullable: true })
  obstáculos_previstos?: string[];

  @Column({ type: 'simple-array', nullable: true })
  recursos_necesarios?: string[];

  @Column({ type: 'varchar', default: 'activo' })
  estado: 'activo' | 'completado' | 'pendiente' | 'fallido';

  @Column({ type: 'varchar', nullable: true })
  dificultad?: 'fácil' | 'medio' | 'difícil';

  @Column({ type: 'text', nullable: true })
  evaluación_final?: string;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Sesion, (sesion) => sesion.compromisos)
  @JoinColumn({ name: 'sesion_id' })
  sesion: Sesion;
}
```

### 2.5 Meta.ts

```typescript
// backend/src/database/models/Meta.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('metas_usuario')
@Index(['usuario_id'])
@Index(['área'])
export class Meta {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  usuario_id: string;

  @Column({ type: 'text' })
  descripción: string;

  @CreateDateColumn()
  fecha_creación: Date;

  @Column({ type: 'date' })
  fecha_meta: Date;

  @Column({ type: 'int', default: 0 })
  progreso: number; // 0-100

  @Column({ type: 'varchar' })
  área: 'carrera' | 'familia' | 'educación' | 'salud' | 'personal' | 'general';

  @Column({ type: 'simple-array', nullable: true })
  hitos?: string[];

  @Column({ type: 'varchar', default: 'activa' })
  estado: 'activa' | 'completada' | 'abandonada';

  @UpdateDateColumn()
  updated_at: Date;
}
```

### 2.6 CreenciaLimitante.ts

```typescript
// backend/src/database/models/CreenciaLimitante.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('creencias_limitantes')
@Index(['usuario_id'])
export class CreenciaLimitante {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  usuario_id: string;

  @Column({ type: 'text' })
  creencia: string;

  @Column('uuid', { nullable: true })
  sesion_origen?: string;

  @CreateDateColumn()
  fecha: Date;

  @Column({ type: 'text', nullable: true })
  contexto?: string;

  @Column({ type: 'boolean', default: false })
  desafiada: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fecha_desafío?: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### 2.7 EventoCrisis.ts

```typescript
// backend/src/database/models/EventoCrisis.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('eventos_crisis')
@Index(['usuario_anónimo'])
export class EventoCrisis {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  usuario_anónimo: string; // hash, NOT real ID

  @CreateDateColumn()
  fecha: Date;

  @Column({ type: 'varchar' })
  tipo: 'ideación_suicida' | 'autolesión' | 'trauma' | 'burnout' | 'depresión';

  @Column({ type: 'varchar' })
  nivel: 'crítico' | 'severo';

  @Column({ type: 'varchar', nullable: true })
  derivado_a?: string;

  @Column({ type: 'boolean', default: true })
  registrado: boolean;
}
```

### 2.8 TokenUsage.ts

```typescript
// backend/src/database/models/TokenUsage.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('token_usage')
@Index(['userId'])
@Index(['provider'])
@Index(['timestamp'])
export class TokenUsage {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  sessionId: string;

  @Column({ type: 'varchar' })
  provider: string; // claude, openai, etc

  @Column({ type: 'varchar' })
  model: string;

  @Column({ type: 'int' })
  inputTokens: number;

  @Column({ type: 'int' })
  outputTokens: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  costUSD: number;

  @Column({ type: 'int', nullable: true })
  latencyMs?: number;

  @CreateDateColumn()
  timestamp: Date;
}
```

### 2.9 FragmentoRAG.ts

```typescript
// backend/src/database/models/FragmentoRAG.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('fragmentos_rag')
@Index(['archivo'])
@Index(['tema'])
export class FragmentoRAG {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  archivo: string;

  @Column({ type: 'varchar' })
  sección: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ type: 'simple-json', nullable: true })
  embedding?: number[];

  @Column({ type: 'varchar' })
  tema: 'carrera' | 'familia' | 'educación' | 'salud' | 'personal' | 'general';
}
```

### 2.10 index.ts - Export all models

```typescript
// backend/src/database/models/index.ts

export { Usuario } from './Usuario';
export { Sesion } from './Sesion';
export { Interaccion } from './Interaccion';
export { Compromiso } from './Compromiso';
export { Meta } from './Meta';
export { CreenciaLimitante } from './CreenciaLimitante';
export { EventoCrisis } from './EventoCrisis';
export { TokenUsage } from './TokenUsage';
export { FragmentoRAG } from './FragmentoRAG';
```

---

## 3. DATABASE/MIGRATIONS - SQL Schema

### 3.1 migrations/001_initial_schema.ts

```typescript
// backend/src/database/migrations/001_initial_schema.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable pgvector extension
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS vector');

    // Create usuarios table
    await queryRunner.query(`
      CREATE TABLE "usuarios" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar UNIQUE NOT NULL,
        "nombre" varchar,
        "idioma" varchar DEFAULT 'es',
        "edad_rango" varchar,
        "fecha_registro" TIMESTAMP DEFAULT NOW(),
        "last_login" TIMESTAMP
      )
    `);
    await queryRunner.query('CREATE INDEX idx_usuarios_email ON usuarios(email)');

    // Create sesiones table
    await queryRunner.query(`
      CREATE TABLE "sesiones" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "usuario_id" uuid NOT NULL REFERENCES usuarios(id),
        "fecha_inicio" TIMESTAMP DEFAULT NOW(),
        "fecha_fin" TIMESTAMP,
        "tema" varchar,
        "objetivo" text,
        "etapa_actual" int DEFAULT 1,
        "estado" varchar DEFAULT 'activa',
        "archivo_raíz" varchar,
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query('CREATE INDEX idx_sesiones_usuario_id ON sesiones(usuario_id)');
    await queryRunner.query('CREATE INDEX idx_sesiones_estado ON sesiones(estado)');

    // Create interacciones table
    await queryRunner.query(`
      CREATE TABLE "interacciones" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sesion_id" uuid NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
        "rol" varchar NOT NULL,
        "mensaje" text NOT NULL,
        "timestamp" TIMESTAMP DEFAULT NOW(),
        "etapa" int,
        "intención" varchar,
        "fuente_pregunta" varchar
      )
    `);
    await queryRunner.query('CREATE INDEX idx_interacciones_sesion_id ON interacciones(sesion_id)');

    // Create compromisos table
    await queryRunner.query(`
      CREATE TABLE "compromisos" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sesion_id" uuid NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
        "enunciado" text NOT NULL,
        "fecha_límite" date NOT NULL,
        "fecha_creación" TIMESTAMP DEFAULT NOW(),
        "indicador_éxito" text NOT NULL,
        "pasos_concretos" text[] NOT NULL,
        "obstáculos_previstos" text[],
        "recursos_necesarios" text[],
        "estado" varchar DEFAULT 'activo',
        "dificultad" varchar,
        "evaluación_final" text,
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query('CREATE INDEX idx_compromisos_sesion_id ON compromisos(sesion_id)');

    // Create metas_usuario table
    await queryRunner.query(`
      CREATE TABLE "metas_usuario" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "usuario_id" uuid NOT NULL REFERENCES usuarios(id),
        "descripción" text NOT NULL,
        "fecha_creación" TIMESTAMP DEFAULT NOW(),
        "fecha_meta" date NOT NULL,
        "progreso" int DEFAULT 0,
        "área" varchar,
        "hitos" text[],
        "estado" varchar DEFAULT 'activa',
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query('CREATE INDEX idx_metas_usuario_id ON metas_usuario(usuario_id)');

    // Create creencias_limitantes table
    await queryRunner.query(`
      CREATE TABLE "creencias_limitantes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "usuario_id" uuid NOT NULL REFERENCES usuarios(id),
        "creencia" text NOT NULL,
        "sesion_origen" uuid,
        "fecha" TIMESTAMP DEFAULT NOW(),
        "contexto" text,
        "desafiada" boolean DEFAULT false,
        "fecha_desafío" TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query('CREATE INDEX idx_creencias_usuario_id ON creencias_limitantes(usuario_id)');

    // Create eventos_crisis table (ANONYMOUS)
    await queryRunner.query(`
      CREATE TABLE "eventos_crisis" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "usuario_anónimo" varchar NOT NULL,
        "fecha" TIMESTAMP DEFAULT NOW(),
        "tipo" varchar NOT NULL,
        "nivel" varchar NOT NULL,
        "derivado_a" varchar,
        "registrado" boolean DEFAULT true
      )
    `);
    await queryRunner.query('CREATE INDEX idx_eventos_crisis_anónimo ON eventos_crisis(usuario_anónimo)');

    // Create token_usage table
    await queryRunner.query(`
      CREATE TABLE "token_usage" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "sessionId" uuid NOT NULL,
        "provider" varchar NOT NULL,
        "model" varchar NOT NULL,
        "inputTokens" int NOT NULL,
        "outputTokens" int NOT NULL,
        "costUSD" decimal(10,4) NOT NULL,
        "latencyMs" int,
        "timestamp" TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query('CREATE INDEX idx_token_usage_userId ON token_usage(userId)');
    await queryRunner.query('CREATE INDEX idx_token_usage_provider ON token_usage(provider)');
    await queryRunner.query('CREATE INDEX idx_token_usage_timestamp ON token_usage(timestamp)');

    // Create fragmentos_rag table
    await queryRunner.query(`
      CREATE TABLE "fragmentos_rag" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "archivo" varchar NOT NULL,
        "sección" varchar NOT NULL,
        "contenido" text NOT NULL,
        "embedding" vector(1536),
        "tema" varchar
      )
    `);
    await queryRunner.query('CREATE INDEX idx_fragmentos_rag_archivo ON fragmentos_rag(archivo)');
    await queryRunner.query('CREATE INDEX idx_fragmentos_rag_tema ON fragmentos_rag(tema)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all tables
    await queryRunner.query('DROP TABLE IF EXISTS "fragmentos_rag"');
    await queryRunner.query('DROP TABLE IF EXISTS "token_usage"');
    await queryRunner.query('DROP TABLE IF EXISTS "eventos_crisis"');
    await queryRunner.query('DROP TABLE IF EXISTS "creencias_limitantes"');
    await queryRunner.query('DROP TABLE IF EXISTS "metas_usuario"');
    await queryRunner.query('DROP TABLE IF EXISTS "compromisos"');
    await queryRunner.query('DROP TABLE IF EXISTS "interacciones"');
    await queryRunner.query('DROP TABLE IF EXISTS "sesiones"');
    await queryRunner.query('DROP TABLE IF EXISTS "usuarios"');
  }
}
```

---

## 4. DATABASE/REPOSITORIES - Data Access Layer

### 4.1 database/repositories/index.ts

```typescript
// backend/src/database/repositories/index.ts
// Repository pattern for data access

import { AppDataSource, getRepository } from '../db';
import * as Models from '../models';

export class Repositories {
  static usuario = () => getRepository(Models.Usuario);
  static sesion = () => getRepository(Models.Sesion);
  static interaccion = () => getRepository(Models.Interaccion);
  static compromiso = () => getRepository(Models.Compromiso);
  static meta = () => getRepository(Models.Meta);
  static creencia = () => getRepository(Models.CreenciaLimitante);
  static crisis = () => getRepository(Models.EventoCrisis);
  static tokenUsage = () => getRepository(Models.TokenUsage);
  static fragmentoRag = () => getRepository(Models.FragmentoRAG);
}

export default Repositories;
```

---

## ✅ VERIFICACIÓN

```bash
# 1. TypeScript compilation
npm run build

# 2. Run migrations (local)
npm run typeorm migration:run

# 3. Verify schema created
psql $DATABASE_URL -c "\dt"  # List tables
psql $DATABASE_URL -c "\d usuarios"  # Describe table

# 4. Si todo OK:
git add src/database/
git commit -m "feat: add database schema, models, and migrations"
```

---

## 📋 ARCHIVOS CREADOS EN PASO 3C

```
src/database/
├── db.ts                    ✅ TypeORM DataSource
├── models/
│   ├── Usuario.ts          ✅ ORM entity
│   ├── Sesion.ts           ✅ ORM entity
│   ├── Interaccion.ts      ✅ ORM entity
│   ├── Compromiso.ts       ✅ ORM entity
│   ├── Meta.ts             ✅ ORM entity
│   ├── CreenciaLimitante.ts ✅ ORM entity
│   ├── EventoCrisis.ts     ✅ ORM entity
│   ├── TokenUsage.ts       ✅ ORM entity
│   ├── FragmentoRAG.ts     ✅ ORM entity
│   └── index.ts            ✅ Export all
├── migrations/
│   └── 001_initial_schema.ts ✅ SQL migration
└── repositories/
    └── index.ts            ✅ Data access layer
```

---

## 🎯 PRÓXIMO PASO

**PASO 3D:** Providers (Claude + OpenAI implementation)

---

*PASO 3C completado. Database schema, models, migrations listos.*
