import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '@/database/db';
import { Sesion, Usuario } from '@/database/entities';
import { NotFoundError } from '@/errors/AppError';
import { validateData, schemas } from '@/utils/validators';

export class SessionController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body: any = await validateData(req.body, schemas.createSession);

      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepo.findOne({ where: { id: body.usuarioId as string } });

      if (!usuario) {
        throw new NotFoundError('Usuario');
      }

      const sesionRepo = AppDataSource.getRepository(Sesion);
      const sesion = new Sesion();
      sesion.id = uuidv4();
      sesion.usuarioId = body.usuarioId as string;
      sesion.objetivo = body.objetivo as string;
      sesion.criadaEn = new Date();
      sesion.actualizadaEn = new Date();

      const saved = await sesionRepo.save(sesion);

      res.status(201).json({
        id: saved.id,
        etapaActual: saved.etapaActual,
        objetivo: saved.objetivo,
        criadaEn: saved.criadaEn
      });
    } catch (error) {
      next(error);
    }
  }

  async getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sesionId } = req.params;

      const sesionRepo = AppDataSource.getRepository(Sesion);
      const sesion = await sesionRepo.findOne({
        where: { id: sesionId },
        relations: ['mensajes', 'alertas']
      });

      if (!sesion) {
        throw new NotFoundError('Sesión');
      }

      res.json(sesion);
    } catch (error) {
      next(error);
    }
  }

  async listSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { usuarioId } = req.params;

      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepo.findOne({ where: { id: usuarioId } });

      if (!usuario) {
        throw new NotFoundError('Usuario');
      }

      const sesionRepo = AppDataSource.getRepository(Sesion);
      const sesiones = await sesionRepo.find({
        where: { usuarioId },
        order: { criadaEn: 'DESC' }
      });

      res.json(sesiones);
    } catch (error) {
      next(error);
    }
  }

  async endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sesionId } = req.params;

      const sesionRepo = AppDataSource.getRepository(Sesion);
      const sesion = await sesionRepo.findOne({ where: { id: sesionId } });

      if (!sesion) {
        throw new NotFoundError('Sesión');
      }

      sesion.finalizadaEn = new Date();
      sesion.actualizadaEn = new Date();

      await sesionRepo.save(sesion);

      res.json({ mensaje: 'Sesión finalizada', sesion });
    } catch (error) {
      next(error);
    }
  }
}
