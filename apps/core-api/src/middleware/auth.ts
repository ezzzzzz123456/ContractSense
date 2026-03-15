import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { createErrorResponse } from '../utils/response';
import { UserRole } from '@contractsense/types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Verify JWT access token and attach user to request.
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json(createErrorResponse('UNAUTHENTICATED', 'No access token provided'));
      return;
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const payload = jwt.verify(token, secret) as {
      sub: string;
      email: string;
      role: UserRole;
    };

    // Verify user still exists in DB
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      res.status(401).json(createErrorResponse('UNAUTHENTICATED', 'User no longer exists'));
      return;
    }

    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json(createErrorResponse('TOKEN_EXPIRED', 'Access token has expired'));
      return;
    }
    res.status(401).json(createErrorResponse('INVALID_TOKEN', 'Invalid access token'));
  }
}

/**
 * Role-based access guard. Must run AFTER authenticate.
 */
export function authorise(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createErrorResponse('UNAUTHENTICATED', 'Not authenticated'));
      return;
    }
    // Admin bypasses all role checks
    if (req.user.role === 'admin' || roles.includes(req.user.role)) {
      next();
      return;
    }
    res.status(403).json(
      createErrorResponse('FORBIDDEN', `Access requires role: ${roles.join(' or ')}`)
    );
  };
}
