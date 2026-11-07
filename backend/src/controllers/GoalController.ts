import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '@/database/db';
import { Goal, Usuario } from '@/database/entities';
import { NotFoundError } from '@/errors/AppError';

export class GoalController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { usuarioId, description, goal, reality, options, will } = req.body;

      if (!usuarioId || !description || !goal || !reality || !options || !will) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepo.findOne({ where: { id: usuarioId } });

      if (!usuario) {
        throw new NotFoundError('Usuario');
      }

      const goalRepo = AppDataSource.getRepository(Goal);
      const newGoal = new Goal();
      newGoal.id = uuidv4();
      newGoal.usuarioId = usuarioId;
      newGoal.description = description;
      newGoal.goal = goal;
      newGoal.reality = reality;
      newGoal.options = Array.isArray(options) ? options : [options];
      newGoal.will = will;
      newGoal.status = 'not_started';

      const saved = await goalRepo.save(newGoal);
      res.status(201).json(saved);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { usuarioId } = req.params;

      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepo.findOne({ where: { id: usuarioId } });

      if (!usuario) {
        throw new NotFoundError('Usuario');
      }

      const goalRepo = AppDataSource.getRepository(Goal);
      const goals = await goalRepo.find({
        where: { usuarioId },
        order: { criadoEn: 'DESC' }
      });

      res.json(goals);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { goalId } = req.params;

      const goalRepo = AppDataSource.getRepository(Goal);
      const goal = await goalRepo.findOne({ where: { id: goalId } });

      if (!goal) {
        throw new NotFoundError('Goal');
      }

      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { goalId } = req.params;
      const { description, goal, reality, options, will, status } = req.body;

      const goalRepo = AppDataSource.getRepository(Goal);
      const existingGoal = await goalRepo.findOne({ where: { id: goalId } });

      if (!existingGoal) {
        throw new NotFoundError('Goal');
      }

      if (description) existingGoal.description = description;
      if (goal) existingGoal.goal = goal;
      if (reality) existingGoal.reality = reality;
      if (options) existingGoal.options = Array.isArray(options) ? options : [options];
      if (will) existingGoal.will = will;
      if (status) existingGoal.status = status;

      const updated = await goalRepo.save(existingGoal);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { goalId } = req.params;

      const goalRepo = AppDataSource.getRepository(Goal);
      const goal = await goalRepo.findOne({ where: { id: goalId } });

      if (!goal) {
        throw new NotFoundError('Goal');
      }

      await goalRepo.remove(goal);
      res.json({ message: 'Goal deleted' });
    } catch (error) {
      next(error);
    }
  }
}
