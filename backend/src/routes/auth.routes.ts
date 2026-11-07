import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '@/database/db';
import { Usuario } from '@/database/entities';
import logger from '@/utils/logger';

export function createAuthRoutes(): Router {
  const router = Router();
  const usuarioRepo = AppDataSource.getRepository(Usuario);

  // Register
  router.post('/register', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { nombre, name, email, password } = req.body;
      const fullName = nombre || name;

      if (!fullName || !email || !password) {
        res.status(400).json({
          error: 'Missing required fields: name, email, password'
        });
        return;
      }

      const existingUser = await usuarioRepo.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({
          error: 'Email already exists'
        });
        return;
      }

      const usuario = new Usuario();
      usuario.id = uuidv4();
      usuario.nombre = fullName;
      usuario.email = email;
      usuario.passwordHash = password; // In production, hash this!
      usuario.idioma = 'es';
      usuario.activo = true;

      await usuarioRepo.save(usuario);

      res.status(201).json({
        token: 'mock-jwt-token',
        user: {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  });

  // Login
  router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Missing required fields: email, password'
        });
        return;
      }

      const usuario = await usuarioRepo.findOne({ where: { email } });
      if (!usuario || usuario.passwordHash !== password) {
        res.status(401).json({
          error: 'Invalid credentials'
        });
        return;
      }

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email
        },
        token: 'mock-jwt-token'
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  });

  // Change password
  router.post('/change-password', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      if (!userId || !currentPassword || !newPassword) {
        res.status(400).json({ error: 'Missing required fields: userId, currentPassword, newPassword' });
        return;
      }

      const usuario = await usuarioRepo.findOne({ where: { id: userId } });
      if (!usuario) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (usuario.passwordHash !== currentPassword) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }

      usuario.passwordHash = newPassword;
      await usuarioRepo.save(usuario);

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Change password error:', error);
      next(error);
    }
  });

  // Update language
  router.put('/language', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, language } = req.body;
      if (!userId || !language) {
        res.status(400).json({ error: 'Missing required fields: userId, language' });
        return;
      }

      const usuario = await usuarioRepo.findOne({ where: { id: userId } });
      if (!usuario) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      usuario.idioma = language;
      await usuarioRepo.save(usuario);

      res.status(200).json({ message: 'Language updated', language });
    } catch (error) {
      logger.error('Update language error:', error);
      next(error);
    }
  });

  // Update theme
  router.put('/theme', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, theme } = req.body;
      if (!userId || !theme) {
        res.status(400).json({ error: 'Missing required fields: userId, theme' });
        return;
      }

      const usuario = await usuarioRepo.findOne({ where: { id: userId } });
      if (!usuario) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      usuario.tema = theme;
      await usuarioRepo.save(usuario);

      res.status(200).json({ message: 'Theme updated', theme });
    } catch (error) {
      logger.error('Update theme error:', error);
      next(error);
    }
  });

  // Enable 2FA
  router.post('/enable-2fa', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ error: 'Missing required field: userId' });
        return;
      }

      const usuario = await usuarioRepo.findOne({ where: { id: userId } });
      if (!usuario) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      usuario.twoFactorEnabled = true;
      usuario.twoFactorSecret = 'mock-2fa-secret-' + Date.now();
      await usuarioRepo.save(usuario);

      res.status(200).json({
        message: '2FA enabled',
        qrCode: 'mock-qr-code',
        secret: usuario.twoFactorSecret
      });
    } catch (error) {
      logger.error('Enable 2FA error:', error);
      next(error);
    }
  });

  // Disable 2FA
  router.post('/disable-2fa', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ error: 'Missing required field: userId' });
        return;
      }

      const usuario = await usuarioRepo.findOne({ where: { id: userId } });
      if (!usuario) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      usuario.twoFactorEnabled = false;
      usuario.twoFactorSecret = null;
      await usuarioRepo.save(usuario);

      res.status(200).json({ message: '2FA disabled' });
    } catch (error) {
      logger.error('Disable 2FA error:', error);
      next(error);
    }
  });

  // Get profile
  router.get('/profile/:userId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(400).json({ error: 'Missing required field: userId' });
        return;
      }

      const usuario = await usuarioRepo.findOne({ where: { id: userId } });
      if (!usuario) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        id: usuario.id,
        name: usuario.nombre,
        email: usuario.email,
        theme: usuario.tema || 'light',
        language: usuario.idioma || 'es',
        twoFactorEnabled: usuario.twoFactorEnabled
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  });

  return router;
}
