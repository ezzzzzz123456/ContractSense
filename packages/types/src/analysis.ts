// ─────────────────────────────────────────────────────────────────────────────
// Analysis Types
// ─────────────────────────────────────────────────────────────────────────────

export type RiskLevel = 'red' | 'yellow' | 'green';

export interface FuturePrediction {
  scenario: string;
  risk: string;
  advice: string;
}

export interface Clause {
  id: string;
  contractId: string;
  index: number;
  originalText: string;
  plainEnglish: string;
  riskLevel: RiskLevel;
  riskExplanation: string;
  counterClause: string;
  readyToSendText: string;
  futurePredictions: FuturePrediction[];
}

export interface Analysis {
  id: string;
  contractId: string;
  contractType: string;
  overallRiskScore: number;
  summary: string;
  clauses: Clause[];
  redFlagCount: number;
  yellowFlagCount: number;
  greenFlagCount: number;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Party Intelligence Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PartyIntelligenceSource {
  url: string;
  title: string;
  snippet: string;
}

export interface PartyIntelligence {
  id: string;
  contractId: string;
  counterpartyName: string;
  trustScore: number;
  reputationSummary: string;
  redFlags: string[];
  sources: PartyIntelligenceSource[];
  scrapedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat Types
// ─────────────────────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  contractId: string;
  userId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatResponse {
  reply: string;
  sources: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Lawyer Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Lawyer {
  id: string;
  userId: string;
  name: string;
  email: string;
  barNumber: string;
  jurisdiction: string;
  specialisations: string[];
  bio: string;
  avatarUrl: string | null;
  rating: number;
  reviewCount: number;
  pricePerReview: number;
  currency: string;
  isVerified: boolean;
  isAvailable: boolean;
  createdAt: string;
}

export interface LawyerAnnotation {
  clauseId: string;
  note: string;
  recommendation: string;
}

export interface LawyerReview {
  id: string;
  reviewRequestId: string;
  lawyerId: string;
  annotations: LawyerAnnotation[];
  overallVerdict: string;
  signedOff: boolean;
  signedOffAt: string | null;
}
