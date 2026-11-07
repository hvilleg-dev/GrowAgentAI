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
      const { nombre, email, password } = req.body;

      if (!nombre || !email || !password) {
        res.status(400).json({
          error: 'Missing required fields: nombre, email, password'
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
      usuario.nombre = nombre;
      usuario.email = email;
      usuario.passwordHash = password; // In production, hash this!
      usuario.idioma = 'es';
      usuario.activo = true;

      await usuarioRepo.save(usuario);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
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

  return router;
}
