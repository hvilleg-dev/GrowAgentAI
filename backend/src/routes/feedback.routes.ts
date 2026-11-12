import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';

export function createFeedbackRoutes(): Router {
  const feedbackRouter = Router();

  feedbackRouter.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, timestamp } = req.body;
      const userId = (req as any).userId;

      if (!message || !message.trim()) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
      const telegramChatId = process.env.TELEGRAM_CHAT_ID;

      if (!telegramBotToken || !telegramChatId) {
        console.warn('Telegram not configured - feedback will be logged only');
        console.log(`[FEEDBACK] From user ${userId}: ${message}`);
        res.json({ success: true, message: 'Feedback received (Telegram not configured)' });
        return;
      }

      // Format message for Telegram
      const telegramMessage = `📬 *Nuevo Feedback*
━━━━━━━━━━━━━━━━
👤 *Usuario:* \`${userId}\`
🕐 *Hora:* ${new Date(timestamp).toLocaleString('es-ES')}
━━━━━━━━━━━━━━━━
💬 *Mensaje:*
${message}`;

      // Send to Telegram via fetch
      const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: telegramMessage,
          parse_mode: 'Markdown'
        })
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      res.json({ success: true, message: 'Feedback sent successfully' });
    } catch (error) {
      console.error('Error sending feedback to Telegram:', error);
      next(error);
    }
  });

  return feedbackRouter;
}
