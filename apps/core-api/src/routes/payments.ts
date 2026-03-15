import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authenticate, authorise, AuthenticatedRequest } from '../middleware/auth';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-06-20' });

// ─── POST /api/core/payments/create-intent ───────────────────────────────────
router.post('/create-intent', authenticate, authorise('user'), async (req: AuthenticatedRequest, res: Response) => {
  const { reviewRequestId } = req.body as { reviewRequestId: string };
  if (!reviewRequestId) {
    res.status(400).json(createErrorResponse('MISSING_FIELD', 'reviewRequestId is required'));
    return;
  }

  const reviewRequest = await prisma.reviewRequest.findFirst({
    where: { id: reviewRequestId, userId: req.user!.id },
  });
  if (!reviewRequest) {
    res.status(404).json(createErrorResponse('NOT_FOUND', 'Review request not found'));
    return;
  }

  if (reviewRequest.paymentStatus === 'paid') {
    res.status(409).json(createErrorResponse('ALREADY_PAID', 'This review request has already been paid for'));
    return;
  }

  const amountInCents = Math.round(reviewRequest.amountPaid * 100);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: reviewRequest.currency.toLowerCase(),
    metadata: {
      reviewRequestId: reviewRequest.id,
      contractId: reviewRequest.contractId,
      userId: req.user!.id,
    },
  });

  await prisma.reviewRequest.update({
    where: { id: reviewRequest.id },
    data: { paymentIntentId: paymentIntent.id },
  });

  res.json(createSuccessResponse({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }));
});

// ─── POST /api/core/payments/webhook (Stripe) ─────────────────────────────────
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch {
    res.status(400).json(createErrorResponse('WEBHOOK_ERROR', 'Stripe signature verification failed'));
    return;
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const reviewRequestId = pi.metadata.reviewRequestId;

    if (reviewRequestId) {
      await prisma.reviewRequest.update({
        where: { id: reviewRequestId },
        data: { paymentStatus: 'paid', status: 'pending' },
      });
    }
  }

  res.json({ received: true });
});

export default router;
