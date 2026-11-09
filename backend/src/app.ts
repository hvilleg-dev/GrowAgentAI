// CRITICAL: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import https from 'https';
import fs from 'fs';
import { initializeDatabase } from '@/database/db';
import { ProviderRouter } from '@/services/ProviderRouter';
import { CrisisDetector } from '@/services/CrisisDetector';
import { createChatRoutes } from '@/routes/chat.routes';
import { createSessionRoutes } from '@/routes/session.routes';
import { createAuthRoutes } from '@/routes/auth.routes';
import { createGoalRoutes } from '@/routes/goal.routes';
import { AppError } from '@/errors/AppError';
import logger from '@/utils/logger';

const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize services
let providerRouter: ProviderRouter;
let crisisDetector: CrisisDetector;

async function initializeServices() {
  try {
    await initializeDatabase();

    const routerConfig = {
      providers: [
        {
          provider: 'claude' as const,
          apiKey: process.env.ANTHROPIC_API_KEY || '',
          model: 'claude-3-5-sonnet-20241022'
        },
        {
          provider: 'openai' as const,
          apiKey: process.env.OPENAI_API_KEY || '',
          model: 'gpt-4o-mini'
        }
      ],
      crisis: {
        enableRegex: true,
        enableAI: true,
        enableManualFlag: true
      }
    };

    providerRouter = new ProviderRouter(routerConfig);
    crisisDetector = new CrisisDetector();

    logger.info('✅ Services initialized');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    throw error;
  }
}

// Health Check Endpoints (must be before error handlers)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    port: PORT
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    port: PORT
  });
});

// API Info Endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'GrowAgentAI Backend v2.0.0',
    status: 'ready',
    endpoints: {
      health: 'GET /health',
      chat: 'POST /api/chat/:sesionId/message',
      sessions: 'POST /api/sessions',
      providers: providerRouter?.getAvailableProviders?.() || []
    }
  });
});

// Start Server
async function start() {
  try {
    await initializeServices();

    // Mount routes BEFORE error handlers
    const authRoutes = createAuthRoutes();
    const chatRoutes = createChatRoutes(providerRouter, crisisDetector);
    const sessionRoutes = createSessionRoutes();
    const goalRoutes = createGoalRoutes();

    app.use('/api/auth', authRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/sessions', sessionRoutes);
    app.use('/api/goals', goalRoutes);

    console.log('[DEBUG] Routes mounted:', {
      auth: '/api/auth',
      chat: '/api/chat',
      sessions: '/api/sessions',
      goals: '/api/goals'
    });

    // Error Handler (after routes so it catches errors from routes)
    app.use((err: any, _req: Request, res: Response, _next: Function) => {
      logger.error('Error:', err);

      if (err instanceof AppError) {
        res.status(err.statusCode).json({
          error: err.message,
          code: err.code
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    });

    // 404 Handler (last so it catches anything not matched by routes)
    app.use((_req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    });

    // Run HTTP only - Caddy reverse proxy handles HTTPS
    const server = app.listen(PORT, 'localhost', () => {
      console.log(`✅ GrowAgentAI Backend running on http://localhost:${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 Caddy proxy forwards HTTPS from growagentai.solucionesvirtuales.net`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
