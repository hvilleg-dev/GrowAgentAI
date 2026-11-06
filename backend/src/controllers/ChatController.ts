import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ProviderRouter } from '@/services/ProviderRouter';
import { CrisisDetector } from '@/services/CrisisDetector';
import { AppDataSource } from '@/database/db';
import { Sesion, Mensaje } from '@/database/entities';
import { NotFoundError } from '@/errors/AppError';
import { validateData, schemas } from '@/utils/validators';

export class ChatController {
  constructor(
    private router: ProviderRouter,
    private crisisDetector: CrisisDetector
  ) {}

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body: any = await validateData(
        req.body,
        schemas.sendMessage
      );
      const sesionId = body.sesionId as string;
      const contenido = body.contenido as string;

      const sesionRepo = AppDataSource.getRepository(Sesion);
      const mensajeRepo = AppDataSource.getRepository(Mensaje);

      const sesion = await sesionRepo.findOne({ where: { id: sesionId } });
      if (!sesion) {
        throw new NotFoundError('Sesión');
      }

      const crisisResult = await this.crisisDetector.detectCrisis(contenido);
      this.crisisDetector.throwIfCrisis(crisisResult);

      const userMessage = new Mensaje();
      userMessage.id = uuidv4();
      userMessage.sesionId = sesionId;
      userMessage.rol = 'usuario';
      userMessage.contenido = contenido;
      userMessage.criadoEn = new Date();

      await mensajeRepo.save(userMessage);

      const response = await this.router.route(contenido);

      const coachMessage = new Mensaje();
      coachMessage.id = uuidv4();
      coachMessage.sesionId = sesionId;
      coachMessage.rol = 'coach';
      coachMessage.contenido = response.content;
      coachMessage.proveedor = response.provider;
      coachMessage.tokensEntrada = response.tokens.input;
      coachMessage.tokensSalida = response.tokens.output;
      coachMessage.costo = response.cost;
      coachMessage.criadoEn = new Date();

      await mensajeRepo.save(coachMessage);

      res.json({
        mensaje: response.content,
        proveedor: response.provider,
        costo: response.cost
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sesionId } = req.params;
      const mensajeRepo = AppDataSource.getRepository(Mensaje);

      const mensajes = await mensajeRepo.find({
        where: { sesionId },
        order: { criadoEn: 'ASC' }
      });

      res.json(mensajes);
    } catch (error) {
      next(error);
    }
  }
}
