import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase } from '@/database/db';
import { ProviderRouter } from '@/services/ProviderRouter';
import { CrisisDetector } from '@/services/CrisisDetector';
import { createChatRoutes } from '@/routes/chat.routes';
import { createSessionRoutes } from '@/routes/session.routes';
import { createAuthRoutes } from '@/routes/auth.routes';
import { AppError } from '@/errors/AppError';
import logger from '@/utils/logger';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

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
          model: 'gpt-4-mini'
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

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
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

    app.use('/auth', authRoutes);
    app.use('/chat', chatRoutes);
    app.use('/api/sessions', sessionRoutes);

    console.log('[DEBUG] Routes mounted:', {
      auth: '/auth',
      chat: '/chat',
      sessions: '/api/sessions'
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

    const server = app.listen(PORT, () => {
      console.log(`✅ GrowAgentAI Backend running on http://localhost:${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`💬 Chat: POST /chat`);
      console.log(`📋 Sessions: POST /api/sessions`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
