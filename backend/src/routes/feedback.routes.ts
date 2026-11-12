import { Router, Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { authMiddleware } from '@/middleware/auth.middleware';

export function createFeedbackRoutes(): Router {
  const feedbackRouter = Router();

  feedbackRouter.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, timestamp } = req.body;
      const userId = (req as any).userId;

      if (!message || !message.trim()) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      // Capture feedback as Sentry event
      Sentry.captureMessage(message, {
        level: 'info',
        tags: {
          type: 'user_feedback',
          userId,
          timestamp
        },
        contexts: {
          feedback: {
            userId,
            message: message.substring(0, 500),
            receivedAt: new Date(timestamp).toISOString()
          }
        }
      });

      res.json({ success: true, message: 'Feedback received successfully' });
    } catch (error) {
      console.error('Error processing feedback:', error);
      next(error);
    }
  });

  return feedbackRouter;
}
