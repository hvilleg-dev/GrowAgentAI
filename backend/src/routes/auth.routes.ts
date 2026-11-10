import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '@/database/db';
import { Usuario } from '@/database/entities';
import logger from '@/utils/logger';
import { generateToken, authMiddleware } from '@/middleware/auth.middleware';

export function createAuthRoutes(): Router {
  const router = Router();
  const usuarioRepo = AppDataSource.getRepository(Usuario);

  // Register
  router.post('/register', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { nombre, name, email, password, edad, genero } = req.body;
      const fullName = nombre || name;

      if (!fullName || !email || !password) {
        res.status(400).json({
          error: 'Missing required fields: name, email, password'
        });
        return;
      }

      // Normalize email and password
      const normalizedEmail = email.toLowerCase().trim();
      const normalizedPassword = password.trim();
      const edadNumber = edad ? (typeof edad === 'string' ? parseInt(edad, 10) : Number(edad)) : undefined;

      const existingUser = await usuarioRepo
        .createQueryBuilder('usuario')
        .where('LOWER(usuario.email) = :email', { email: normalizedEmail })
        .getOne();
      if (existingUser) {
        res.status(409).json({
          error: 'Email already exists'
        });
        return;
      }

      const usuario = new Usuario();
      usuario.id = uuidv4();
      usuario.nombre = fullName;
      usuario.email = normalizedEmail;
      usuario.passwordHash = normalizedPassword; // In production, hash this!
      usuario.edad = edadNumber;
      usuario.genero = genero || undefined;
      usuario.idioma = 'es';
      usuario.activo = true;

      await usuarioRepo.save(usuario);

      const token = generateToken(usuario.id, usuario.email);
      res.status(201).json({
        token,
        user: {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          edad: usuario.edad,
          genero: usuario.genero
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

      // Trim and lowercase email for case-insensitive search
      const normalizedEmail = email.toLowerCase().trim();
      const usuario = await usuarioRepo
        .createQueryBuilder('usuario')
        .where('LOWER(usuario.email) = :email', { email: normalizedEmail })
        .getOne();

      if (!usuario) {
        res.status(401).json({
          error: 'Invalid credentials'
        });
        return;
      }

      // Trim password for comparison (in case of accidental spaces)
      const normalizedPassword = password.trim();
      if (usuario.passwordHash !== normalizedPassword) {
        res.status(401).json({
          error: 'Invalid credentials'
        });
        return;
      }

      // Check if 2FA is enabled
      if (usuario.twoFactorEnabled) {
        // Generate temporary token for 2FA verification
        const tempToken = generateToken(usuario.id, usuario.email);
        res.status(200).json({
          message: 'Login requires 2FA verification',
          requires2FA: true,
          tempToken,
          user: {
            id: usuario.id,
            name: usuario.nombre,
            email: usuario.email,
            edad: usuario.edad,
            genero: usuario.genero
          }
        });
        return;
      }

      const token = generateToken(usuario.id, usuario.email);
      res.status(200).json({
        message: 'Login successful',
        requires2FA: false,
        user: {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          edad: usuario.edad,
          genero: usuario.genero
        },
        token
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

  // Update profile (new endpoint for coaching profile data)
  router.put('/profile', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, edad, genero, ocupacion, estiloCoaching } = req.body;
      if (!userId) {
        res.status(400).json({ error: 'Missing required field: userId' });
        return;
      }

      const usuario = await usuarioRepo.findOne({ where: { id: userId } });
      if (!usuario) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (edad !== undefined) usuario.edad = edad;
      if (genero !== undefined) usuario.genero = genero;
      if (ocupacion !== undefined) usuario.ocupacion = ocupacion;
      if (estiloCoaching !== undefined) usuario.estiloCoaching = estiloCoaching;

      await usuarioRepo.save(usuario);

      res.status(200).json({
        message: 'Profile updated',
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          edad: usuario.edad,
          genero: usuario.genero,
          ocupacion: usuario.ocupacion,
          estiloCoaching: usuario.estiloCoaching,
          idioma: usuario.idioma,
          tema: usuario.tema
        }
      });
    } catch (error) {
      logger.error('Update profile error:', error);
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

  // Verify 2FA code
  router.post('/verify-2fa', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, code } = req.body;
      if (!userId || !code) {
        res.status(400).json({ error: 'Missing required fields: userId, code' });
        return;
      }

      const usuario = await usuarioRepo.findOne({ where: { id: userId } });
      if (!usuario) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (!usuario.twoFactorEnabled) {
        res.status(400).json({ error: '2FA not enabled for this user' });
        return;
      }

      // Mock 2FA verification - in production, use a library like speakeasy
      // For now, accept any 6-digit code as valid
      const isCodeValid = /^\d{6}$/.test(code);

      if (!isCodeValid) {
        res.status(401).json({ error: 'Invalid 2FA code' });
        return;
      }

      // Generate final token after successful 2FA
      const token = generateToken(usuario.id, usuario.email);
      res.status(200).json({
        message: '2FA verification successful',
        user: {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          edad: usuario.edad,
          genero: usuario.genero
        },
        token
      });
    } catch (error) {
      logger.error('Verify 2FA error:', error);
      next(error);
    }
  });

  // Get profile
  router.get('/profile/:userId', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        edad: usuario.edad,
        genero: usuario.genero,
        ocupacion: usuario.ocupacion,
        estiloCoaching: usuario.estiloCoaching,
        theme: usuario.tema || 'light',
        language: usuario.idioma || 'es',
        twoFactorEnabled: usuario.twoFactorEnabled
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  });

  // Check if profile is complete (for notification before chat)
  router.get('/profile-status/:userId', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const isComplete = !!(usuario.nombre && usuario.email && usuario.edad && usuario.genero);
      const missingFields = [];

      if (!usuario.nombre) missingFields.push('name');
      if (!usuario.edad) missingFields.push('age');
      if (!usuario.genero) missingFields.push('gender');

      res.status(200).json({
        isComplete,
        missingFields,
        user: {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          edad: usuario.edad,
          genero: usuario.genero
        }
      });
    } catch (error) {
      logger.error('Profile status error:', error);
      next(error);
    }
  });

  return router;
}
