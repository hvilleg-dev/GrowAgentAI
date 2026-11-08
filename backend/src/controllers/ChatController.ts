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

      // Get user profile for context
      const usuario = await usuarioRepo.findOne({ where: { id: userId } });
      if (!usuario) {
        throw new NotFoundError('Usuario');
      }

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

      // Build coaching context with user profile
      const userContext = `You are a professional GROW framework coach.

Client Profile:
- Name: ${usuario.nombre}
- Age: ${usuario.edad}
- Gender: ${usuario.genero}
${usuario.ocupacion ? `- Occupation: ${usuario.ocupacion}` : ''}
${usuario.estiloCoaching ? `- Preferred coaching style: ${usuario.estiloCoaching}` : '- Preferred coaching style: supportive and empowering'}
- Language: ${usuario.idioma === 'es' ? 'Spanish' : 'English'}

Apply your coaching strategy based on the client's age, gender, and professional context.
Ask powerful questions following the GROW methodology (Goal, Reality, Options, Will).
Be personalized, empathetic, and culturally aware.`;

      // Get AI response with user context
      const response = await this.router.route(message, userContext);

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
        id: coachMessage.id,
        content: response.content,
        role: 'assistant',
        provider: response.provider,
        model: response.model,
        cost: response.cost,
        latency: latency,
        sessionId: sessionId,
        timestamp: coachMessage.criadoEn.toISOString(),
        crisisLevel: crisisResult?.level
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;

      const sesionRepo = AppDataSource.getRepository(Sesion);
      const mensajeRepo = AppDataSource.getRepository(Mensaje);

      // Verify session exists
      const sesion = await sesionRepo.findOne({ where: { id: sessionId } });
      if (!sesion) {
        throw new NotFoundError('Sesión');
      }

      // Get all messages for this session
      const messages = await mensajeRepo.find({
        where: { sesionId: sessionId },
        order: { criadoEn: 'ASC' }
      });

      // Map to frontend format: criadoEn -> timestamp, rol -> role
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        sessionId: msg.sesionId,
        role: msg.rol === 'usuario' ? 'user' : 'assistant',
        content: msg.contenido,
        timestamp: msg.criadoEn?.toISOString() || new Date().toISOString()
      }));

      res.json(formattedMessages);
    } catch (error) {
      next(error);
    }
  }
}
