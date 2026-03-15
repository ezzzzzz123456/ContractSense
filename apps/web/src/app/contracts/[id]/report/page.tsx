import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Contract Report' };

// Mock data — replace with API call in real implementation
const mockAnalysis = {
  contractId: 'ctr_01HXYZ001',
  contractType: 'employment',
  overallRiskScore: 72,
  summary:
    'This employment contract presents significant risk in non-compete, IP assignment, and at-will termination areas. Three clauses require immediate negotiation before signing.',
  redFlagCount: 3,
  yellowFlagCount: 5,
  greenFlagCount: 8,
  clauses: [
    {
      id: 'cls_001',
      index: 0,
      riskLevel: 'red' as const,
      plainEnglish: 'You cannot work for a competitor for 2 years after leaving.',
      originalText: 'The Employee agrees to a non-compete restriction period of 24 months following termination of employment.',
      riskExplanation: '24 months is unusually long. Courts in many states would void this entirely or enforce it only partially. It severely limits your future employment.',
      counterClause: 'The Employee agrees to a non-compete restriction period of 3 months following termination, limited to direct competitors within the same metro area.',
      readyToSendText: 'I propose revising Clause 3 (Non-Compete). The 24-month restriction is disproportionate. I propose a 3-month restriction limited to direct competitors in my metro area.',
    },
    {
      id: 'cls_002',
      index: 1,
      riskLevel: 'red' as const,
      plainEnglish: 'Everything you create while employed — including side projects — belongs to the company.',
      originalText: 'Any inventions, discoveries, or works created by the Employee during employment shall be the exclusive property of Acme Corp.',
      riskExplanation: 'No carve-out for personal projects built on personal time with personal resources. The company could claim ownership of your side projects.',
      counterClause: 'Inventions directly related to Company business, using Company resources during Company time, belong to Acme Corp. Personal projects on personal time are excluded.',
      readyToSendText: 'Regarding Clause 5 (IP Assignment), I request a carve-out for personal projects developed on personal time with personal resources. Proposed wording: [counter clause].',
    },
    {
      id: 'cls_003',
      index: 2,
      riskLevel: 'yellow' as const,
      plainEnglish: 'You can be fired at any time for any reason with 2 weeks notice.',
      originalText: 'The Company may terminate employment at any time, with or without cause, with two weeks notice.',
      riskExplanation: 'At-will termination with 2 weeks notice is standard but provides minimal job security or financial runway.',
      counterClause: 'The Company may terminate employment with 30 days written notice, or payment in lieu.',
      readyToSendText: 'I propose extending the notice period from 2 weeks to 30 days. Proposed wording: [counter clause].',
    },
    {
      id: 'cls_004',
      index: 3,
      riskLevel: 'green' as const,
      plainEnglish: 'You will be paid £85,000 per year, reviewed annually.',
      originalText: 'The Employee shall receive a base salary of £85,000 per annum, subject to annual review.',
      riskExplanation: 'Standard, fair compensation clause. No concerns.',
      counterClause: '',
      readyToSendText: '',
    },
  ],
};

export default function ReportPage({ params }: { params: { id: string } }) {
  const { contractId, contractType, overallRiskScore, summary, redFlagCount, yellowFlagCount, greenFlagCount, clauses } = mockAnalysis;

  const riskColor = overallRiskScore > 60 ? 'text-red-400' : overallRiskScore > 30 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-surface-raised/50 backdrop-blur-md px-6 h-16 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Dashboard
        </Link>
        <span className="text-surface-border">/</span>
        <span className="text-white text-sm font-medium">Contract Report</span>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href={`/contracts/${params.id}/chat`}
            id="open-chat-btn"
            className="btn-secondary text-sm py-2"
          >
            💬 Ask AI
          </Link>
          <Link
            href={`/contracts/${params.id}/party`}
            id="open-party-btn"
            className="btn-secondary text-sm py-2"
          >
            🔍 Party Intel
          </Link>
          <Link
            href="/marketplace"
            id="hire-lawyer-btn"
            className="btn-primary text-sm py-2"
          >
            ⚖️ Hire lawyer
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Summary Banner */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{contractType}</span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-500">{contractId}</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">AI Contract Analysis Report</h1>
              <p className="text-gray-300 leading-relaxed">{summary}</p>

              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-2 risk-red px-3 py-1.5 rounded-full text-sm font-medium">
                  🔴 {redFlagCount} High Risk
                </div>
                <div className="flex items-center gap-2 risk-yellow px-3 py-1.5 rounded-full text-sm font-medium">
                  🟡 {yellowFlagCount} Caution
                </div>
                <div className="flex items-center gap-2 risk-green px-3 py-1.5 rounded-full text-sm font-medium">
                  🟢 {greenFlagCount} Safe
                </div>
              </div>
            </div>

            {/* Risk Score */}
            <div className="text-center shrink-0">
              <div className={`text-6xl font-black ${riskColor}`}>{overallRiskScore}</div>
              <div className="text-gray-400 text-sm mt-1">Overall Risk Score</div>
              <div className="text-gray-500 text-xs">(0 = safe, 100 = dangerous)</div>
            </div>
          </div>
        </div>

        {/* Clauses */}
        <h2 className="text-xl font-bold text-white mb-4">Clause-by-clause analysis</h2>
        <div className="space-y-4">
          {clauses.map((clause) => (
            <ClauseCard key={clause.id} clause={clause} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClauseCard({ clause }: {
  clause: {
    id: string;
    index: number;
    riskLevel: 'red' | 'yellow' | 'green';
    plainEnglish: string;
    originalText: string;
    riskExplanation: string;
    counterClause: string;
    readyToSendText: string;
  };
}) {
  const riskConfig = {
    red:    { label: '🔴 High Risk', headerClass: 'border-red-500/40 bg-red-500/5', badgeClass: 'risk-red' },
    yellow: { label: '🟡 Caution',   headerClass: 'border-amber-500/40 bg-amber-500/5', badgeClass: 'risk-yellow' },
    green:  { label: '🟢 Safe',      headerClass: 'border-emerald-500/40 bg-emerald-500/5', badgeClass: 'risk-green' },
  }[clause.riskLevel];

  return (
    <details className={`glass-card overflow-hidden border ${riskConfig.headerClass}`} id={`clause-${clause.id}`}>
      <summary className="p-5 cursor-pointer list-none flex items-start gap-4 hover:bg-white/5 transition-colors">
        <span className={`${riskConfig.badgeClass} text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap mt-0.5`}>
          {riskConfig.label}
        </span>
        <div className="flex-1">
          <p className="text-white font-medium">{clause.plainEnglish}</p>
          <p className="text-gray-500 text-xs mt-1 font-mono">{clause.originalText.slice(0, 100)}…</p>
        </div>
        <span className="text-gray-500 text-sm">▼</span>
      </summary>

      <div className="px-5 pb-5 space-y-5">
        <hr className="border-surface-border" />

        {/* Original text */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Original clause</div>
          <p className="text-gray-300 text-sm bg-surface-overlay rounded-lg p-4 font-mono leading-relaxed">
            {clause.originalText}
          </p>
        </div>

        {/* Risk explanation */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Why this is a risk</div>
          <p className="text-gray-300 text-sm">{clause.riskExplanation}</p>
        </div>

        {/* Counter clause */}
        {clause.counterClause && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Suggested counter-clause</div>
            <p className="text-emerald-300 text-sm bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 font-mono leading-relaxed">
              {clause.counterClause}
            </p>
          </div>
        )}

        {/* Ready to send */}
        {clause.readyToSendText && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ready-to-send message</div>
            <div className="bg-brand-600/10 border border-brand-500/20 rounded-lg p-4">
              <p className="text-brand-200 text-sm leading-relaxed">{clause.readyToSendText}</p>
              <button
                id={`copy-clause-${clause.id}`}
                className="mt-3 text-brand-400 text-xs hover:text-brand-300 transition-colors font-medium"
                type="button"
              >
                📋 Copy to clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
