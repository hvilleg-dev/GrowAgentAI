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
      console.log('[SessionController.create] validated body:', JSON.stringify(body));

      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepo.findOne({ where: { id: body.usuarioId as string } });

      if (!usuario) {
        throw new NotFoundError('Usuario');
      }

      const sesionId = uuidv4();
      const now = new Date();
      const values = [
        sesionId,
        body.usuarioId,
        body.goalId || null,
        'GOAL',
        body.objetivo || null,
        null, // realidad
        null, // opciones
        null, // voluntad
        null, // resumen
        null, // reflexion
        null, // planAccion
        now,
        now,
        null  // finalizadaEn
      ];

      const query = `
        INSERT INTO sesiones (id, "usuarioId", "goalId", "etapaActual", objetivo, realidad, opciones, voluntad, resumen, reflexion, "planAccion", "criadaEn", "actualizadaEn", "finalizadaEn")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING "etapaActual", "criadaEn", "actualizadaEn", "goalId"
      `;

      const result = await AppDataSource.query(query, values);
      const returned = result[0];

      res.status(201).json({
        id: sesionId,
        etapaActual: returned.etapaActual,
        objetivo: body.objetivo,
        goalId: returned.goalId,
        criadaEn: returned.criadaEn
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
