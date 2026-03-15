import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Dashboard' };

// Mock data — replace with real API calls when auth is implemented
const mockStats = {
  totalContracts: 3,
  analysed: 2,
  pending: 1,
  trustSeals: 1,
};

const mockContracts = [
  {
    id: 'ctr_01HXYZ001',
    fileName: 'employment_contract_acme.pdf',
    counterpartyName: 'Acme Corp',
    contractType: 'employment',
    status: 'analysed' as const,
    overallRiskScore: 72,
    redFlags: 3,
    yellowFlags: 5,
    greenFlags: 8,
    createdAt: '2026-03-10T10:00:00.000Z',
  },
  {
    id: 'ctr_01HXYZ002',
    fileName: 'freelance_agreement_dev.pdf',
    counterpartyName: 'DevStudio Ltd',
    contractType: 'freelance',
    status: 'analysed' as const,
    overallRiskScore: 45,
    redFlags: 1,
    yellowFlags: 3,
    greenFlags: 12,
    createdAt: '2026-03-08T14:00:00.000Z',
  },
  {
    id: 'ctr_01HXYZ003',
    fileName: 'nda_techcorp.docx',
    counterpartyName: 'TechCorp Inc',
    contractType: 'nda',
    status: 'processing' as const,
    overallRiskScore: null,
    redFlags: null,
    yellowFlags: null,
    greenFlags: null,
    createdAt: '2026-03-15T03:00:00.000Z',
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-surface-raised/50 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <span className="font-bold text-white">ContractSense</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/marketplace" className="text-gray-400 hover:text-white text-sm transition-colors">
            Marketplace
          </Link>
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">
            A
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Contracts</h1>
            <p className="text-gray-400 mt-1">Upload, analyse, and manage your contracts</p>
          </div>
          <Link href="/contracts/upload" id="upload-contract-btn" className="btn-primary px-6 py-2.5 rounded-xl">
            + Upload contract
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total contracts" value={mockStats.totalContracts} />
          <StatCard label="Analysed" value={mockStats.analysed} color="text-emerald-400" />
          <StatCard label="Processing" value={mockStats.pending} color="text-amber-400" />
          <StatCard label="Trust Seals" value={mockStats.trustSeals} color="text-brand-400" />
        </div>

        {/* Contracts list */}
        <div className="space-y-4">
          {mockContracts.map((contract) => (
            <ContractRow key={contract.id} contract={contract} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'text-white' }: { label: string; value: number; color?: string }) {
  return (
    <div className="glass-card p-5">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
    </div>
  );
}

type ContractStatus = 'analysed' | 'processing' | 'pending' | 'error' | 'sealed';

function ContractRow({ contract }: {
  contract: {
    id: string;
    fileName: string;
    counterpartyName: string;
    contractType: string;
    status: ContractStatus;
    overallRiskScore: number | null;
    redFlags: number | null;
    yellowFlags: number | null;
    greenFlags: number | null;
    createdAt: string;
  };
}) {
  const statusConfig: Record<ContractStatus, { label: string; class: string }> = {
    analysed: { label: 'Analysed', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    processing: { label: 'Processing…', class: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    pending: { label: 'Pending', class: 'text-gray-400 bg-gray-500/10 border-gray-500/30' },
    error: { label: 'Error', class: 'text-red-400 bg-red-500/10 border-red-500/30' },
    sealed: { label: 'Sealed ✓', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  };
  const statusInfo = statusConfig[contract.status];

  return (
    <div className="glass-card p-5 flex items-center gap-5 hover:border-brand-600/50 transition-all duration-200">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center shrink-0">
        <span className="text-2xl">📄</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-white font-semibold truncate">{contract.fileName}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{contract.counterpartyName}</span>
          <span className="capitalize">{contract.contractType}</span>
          <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Risk summary */}
      {contract.status === 'analysed' && contract.overallRiskScore !== null && (
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center">
            <div className={`text-lg font-bold ${contract.overallRiskScore > 60 ? 'text-red-400' : contract.overallRiskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {contract.overallRiskScore}
            </div>
            <div className="text-gray-500 text-xs">risk score</div>
          </div>
          <div className="flex gap-2">
            {contract.redFlags !== null && contract.redFlags > 0 && (
              <span className="risk-red text-xs px-2 py-1 rounded-full">{contract.redFlags}🔴</span>
            )}
            {contract.yellowFlags !== null && contract.yellowFlags > 0 && (
              <span className="risk-yellow text-xs px-2 py-1 rounded-full">{contract.yellowFlags}🟡</span>
            )}
            {contract.greenFlags !== null && contract.greenFlags > 0 && (
              <span className="risk-green text-xs px-2 py-1 rounded-full">{contract.greenFlags}🟢</span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="shrink-0">
        {contract.status === 'analysed' ? (
          <Link
            href={`/contracts/${contract.id}/report`}
            id={`view-report-${contract.id}`}
            className="btn-primary text-sm py-2 px-4"
          >
            View report →
          </Link>
        ) : (
          <div className="text-amber-400 text-sm animate-pulse-slow px-4">Analysing…</div>
        )}
      </div>
    </div>
  );
}
