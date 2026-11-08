import { Router } from 'express';
import { GoalController } from '@/controllers/GoalController';
import { authMiddleware } from '@/middleware/auth.middleware';

export function createGoalRoutes(): Router {
  const goalRouter = Router();
  const goalController = new GoalController();

  goalRouter.post('/', authMiddleware, (req, res, next) =>
    goalController.create(req, res, next)
  );

  goalRouter.get('/:usuarioId', authMiddleware, (req, res, next) =>
    goalController.list(req, res, next)
  );

  goalRouter.get('/:goalId', authMiddleware, (req, res, next) =>
    goalController.getById(req, res, next)
  );

  goalRouter.put('/:goalId', authMiddleware, (req, res, next) =>
    goalController.update(req, res, next)
  );

  goalRouter.delete('/:goalId', authMiddleware, (req, res, next) =>
    goalController.delete(req, res, next)
  );

  return goalRouter;
}
