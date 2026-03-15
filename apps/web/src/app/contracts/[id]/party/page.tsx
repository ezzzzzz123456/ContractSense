import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Party Intelligence' };

const mockParty = {
  counterpartyName: 'Acme Corp',
  trustScore: 65,
  reputationSummary:
    'Acme Corp is a mid-sized B2B SaaS company founded in 2015. While financially stable, they have faced one employment lawsuit (settled 2023) and have below-average employee satisfaction scores.',
  redFlags: [
    'Named defendant in 2023 employment practices lawsuit (settled, terms undisclosed)',
    'Glassdoor rating: 2.1/5 — multiple reviews cite poor management and high turnover',
    'No BBB accreditation found',
  ],
  sources: [
    { url: '#', title: 'Acme Corp Lawsuit 2023 — CourtListener', snippet: 'Employment practices lawsuit filed March 2023, settled November 2023...' },
    { url: '#', title: 'Acme Corp Reviews — Glassdoor', snippet: '2.1/5 stars. 243 reviews. "High pressure, low pay." —Former employee' },
  ],
};

export default function PartyPage({ params }: { params: { id: string } }) {
  const { counterpartyName, trustScore, reputationSummary, redFlags, sources } = mockParty;

  const scoreColor = trustScore >= 70 ? 'text-emerald-400' : trustScore >= 40 ? 'text-amber-400' : 'text-red-400';
  const scoreLabel = trustScore >= 70 ? 'Trustworthy' : trustScore >= 40 ? 'Proceed with Caution' : 'High Risk';

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-surface-raised/50 backdrop-blur-md px-6 h-16 flex items-center gap-4">
        <Link href={`/contracts/${params.id}/report`} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Report
        </Link>
        <span className="text-surface-border">/</span>
        <span className="text-white text-sm font-medium">Party Intelligence</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Party Intelligence</h1>
        <p className="text-gray-400 mb-8">
          AI-powered research on <span className="text-white font-medium">{counterpartyName}</span>
        </p>

        {/* Trust Score Card */}
        <div className="glass-card p-8 mb-6 flex items-center gap-8">
          <div className="text-center">
            <div className={`text-6xl font-black ${scoreColor}`}>{trustScore}</div>
            <div className="text-gray-400 text-sm mt-1">Trust Score</div>
          </div>
          <div className="flex-1">
            <div className={`text-xl font-bold mb-2 ${scoreColor}`}>{scoreLabel}</div>
            <p className="text-gray-300 text-sm leading-relaxed">{reputationSummary}</p>
          </div>
        </div>

        {/* Red Flags */}
        {redFlags.length > 0 && (
          <div className="glass-card p-6 mb-6 border-red-500/30">
            <h2 className="text-lg font-bold text-red-400 mb-4">⚠️ Red Flags Found</h2>
            <ul className="space-y-3">
              {redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-red-400 mt-0.5 shrink-0">•</span>
                  <span className="text-gray-300 text-sm">{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">Sources</h2>
          <div className="space-y-4">
            {sources.map((s, i) => (
              <div key={i} className="bg-surface-overlay rounded-lg p-4 border border-surface-border">
                <a
                  href={s.url}
                  id={`source-${i}`}
                  className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.title} ↗
                </a>
                <p className="text-gray-500 text-xs mt-1">{s.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
