import { Router } from 'express';
import { SessionController } from '@/controllers/SessionController';

export function createSessionRoutes(): Router {
  const sessionRouter = Router();
  const sessionController = new SessionController();

  sessionRouter.post('/', (req, res, next) =>
    sessionController.create(req, res, next)
  );

  sessionRouter.get('/:sesionId', (req, res, next) =>
    sessionController.getSession(req, res, next)
  );

  sessionRouter.get('/usuario/:usuarioId', (req, res, next) =>
    sessionController.listSessions(req, res, next)
  );

  sessionRouter.post('/:sesionId/end', (req, res, next) =>
    sessionController.endSession(req, res, next)
  );

  return sessionRouter;
}
