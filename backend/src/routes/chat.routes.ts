import { Router } from 'express';
import { ChatController } from '@/controllers/ChatController';
import { ProviderRouter } from '@/services/ProviderRouter';
import { CrisisDetector } from '@/services/CrisisDetector';

export function createChatRoutes(router: ProviderRouter, crisisDetector: CrisisDetector): Router {
  const chatRouter = Router();
  const chatController = new ChatController(router, crisisDetector);

  chatRouter.post('/:sesionId/message', (req, res, next) =>
    chatController.sendMessage(req, res, next)
  );

  chatRouter.get('/:sesionId/messages', (req, res, next) =>
    chatController.getMessages(req, res, next)
  );

  return chatRouter;
}
