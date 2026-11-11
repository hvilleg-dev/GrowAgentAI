import { Router } from 'express';
import { SessionController } from '@/controllers/SessionController';
import { authMiddleware } from '@/middleware/auth.middleware';

export function createSessionRoutes(): Router {
  const sessionRouter = Router();
  const sessionController = new SessionController();

  sessionRouter.post('/', authMiddleware, (req, res, next) =>
    sessionController.create(req, res, next)
  );

  sessionRouter.get('/:sesionId', authMiddleware, (req, res, next) =>
    sessionController.getSession(req, res, next)
  );

  sessionRouter.get('/usuario/:usuarioId', authMiddleware, (req, res, next) =>
    sessionController.listSessions(req, res, next)
  );

  sessionRouter.post('/:sesionId/end', authMiddleware, (req, res, next) =>
    sessionController.endSession(req, res, next)
  );

  sessionRouter.delete('/:sesionId', authMiddleware, (req, res, next) =>
    sessionController.deleteSession(req, res, next)
  );

  sessionRouter.patch('/:sesionId/status', authMiddleware, (req, res, next) =>
    sessionController.updateSessionStatus(req, res, next)
  );

  sessionRouter.post('/:sesionId/pause', authMiddleware, (req, res, next) =>
    sessionController.pauseSession(req, res, next)
  );

  sessionRouter.post('/:sesionId/resume', authMiddleware, (req, res, next) =>
    sessionController.resumeSession(req, res, next)
  );

  sessionRouter.get('/active-device/:usuarioId', authMiddleware, (req, res, next) =>
    sessionController.getActiveDeviceSession(req, res, next)
  );

  sessionRouter.post('/:sesionId/pause-other-device', authMiddleware, (req, res, next) =>
    sessionController.pauseOtherDeviceSession(req, res, next)
  );

  return sessionRouter;
}
