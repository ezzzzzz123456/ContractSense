import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Too many auth requests, please try again later.',
});

// ─── Schemas ─────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(100),
  role: z.enum(['user', 'lawyer']).default('user'),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function signAccessToken(userId: string, email: string, role: string): string {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ sub: userId, email, role }, secret, { expiresIn: '15m' });
}

function signRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET!;
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/core/auth/register
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const body = RegisterSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      res.status(409).json(createErrorResponse('DUPLICATE_EMAIL', 'Email already in use'));
      return;
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: { email: body.email, passwordHash, name: body.name, role: body.role as 'user' | 'lawyer' | 'admin' },
    });

    const accessToken = signAccessToken(user.id, user.email, user.role);
    const refreshToken = signRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });

    res.status(201).json(
      createSuccessResponse({
        user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt },
        accessToken,
        refreshToken,
      })
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Invalid input', err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))));
      return;
    }
    throw err;
  }
});

// POST /api/core/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const body = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      res.status(401).json(createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password'));
      return;
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      res.status(401).json(createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password'));
      return;
    }

    const accessToken = signAccessToken(user.id, user.email, user.role);
    const refreshToken = signRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });

    res.json(
      createSuccessResponse({
        user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt },
        accessToken,
        refreshToken,
      })
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Invalid input', err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))));
      return;
    }
    throw err;
  }
});

// POST /api/core/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      res.status(400).json(createErrorResponse('MISSING_TOKEN', 'Refresh token required'));
      return;
    }

    const secret = process.env.JWT_REFRESH_SECRET!;
    const payload = jwt.verify(refreshToken, secret) as { sub: string };

    const stored = await prisma.refreshToken.findFirst({
      where: { token: refreshToken, userId: payload.sub },
    });
    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json(createErrorResponse('INVALID_REFRESH_TOKEN', 'Refresh token invalid or expired'));
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      res.status(401).json(createErrorResponse('USER_NOT_FOUND', 'User not found'));
      return;
    }

    // Rotate: delete old, issue new
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const newAccessToken = signAccessToken(user.id, user.email, user.role);
    const newRefreshToken = signRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { userId: user.id, token: newRefreshToken, expiresAt } });

    res.json(createSuccessResponse({ accessToken: newAccessToken, refreshToken: newRefreshToken }));
  } catch {
    res.status(401).json(createErrorResponse('INVALID_REFRESH_TOKEN', 'Could not refresh token'));
  }
});

// GET /api/core/auth/me
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });
  if (!user) {
    res.status(404).json(createErrorResponse('USER_NOT_FOUND', 'User not found'));
    return;
  }
  res.json(createSuccessResponse(user));
});

export default router;
