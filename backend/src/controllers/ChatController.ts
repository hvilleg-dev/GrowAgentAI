import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ProviderRouter } from '@/services/ProviderRouter';
import { CrisisDetector } from '@/services/CrisisDetector';
import { AppDataSource } from '@/database/db';
import { Sesion, Mensaje, Usuario } from '@/database/entities';
import { NotFoundError } from '@/errors/AppError';

export class ChatController {
  constructor(
    private router: ProviderRouter,
    private crisisDetector: CrisisDetector
  ) {}

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, userId, message } = req.body;

      if (!sessionId || !userId || !message) {
        res.status(400).json({
          error: 'Missing required fields: sessionId, userId, message'
        });
        return;
      }

      const startTime = Date.now();
      const sesionRepo = AppDataSource.getRepository(Sesion);
      const mensajeRepo = AppDataSource.getRepository(Mensaje);
      const usuarioRepo = AppDataSource.getRepository(Usuario);

      // Verify session exists
      const sesion = await sesionRepo.findOne({ where: { id: sessionId } });
      if (!sesion) {
        throw new NotFoundError('Sesión');
      }

      // Verify user exists
      const usuario = await usuarioRepo.findOne({ where: { id: userId } });
      if (!usuario) {
        throw new NotFoundError('Usuario');
      }

      // Crisis detection
      const crisisResult = await this.crisisDetector.detectCrisis(message);
      this.crisisDetector.throwIfCrisis(crisisResult);

      // Save user message
      const userMessage = new Mensaje();
      userMessage.id = uuidv4();
      userMessage.sesionId = sessionId;
      userMessage.rol = 'usuario';
      userMessage.contenido = message;
      userMessage.criadoEn = new Date();
      await mensajeRepo.save(userMessage);

      // Get AI response
      const response = await this.router.route(message);

      // Save coach message
      const coachMessage = new Mensaje();
      coachMessage.id = uuidv4();
      coachMessage.sesionId = sessionId;
      coachMessage.rol = 'coach';
      coachMessage.contenido = response.content;
      coachMessage.proveedor = response.provider;
      coachMessage.tokensEntrada = response.tokens.input;
      coachMessage.tokensSalida = response.tokens.output;
      coachMessage.costo = response.cost;
      coachMessage.criadoEn = new Date();
      await mensajeRepo.save(coachMessage);

      const latency = Date.now() - startTime;

      res.json({
        response: response.content,
        provider: response.provider,
        model: response.model,
        cost: response.cost,
        latency: latency,
        sessionId: sessionId
      });
    } catch (error) {
      next(error);
    }
  }
}
