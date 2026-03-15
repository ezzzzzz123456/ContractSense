import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { uploadFile, ensureBucket } from '../lib/minio';
import { publishAnalysisJob } from '../lib/redis';
import { authenticate, authorise, AuthenticatedRequest } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const router = Router();

// All contract routes require auth
router.use(authenticate);

// ─── POST /api/core/contracts/upload ─────────────────────────────────────────
router.post(
  '/upload',
  authorise('user'),
  uploadMiddleware.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json(createErrorResponse('NO_FILE', 'No file uploaded'));
        return;
      }

      const { counterpartyName } = req.body as { counterpartyName?: string };

      await ensureBucket();

      const contractId = `ctr_${uuidv4().replace(/-/g, '').slice(0, 20)}`;
      const ext = req.file.mimetype === 'application/pdf' ? 'pdf' : 'docx';
      const fileKey = `uploads/${req.user!.id}/${contractId}.${ext}`;

      await uploadFile(fileKey, req.file.buffer, req.file.mimetype);

      const contract = await prisma.contract.create({
        data: {
          id: contractId,
          userId: req.user!.id,
          fileName: req.file.originalname,
          fileKey,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          status: 'processing',
          counterpartyName: counterpartyName ?? null,
        },
      });

      // Queue the analysis job for the AI backend
      await publishAnalysisJob({
        contractId: contract.id,
        fileKey: contract.fileKey,
        counterpartyName: contract.counterpartyName,
      });

      res.status(201).json(createSuccessResponse(contract));
    } catch (err) {
      throw err;
    }
  }
);

// ─── GET /api/core/contracts ──────────────────────────────────────────────────
router.get('/', authorise('user'), async (req: AuthenticatedRequest, res: Response) => {
  const PageSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    status: z.enum(['pending', 'processing', 'analysed', 'error', 'sealed']).optional(),
  });

  const query = PageSchema.parse(req.query);
  const skip = (query.page - 1) * query.limit;

  const where = {
    userId: req.user!.id,
    ...(query.status ? { status: query.status } : {}),
  };

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({ where, skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
    prisma.contract.count({ where }),
  ]);

  res.json(createSuccessResponse({ contracts, total, page: query.page, limit: query.limit }));
});

// ─── GET /api/core/contracts/:id ─────────────────────────────────────────────
router.get('/:id', authorise('user', 'lawyer'), async (req: AuthenticatedRequest, res: Response) => {
  const contract = await prisma.contract.findFirst({
    where: {
      id: req.params.id,
      // lawyers can see contracts assigned to their review
      ...(req.user!.role === 'user' ? { userId: req.user!.id } : {}),
    },
  });

  if (!contract) {
    res.status(404).json(createErrorResponse('NOT_FOUND', 'Contract not found'));
    return;
  }

  res.json(createSuccessResponse(contract));
});

// ─── GET /api/core/contracts/:id/report ──────────────────────────────────────
router.get('/:id/report', authorise('user', 'lawyer'), async (req: AuthenticatedRequest, res: Response) => {
  const contract = await prisma.contract.findFirst({
    where: {
      id: req.params.id,
      ...(req.user!.role === 'user' ? { userId: req.user!.id } : {}),
    },
  });

  if (!contract) {
    res.status(404).json(createErrorResponse('NOT_FOUND', 'Contract not found'));
    return;
  }

  if (contract.status !== 'analysed' && contract.status !== 'sealed') {
    res.status(409).json(createErrorResponse('NOT_READY', `Contract is still ${contract.status}`));
    return;
  }

  // The full analysis is stored in MongoDB (via AI backend)
  // Core API proxies the request by storing the MongoDB ID reference
  if (!contract.analysisId) {
    res.status(404).json(createErrorResponse('NO_ANALYSIS', 'Analysis not yet available'));
    return;
  }

  // Return the analysisId so the frontend can fetch from AI backend if needed,
  // or the AI backend can be queried directly from here in the future.
  res.json(createSuccessResponse({ contract, analysisId: contract.analysisId }));
});

// ─── POST /api/core/contracts/:id/callback ────────────────────────────────────
// Called by AI backend when analysis completes
router.post('/:id/callback', async (req, res: Response) => {
  // Internal route — validate a shared secret header
  const secret = req.headers['x-internal-secret'];
  if (secret !== process.env.INTERNAL_CALLBACK_SECRET) {
    res.status(403).json(createErrorResponse('FORBIDDEN', 'Invalid internal secret'));
    return;
  }

  const { status, contractType, analysisId } = req.body as {
    status: string;
    contractType?: string;
    analysisId?: string;
  };

  await prisma.contract.update({
    where: { id: req.params.id },
    data: {
      status: status as 'analysed' | 'error',
      contractType: contractType as 'employment' | 'nda' | 'lease' | 'freelance' | 'property' | 'service' | 'partnership' | 'loan' | 'other' | undefined,
      analysisId,
    },
  });

  res.json(createSuccessResponse({ updated: true }));
});

export default router;
