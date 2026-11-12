import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ProviderRouter } from '@/services/ProviderRouter';
import { CrisisDetector } from '@/services/CrisisDetector';
import { AppDataSource } from '@/database/db';
import { Sesion, Mensaje, Usuario, Goal } from '@/database/entities';
import { NotFoundError } from '@/errors/AppError';
import { getSystemPrompt } from '@/utils/knowledgeBase';
import { searchKnowledge } from '@/utils/knowledgeSearch';

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

      // Reject if session is closed or expired
      if (sesion.status === 'CLOSED') {
        res.status(409).json({ code: 'SESSION_CLOSED', message: 'Session is closed' });
        return;
      }
      if (sesion.expiresAt && new Date(sesion.expiresAt) <= new Date()) {
        res.status(409).json({ code: 'SESSION_CLOSED', message: 'Session has expired' });
        return;
      }

      // Enforce single-device ownership — prevent dual sessions
      const requestDeviceId = req.headers['x-device-id'] as string | undefined;
      if (requestDeviceId && sesion.deviceId && sesion.deviceId !== requestDeviceId) {
        res.status(403).json({ code: 'DEVICE_MISMATCH', message: 'This session belongs to another device' });
        return;
      }

      // Get Goal context if session has goalId
      let goalContext = '';
      if (sesion.goalId) {
        const goalRepo = AppDataSource.getRepository(Goal);
        const goal = await goalRepo.findOne({ where: { id: sesion.goalId } });
        if (goal) {
          // Auto-advance status when coaching starts
          if (goal.status === 'not_started') {
            goal.status = 'in_progress';
            await goalRepo.save(goal);
          }
          goalContext = `
--- GOAL CONTEXT ---
Goal: ${goal.goal}
${goal.description ? `Description: ${goal.description}` : ''}
Current Reality: ${goal.reality || 'Not yet explored'}
Options identified: ${goal.options?.join(', ') || 'Not yet explored'}
Commitment: ${goal.will || 'Not yet defined'}
Status: ${goal.status}
Current GROW stage: ${sesion.etapaActual}
--------------------`;
        }
      }

      // Fetch conversation history from DB (last 20 messages, excluding current)
      const priorMessages = await mensajeRepo.find({
        where: { sesionId: sessionId },
        order: { criadoEn: 'ASC' },
        take: 20
      });
      const history = priorMessages.map(m => ({
        role: (m.rol === 'usuario' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.contenido
      }));

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

      // Load system prompt from knowledge base (language-aware)
      const kbSystemPrompt = getSystemPrompt(usuario.idioma || 'es');

      const styleMap: Record<string, string> = {
        supportive: usuario.idioma === 'en'
          ? 'warm, empathetic, encouraging — celebrate progress, normalize difficulty'
          : 'cálido, empático y motivador — celebra avances, normaliza la dificultad',
        directive: usuario.idioma === 'en'
          ? 'direct, action-oriented — give clear steps, challenge complacency'
          : 'directo y orientado a la acción — pasos claros, desafía la complacencia',
        socratic: usuario.idioma === 'en'
          ? 'Socratic — guide with questions, never give solutions directly'
          : 'socrático — guía con preguntas, nunca des soluciones directamente',
        collaborative: usuario.idioma === 'en'
          ? 'collaborative partner — think out loud together, co-create solutions'
          : 'compañero colaborativo — piensa en voz alta juntos, co-crea soluciones'
      };
      const styleDescription = styleMap[usuario.estiloCoaching || 'supportive'] || styleMap['supportive'];

      // Search knowledge base for relevant context
      const relevantChunks = await searchKnowledge(message, usuario.idioma, 3);
      const knowledgeContext = relevantChunks.length > 0
        ? `\n--- RELEVANT KNOWLEDGE BASE ---\n${relevantChunks
            .map(c => `[${c.archivo}/${c.seccion}] ${c.contenido.substring(0, 200)}...`)
            .join('\n')}\n---`
        : '';

      // Append client-specific context to KB system prompt
      const userContext = `${kbSystemPrompt}

---
PERFIL DEL CLIENTE EN ESTA SESIÓN:
- Nombre: ${usuario.nombre}
- Edad: ${usuario.edad || 'no indicada'}
- Género: ${usuario.genero || 'no indicado'}
${usuario.ocupacion ? `- Ocupación: ${usuario.ocupacion}` : ''}
- Estilo de coaching preferido: ${styleDescription}
- Idioma de respuesta: ${usuario.idioma === 'en' ? 'English' : 'Español'}
${goalContext}${knowledgeContext}`;

      // Get AI response with full conversation history
      const response = await this.router.route(message, userContext, undefined, history);

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
