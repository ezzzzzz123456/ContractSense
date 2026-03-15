import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorise, AuthenticatedRequest } from '../middleware/auth';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const router = Router();
router.use(authenticate, authorise('admin'));

// ─── GET /api/core/admin/lawyers/pending ──────────────────────────────────────
router.get('/lawyers/pending', async (_req: AuthenticatedRequest, res: Response) => {
  const lawyers = await prisma.lawyer.findMany({
    where: { isVerified: false },
    include: { user: { select: { name: true, email: true } } },
  });
  res.json(createSuccessResponse({ lawyers }));
});

// ─── PATCH /api/core/admin/lawyers/:id/verify ─────────────────────────────────
router.patch('/lawyers/:id/verify', async (req: AuthenticatedRequest, res: Response) => {
  const { isVerified } = req.body as { isVerified: boolean };
  if (typeof isVerified !== 'boolean') {
    res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'isVerified must be a boolean'));
    return;
  }

  const lawyer = await prisma.lawyer.findUnique({ where: { id: req.params.id } });
  if (!lawyer) {
    res.status(404).json(createErrorResponse('NOT_FOUND', 'Lawyer not found'));
    return;
  }

  const updated = await prisma.lawyer.update({
    where: { id: req.params.id },
    data: { isVerified },
  });

  res.json(createSuccessResponse(updated));
});

// ─── GET /api/core/admin/seals (list all seals) ───────────────────────────────
router.get('/seals', async (_req, res: Response) => {
  const seals = await prisma.trustSeal.findMany({ orderBy: { issuedAt: 'desc' } });
  res.json(createSuccessResponse({ seals }));
});

// ─── GET /api/core/seals/:hash/verify (public) ───────────────────────────────
// NOTE: This route is added on the express app without auth in app.ts
export async function verifySealHandler(req: { params: { hash: string } }, res: Response): Promise<void> {
  const seal = await prisma.trustSeal.findUnique({ where: { sealHash: req.params.hash } });
  if (!seal) {
    res.status(404).json(createErrorResponse('NOT_FOUND', 'Seal not found or invalid'));
    return;
  }

  const [lawyer, contract] = await Promise.all([
    prisma.lawyer.findUnique({
      where: { id: seal.lawyerId },
      select: { id: true, barNumber: true, jurisdiction: true, user: { select: { name: true } } },
    }),
    prisma.contract.findUnique({
      where: { id: seal.contractId },
      select: { id: true, fileName: true, contractType: true },
    }),
  ]);

  res.json(createSuccessResponse({ valid: true, seal, lawyer, contract }));
}

export default router;
