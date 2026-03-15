import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Outcome Simulator' };

const mockMessages = [
  {
    role: 'user' as const,
    content: 'What happens if I violate the non-compete clause?',
  },
  {
    role: 'assistant' as const,
    content:
      'If you violate the non-compete clause as written — working for a competitor within 24 months of leaving — the company could seek an injunction (a court order forcing you to stop) and sue for damages. Even if the clause is ultimately unenforceable in your state, litigation is expensive and career-damaging.\n\nMy advice: Do not sign this clause without negotiating it down to 3-6 months first. This is your most urgent priority.',
  },
];

export default function ChatPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-surface-raised/50 backdrop-blur-md px-6 h-16 flex items-center gap-4 shrink-0">
        <Link href={`/contracts/${params.id}/report`} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Report
        </Link>
        <span className="text-surface-border">/</span>
        <span className="text-white text-sm font-medium">Outcome Simulator</span>
        <div className="ml-auto">
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            🤖 Context-aware AI
          </span>
        </div>
      </nav>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full space-y-6">
        <div className="text-center">
          <div className="inline-block text-xs text-gray-500 bg-surface-overlay rounded-full px-4 py-1.5 border border-surface-border">
            AI is aware of your full contract and all clause details
          </div>
        </div>

        {mockMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
              msg.role === 'user' ? 'bg-brand-600' : 'bg-purple-600'
            }`}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600/30 border border-brand-500/30 text-white'
                  : 'glass-card text-gray-200'
              }`}
            >
              {msg.content.split('\n').map((line, j) => (
                <p key={j} className={j > 0 ? 'mt-3' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-surface-border bg-surface-raised/50 px-6 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            id="chat-input"
            type="text"
            placeholder="Ask anything about your contract…"
            className="input-field flex-1"
          />
          <button
            id="chat-send-btn"
            type="button"
            className="btn-primary px-6 rounded-xl"
          >
            Send →
          </button>
        </div>
        <p className="text-xs text-gray-600 text-center mt-2">
          AI responses are informational only. Always consult a qualified lawyer for legal advice.
        </p>
      </div>
    </div>
  );
}
