import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, authorise, AuthenticatedRequest } from '../middleware/auth';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const router = Router();
router.use(authenticate);

// ─── GET /api/core/marketplace/lawyers ────────────────────────────────────────
router.get('/lawyers', authorise('user'), async (req: AuthenticatedRequest, res: Response) => {
  const QuerySchema = z.object({
    specialisation: z.string().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  });

  const query = QuerySchema.parse(req.query);
  const skip = (query.page - 1) * query.limit;

  const where: Record<string, unknown> = { isVerified: true, isAvailable: true };
  if (query.specialisation) {
    where.specialisations = { has: query.specialisation };
  }
  if (query.minRating !== undefined) {
    where.rating = { gte: query.minRating };
  }
  if (query.maxPrice !== undefined) {
    where.pricePerReview = { lte: query.maxPrice };
  }

  const [lawyers, total] = await Promise.all([
    prisma.lawyer.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { rating: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.lawyer.count({ where }),
  ]);

  res.json(createSuccessResponse({ lawyers, total, page: query.page, limit: query.limit }));
});

// ─── GET /api/core/marketplace/lawyers/:id ────────────────────────────────────
router.get('/lawyers/:id', authorise('user'), async (req: AuthenticatedRequest, res: Response) => {
  const lawyer = await prisma.lawyer.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!lawyer || !lawyer.isVerified) {
    res.status(404).json(createErrorResponse('NOT_FOUND', 'Lawyer not found'));
    return;
  }

  res.json(createSuccessResponse(lawyer));
});

// ─── POST /api/core/marketplace/review-requests ───────────────────────────────
router.post('/review-requests', authorise('user'), async (req: AuthenticatedRequest, res: Response) => {
  const Schema = z.object({
    contractId: z.string().min(1),
    lawyerId: z.string().min(1),
    userNote: z.string().max(1000).optional(),
  });

  const body = Schema.parse(req.body);

  // Verify the contract belongs to this user
  const contract = await prisma.contract.findFirst({
    where: { id: body.contractId, userId: req.user!.id },
  });
  if (!contract) {
    res.status(404).json(createErrorResponse('NOT_FOUND', 'Contract not found'));
    return;
  }

  // Verify the lawyer exists and is verified
  const lawyer = await prisma.lawyer.findUnique({ where: { id: body.lawyerId } });
  if (!lawyer || !lawyer.isVerified) {
    res.status(404).json(createErrorResponse('NOT_FOUND', 'Lawyer not found or not verified'));
    return;
  }

  // Check no existing pending/in_review request for same contract+lawyer
  const existing = await prisma.reviewRequest.findFirst({
    where: {
      contractId: body.contractId,
      lawyerId: body.lawyerId,
      status: { in: ['pending', 'in_review'] },
    },
  });
  if (existing) {
    res.status(409).json(createErrorResponse('DUPLICATE_REQUEST', 'A pending review request already exists for this contract and lawyer'));
    return;
  }

  const reviewRequest = await prisma.reviewRequest.create({
    data: {
      contractId: body.contractId,
      userId: req.user!.id,
      lawyerId: body.lawyerId,
      userNote: body.userNote ?? null,
      amountPaid: lawyer.pricePerReview,
      currency: lawyer.currency,
    },
  });

  res.status(201).json(createSuccessResponse(reviewRequest));
});

// ─── GET /api/core/marketplace/review-requests/incoming (Lawyer) ──────────────
router.get('/review-requests/incoming', authorise('lawyer'), async (req: AuthenticatedRequest, res: Response) => {
  const lawyer = await prisma.lawyer.findUnique({ where: { userId: req.user!.id } });
  if (!lawyer) {
    res.status(404).json(createErrorResponse('NOT_FOUND', 'Lawyer profile not found'));
    return;
  }

  const requests = await prisma.reviewRequest.findMany({
    where: { lawyerId: lawyer.id },
    orderBy: { createdAt: 'desc' },
    include: {
      contract: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  res.json(createSuccessResponse({ requests, total: requests.length }));
});

export default router;
