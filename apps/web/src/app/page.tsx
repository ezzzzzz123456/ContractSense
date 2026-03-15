import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ContractSense — AI-Powered Contract Analysis & Lawyer Marketplace',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface overflow-hidden">
      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">ContractSense</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-1.5 px-3">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm py-1.5 px-3">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-700/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 text-brand-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
            AI-Powered Legal Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Sign contracts with{' '}
            <span className="gradient-text">complete confidence</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any contract. Our AI analyses every clause, flags risks, generates counter-proposals,
            and connects you with verified lawyers — in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-base px-8 py-3 rounded-xl">
              Analyse my contract →
            </Link>
            <Link href="/marketplace" className="btn-secondary text-base px-8 py-3 rounded-xl">
              Browse lawyers
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ──────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-3">
            Everything you need to protect yourself
          </h2>
          <p className="text-gray-400 text-center mb-12">
            From upload to Trust Seal — the full lifecycle, covered.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {features.map((f) => (
              <div key={f.title} className="glass-card p-6 group hover:border-brand-600/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center mb-4 text-2xl group-hover:bg-brand-600/30 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Risk Badge Showcase ─────────────────────────────────── */}
      <section className="py-20 px-6 bg-surface-raised/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Instant risk visibility</h2>
          <p className="text-gray-400 mb-10">Every clause is classified and explained in plain English.</p>

          <div className="glass-card p-8">
            <div className="flex flex-col gap-4 text-left">
              <ClausePreview
                risk="red"
                clause="Non-Compete: 24-month restriction period following termination."
                explanation="Unusually long — may be unenforceable but could still trigger costly litigation."
              />
              <ClausePreview
                risk="yellow"
                clause="Termination: With or without cause, with 2 weeks notice."
                explanation="At-will termination with only 2 weeks notice is standard but provides limited job security."
              />
              <ClausePreview
                risk="green"
                clause="Salary: £85,000 per annum, reviewed annually."
                explanation="Standard and fair compensation clause. No concerns identified."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Seal Section ─────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 text-emerald-400 text-sm font-medium mb-6">
              ✓ Lawyer-Verified
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              The Trust Seal — proof a real lawyer reviewed this
            </h2>
            <p className="text-gray-400 leading-relaxed">
              After a verified lawyer reviews the AI analysis and signs off, a unique SHA-256 Trust Seal
              is generated. Share it publicly. Anyone can verify it instantly.
            </p>
          </div>
          <div className="glass-card p-8 flex flex-col items-center gap-4 min-w-56">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center">
              <span className="text-4xl">🛡️</span>
            </div>
            <div className="text-center">
              <div className="text-emerald-400 font-bold text-lg">Trust Seal</div>
              <div className="text-gray-500 text-xs font-mono mt-1">sha256:a3b4c5d6...</div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Verified by <span className="text-white">James Carter</span><br />
              Bar No. BAR123456 · NY
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-brand opacity-10 pointer-events-none" />
          <h2 className="text-3xl font-bold text-white mb-4 relative z-10">
            Ready to understand your contract?
          </h2>
          <p className="text-gray-400 mb-8 relative z-10">
            Join thousands of professionals who sign confidently with ContractSense.
          </p>
          <Link href="/register" className="btn-primary text-base px-8 py-3 rounded-xl relative z-10">
            Start for free →
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-surface-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-gray-500 text-sm">© 2026 ContractSense. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/marketplace" className="hover:text-white transition-colors">Lawyers</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

const features = [
  { icon: '🤖', title: 'AI Contract Analysis', desc: 'Every clause explained in plain English with risk flags, counter-clauses, and future risk predictions.' },
  { icon: '🔍', title: 'Party Intelligence', desc: 'Automatically research the counterparty — trust score, lawsuits, Glassdoor, BBB, and more.' },
  { icon: '⚖️', title: 'Lawyer Marketplace', desc: 'Browse verified lawyers by specialisation, rating, and price. Request a review in one click.' },
  { icon: '💬', title: 'Outcome Simulator', desc: 'Chat with the AI about any clause. "What happens if I violate this?" — answered in seconds.' },
  { icon: '🛡️', title: 'Trust Seal', desc: 'A cryptographic seal proving a real lawyer reviewed your contract. Verifiable by anyone, forever.' },
  { icon: '📄', title: 'Counter-Clause Generator', desc: 'Get a ready-to-send email with professional counter-proposals for every risky clause.' },
];

function ClausePreview({ risk, clause, explanation }: { risk: 'red' | 'yellow' | 'green'; clause: string; explanation: string }) {
  const badgeClass = { red: 'risk-red', yellow: 'risk-yellow', green: 'risk-green' }[risk];
  const label = { red: '🔴 High Risk', yellow: '🟡 Caution', green: '🟢 Safe' }[risk];

  return (
    <div className="flex items-start gap-4 p-4 bg-surface-overlay rounded-lg border border-surface-border">
      <span className={`${badgeClass} text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap`}>
        {label}
      </span>
      <div>
        <p className="text-white text-sm font-medium mb-1">{clause}</p>
        <p className="text-gray-400 text-xs">{explanation}</p>
      </div>
    </div>
  );
}
