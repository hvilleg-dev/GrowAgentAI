import { Router } from 'express';
import { ChatController } from '@/controllers/ChatController';
import { ProviderRouter } from '@/services/ProviderRouter';
import { CrisisDetector } from '@/services/CrisisDetector';

export function createChatRoutes(router: ProviderRouter, crisisDetector: CrisisDetector): Router {
  const chatRouter = Router();
  const chatController = new ChatController(router, crisisDetector);

  chatRouter.post('/', (req, res, next) =>
    chatController.chat(req, res, next)
  );

  chatRouter.get('/:sessionId', (req, res, next) =>
    chatController.getHistory(req, res, next)
  );

  return chatRouter;
}
