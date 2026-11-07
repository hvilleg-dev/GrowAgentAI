import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '@/utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): { userId: string; email: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    logger.error('Token verification failed:', error);
    throw error;
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Missing authorization header',
        code: 'MISSING_AUTH'
      });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      res.status(401).json({
        error: 'Invalid authorization header format. Expected: Bearer <token>',
        code: 'INVALID_AUTH_FORMAT'
      });
      return;
    }

    const token = parts[1];

    try {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
      req.user = {
        id: decoded.userId,
        email: decoded.email
      };
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
}

export function optionalAuthMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        const token = parts[1];
        try {
          const decoded = verifyToken(token);
          req.userId = decoded.userId;
          req.user = {
            id: decoded.userId,
            email: decoded.email
          };
        } catch (error) {
          logger.warn('Optional auth token verification failed, continuing without auth');
        }
      }
    }
    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next();
  }
}
