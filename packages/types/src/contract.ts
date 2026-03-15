// ─────────────────────────────────────────────────────────────────────────────
// Contract Types
// ─────────────────────────────────────────────────────────────────────────────

export type ContractStatus =
  | 'pending'
  | 'processing'
  | 'analysed'
  | 'error'
  | 'sealed';

export type ContractType =
  | 'employment'
  | 'freelance'
  | 'nda'
  | 'lease'
  | 'property'
  | 'service'
  | 'partnership'
  | 'loan'
  | 'other';

export interface Contract {
  id: string;
  userId: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  status: ContractStatus;
  contractType: ContractType | null;
  counterpartyName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractListResponse {
  contracts: Contract[];
  total: number;
  page: number;
  limit: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Marketplace / Review Types
// ─────────────────────────────────────────────────────────────────────────────

export type ReviewRequestStatus =
  | 'pending'
  | 'in_review'
  | 'completed'
  | 'rejected';

export interface ReviewRequest {
  id: string;
  contractId: string;
  userId: string;
  lawyerId: string;
  status: ReviewRequestStatus;
  paymentIntentId: string | null;
  paymentStatus: string;
  amountPaid: number;
  currency: string;
  userNote: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Trust Seal Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TrustSeal {
  id: string;
  contractId: string;
  lawyerId: string;
  reviewRequestId: string;
  sealHash: string;
  reportHash: string;
  sealedPdfKey: string;
  issuedAt: string;
  verificationUrl: string;
}
