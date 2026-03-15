import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, ApiError } from '@contractsense/types';

export function createSuccessResponse<T>(data: T, meta?: Partial<{ requestId: string }>): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: meta?.requestId ?? uuidv4(),
    },
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: Array<{ field?: string; message: string }>
): ApiResponse<null> {
  const error: ApiError = { code, message };
  if (details) error.details = details;

  return {
    success: false,
    data: null,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    },
  };
}
