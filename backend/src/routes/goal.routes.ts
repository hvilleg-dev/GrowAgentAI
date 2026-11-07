import { Router } from 'express';
import { GoalController } from '@/controllers/GoalController';

export function createGoalRoutes(): Router {
  const goalRouter = Router();
  const goalController = new GoalController();

  goalRouter.post('/', (req, res, next) =>
    goalController.create(req, res, next)
  );

  goalRouter.get('/usuario/:usuarioId', (req, res, next) =>
    goalController.list(req, res, next)
  );

  goalRouter.get('/:goalId', (req, res, next) =>
    goalController.getById(req, res, next)
  );

  goalRouter.put('/:goalId', (req, res, next) =>
    goalController.update(req, res, next)
  );

  goalRouter.delete('/:goalId', (req, res, next) =>
    goalController.delete(req, res, next)
  );

  return goalRouter;
}
