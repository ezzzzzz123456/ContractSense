// ─────────────────────────────────────────────────────────────────────────────
// API Envelope Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiMeta {
  timestamp: string;
  requestId: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta: ApiMeta;
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports
// ─────────────────────────────────────────────────────────────────────────────

export * from './user';
export * from './contract';
export * from './analysis';
