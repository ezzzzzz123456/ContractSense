import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createErrorResponse } from '../utils/response';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[error]', err.message, err.stack);

  if (err instanceof ZodError) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Validation failed', err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })))
    );
    return;
  }

  if (err.message.includes('Invalid file type')) {
    res.status(400).json(createErrorResponse('INVALID_FILE', err.message));
    return;
  }

  if (err.message === 'File too large') {
    res.status(400).json(createErrorResponse('FILE_TOO_LARGE', 'File exceeds the 20 MB limit'));
    return;
  }

  res.status(500).json(
    createErrorResponse('INTERNAL_ERROR', 'An unexpected error occurred')
  );
}
