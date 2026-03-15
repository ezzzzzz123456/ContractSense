import crypto from 'crypto';

/**
 * Generate a SHA-256 Trust Seal hash.
 * Input: contractId + lawyerId + timestamp (ISO) + reportHash
 */
export function generateSealHash(params: {
  contractId: string;
  lawyerId: string;
  timestamp: string;
  reportHash: string;
}): string {
  const input = `${params.contractId}:${params.lawyerId}:${params.timestamp}:${params.reportHash}`;
  return 'sha256:' + crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Generate a SHA-256 hash of the report content (used as reportHash).
 */
export function hashReportContent(analysisJson: string): string {
  return 'sha256:' + crypto.createHash('sha256').update(analysisJson, 'utf8').digest('hex');
}
