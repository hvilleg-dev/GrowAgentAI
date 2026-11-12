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
      const expiresAt = new Date(now.getTime() + 45 * 60 * 1000); // 45 minutes
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
        null, // finalizadaEn
        'ACTIVE', // status
        expiresAt, // expiresAt
        null, // pausedAt
        0, // pausedDuration
        null, // warningShownAt
        body.deviceId || null // deviceId
      ];

      const query = `
        INSERT INTO sesiones (id, "usuarioId", "goalId", "etapaActual", objetivo, realidad, opciones, voluntad, resumen, reflexion, "planAccion", "criadaEn", "actualizadaEn", "finalizadaEn", status, "expiresAt", "pausedAt", "pausedDuration", "warningShownAt", "deviceId")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *
      `;

      const result = await AppDataSource.query(query, values);
      const returned = result[0];

      res.status(201).json({
        id: returned.id,
        usuarioId: returned.usuarioId,
        goalId: returned.goalId,
        etapaActual: returned.etapaActual,
        objetivo: returned.objetivo,
        realidad: returned.realidad,
        opciones: returned.opciones,
        voluntad: returned.voluntad,
        resumen: returned.resumen,
        reflexion: returned.reflexion,
        planAccion: returned.planAccion,
        criadaEn: returned.criadaEn,
        actualizadaEn: returned.actualizadaEn,
        finalizadaEn: returned.finalizadaEn,
        status: returned.status,
        expiresAt: returned.expiresAt,
        pausedAt: returned.pausedAt,
        pausedDuration: returned.pausedDuration,
        warningShownAt: returned.warningShownAt,
        deviceId: returned.deviceId
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

      // Ensure session has expiresAt and status set
      if (!sesion.expiresAt && sesion.criadaEn) {
        sesion.expiresAt = new Date(new Date(sesion.criadaEn).getTime() + 45 * 60 * 1000);
      }
      if (!sesion.status) {
        sesion.status = 'ACTIVE';
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

      // Ensure all sessions have expiresAt and status set
      const sessionsWithDefaults = sesiones.map(s => {
        const updated: any = { ...s };

        // Set expiresAt if missing
        if (!updated.expiresAt && updated.criadaEn) {
          updated.expiresAt = new Date(new Date(updated.criadaEn).getTime() + 45 * 60 * 1000);
        }

        // Set status if missing - most recent session is ACTIVE, others are CLOSED
        if (!updated.status) {
          updated.status = sesiones[0]?.id === updated.id ? 'ACTIVE' : 'CLOSED';
        }

        return updated;
      });

      res.json(sessionsWithDefaults);
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

  async deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sesionId } = req.params;

      const sesionRepo = AppDataSource.getRepository(Sesion);
      const sesion = await sesionRepo.findOne({ where: { id: sesionId } });

      if (!sesion) {
        res.status(404).json({ error: 'Sesión not found' });
        return;
      }

      // Prevent deleting active session (most recent)
      const allSesiones = await sesionRepo.find({
        where: { usuarioId: sesion.usuarioId },
        order: { criadaEn: 'DESC' }
      });

      if (allSesiones.length > 0 && allSesiones[0].id === sesionId) {
        res.status(400).json({ error: 'Cannot delete active session. Create a new session first.' });
        return;
      }

      // Delete associated messages first
      const mensajeQuery = `
        DELETE FROM mensajes WHERE "sesionId" = $1
      `;
      await AppDataSource.query(mensajeQuery, [sesionId]);

      // Delete associated crisis alerts
      const alertQuery = `
        DELETE FROM alertas_crisis WHERE "sesionId" = $1
      `;
      await AppDataSource.query(alertQuery, [sesionId]);

      // Delete session
      await sesionRepo.remove(sesion);

      res.json({ message: 'Sesión deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateSessionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sesionId } = req.params;
      const { status } = req.body;

      if (!['ACTIVE', 'PAUSED', 'CLOSED'].includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be ACTIVE, PAUSED, or CLOSED' });
        return;
      }

      const sesionRepo = AppDataSource.getRepository(Sesion);
      const sesion = await sesionRepo.findOne({ where: { id: sesionId } });

      if (!sesion) {
        throw new NotFoundError('Sesión');
      }

      sesion.status = status;
      if (status === 'CLOSED') {
        sesion.finalizadaEn = new Date();
      }
      sesion.actualizadaEn = new Date();

      await sesionRepo.save(sesion);

      res.json({ message: 'Session status updated', sesion });
    } catch (error) {
      next(error);
    }
  }

  async pauseSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sesionId } = req.params;

      const sesionRepo = AppDataSource.getRepository(Sesion);
      const sesion = await sesionRepo.findOne({ where: { id: sesionId } });

      if (!sesion) {
        throw new NotFoundError('Sesión');
      }

      sesion.status = 'PAUSED';
      sesion.pausedAt = new Date();
      sesion.actualizadaEn = new Date();

      await sesionRepo.save(sesion);

      res.json({ message: 'Session paused', sesion });
    } catch (error) {
      next(error);
    }
  }

  async resumeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sesionId } = req.params;

      const sesionRepo = AppDataSource.getRepository(Sesion);
      const sesion = await sesionRepo.findOne({ where: { id: sesionId } });

      if (!sesion) {
        throw new NotFoundError('Sesión');
      }

      if (sesion.pausedAt) {
        const pauseDuration = new Date().getTime() - new Date(sesion.pausedAt).getTime();
        sesion.pausedDuration += pauseDuration;
      }

      sesion.status = 'ACTIVE';
      sesion.pausedAt = null;
      sesion.actualizadaEn = new Date();

      await sesionRepo.save(sesion);

      res.json({ message: 'Session resumed', sesion });
    } catch (error) {
      next(error);
    }
  }

  async getActiveDeviceSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { usuarioId } = req.params;
      const currentDeviceId = req.body?.currentDeviceId || null;

      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepo.findOne({ where: { id: usuarioId } });

      if (!usuario) {
        throw new NotFoundError('Usuario');
      }

      const sesionRepo = AppDataSource.getRepository(Sesion);
      const activeSessions = await sesionRepo.find({
        where: { usuarioId, status: 'ACTIVE' },
        order: { criadaEn: 'DESC' }
      });

      if (activeSessions.length === 0) {
        res.json({
          hasActiveSession: false,
          sessionId: null,
          deviceId: null
        });
        return;
      }

      const mostRecentSession = activeSessions[0];

      if (mostRecentSession.deviceId && mostRecentSession.deviceId !== currentDeviceId) {
        const now = new Date();
        const expiresAt = new Date(mostRecentSession.expiresAt);
        let timeRemainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

        // Account for pause duration if session is paused
        if (mostRecentSession.status === 'PAUSED' && mostRecentSession.pausedAt) {
          timeRemainingSeconds = Math.max(0, timeRemainingSeconds + Math.floor(mostRecentSession.pausedDuration / 1000));
        }

        res.json({
          hasActiveSession: true,
          sessionId: mostRecentSession.id,
          deviceId: mostRecentSession.deviceId,
          timeRemainingSeconds,
          status: mostRecentSession.status
        });
      } else {
        res.json({
          hasActiveSession: false,
          sessionId: null,
          deviceId: null,
          timeRemainingSeconds: null,
          status: null
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async pauseOtherDeviceSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sesionId } = req.params;
      const { deviceId, newDeviceId } = req.body; // deviceId = old owner (PC), newDeviceId = new owner (phone)

      const sesionRepo = AppDataSource.getRepository(Sesion);
      const sesion = await sesionRepo.findOne({ where: { id: sesionId } });

      if (!sesion) {
        throw new NotFoundError('Sesión');
      }

      if (sesion.deviceId !== deviceId) {
        res.status(400).json({ error: 'Device ID mismatch - cannot pause session from different device' });
        return;
      }

      sesion.status = 'PAUSED';
      sesion.pausedAt = new Date();
      sesion.actualizadaEn = new Date();
      // Transfer ownership to new device so it can take control
      if (newDeviceId) {
        sesion.deviceId = newDeviceId;
      }

      await sesionRepo.save(sesion);

      res.json({ message: 'Other device session paused', sesion });
    } catch (error) {
      next(error);
    }
  }
}
