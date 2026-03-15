import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Lawyer Marketplace' };

const mockLawyers = [
  {
    id: 'lwy_01HXYZ001',
    name: 'Bob Martinez',
    jurisdiction: 'New York, USA',
    specialisations: ['employment', 'nda', 'service'],
    bio: '15 years in employment and corporate law. Former BigLaw associate. Helped 200+ clients protect their rights.',
    rating: 4.9,
    reviewCount: 83,
    pricePerReview: 249,
    currency: 'USD',
    isAvailable: true,
    avatarInitials: 'BM',
    avatarColor: 'bg-brand-600',
  },
  {
    id: 'lwy_01HXYZ002',
    name: 'Sarah Chen',
    jurisdiction: 'California, USA',
    specialisations: ['ip', 'freelance', 'partnership'],
    bio: 'IP and tech contracts specialist. Stanford Law grad. Expert in protecting creative and tech professionals.',
    rating: 4.7,
    reviewCount: 56,
    pricePerReview: 199,
    currency: 'USD',
    isAvailable: true,
    avatarInitials: 'SC',
    avatarColor: 'bg-purple-600',
  },
  {
    id: 'lwy_01HXYZ003',
    name: 'James Okafor',
    jurisdiction: 'London, UK',
    specialisations: ['lease', 'property', 'loan'],
    bio: 'UK property and commercial lease expert with 12 years at Magic Circle firms. Top 100 lawyer ranking.',
    rating: 4.8,
    reviewCount: 41,
    pricePerReview: 299,
    currency: 'USD',
    isAvailable: false,
    avatarInitials: 'JO',
    avatarColor: 'bg-emerald-600',
  },
];

const specialisationLabels: Record<string, string> = {
  employment: 'Employment',
  nda: 'NDA',
  service: 'Service',
  ip: 'IP',
  freelance: 'Freelance',
  partnership: 'Partnership',
  lease: 'Lease',
  property: 'Property',
  loan: 'Loan',
};

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-surface-raised/50 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="font-bold text-white">ContractSense</span>
          </Link>
        </div>
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
          My contracts →
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Verified Lawyer Marketplace</h1>
          <p className="text-gray-400">All lawyers are bar-verified. Pay only when you hire.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['All', 'Employment', 'NDA', 'Freelance', 'IP', 'Lease', 'Property'].map((f) => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                f === 'All'
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-overlay border border-surface-border text-gray-400 hover:text-white hover:border-brand-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Lawyers grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockLawyers.map((lawyer) => (
            <LawyerCard key={lawyer.id} lawyer={lawyer} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LawyerCard({ lawyer }: { lawyer: typeof mockLawyers[0] }) {
  return (
    <div className={`glass-card p-6 flex flex-col gap-4 hover:border-brand-600/50 transition-all duration-200 ${!lawyer.isAvailable ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-full ${lawyer.avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
          {lawyer.avatarInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{lawyer.name}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Verified" />
          </div>
          <div className="text-gray-400 text-xs mt-0.5">{lawyer.jurisdiction}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-amber-400 text-sm">★</span>
            <span className="text-white text-sm font-medium">{lawyer.rating}</span>
            <span className="text-gray-500 text-xs">({lawyer.reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-gray-400 text-sm leading-relaxed">{lawyer.bio}</p>

      {/* Specialisations */}
      <div className="flex flex-wrap gap-2">
        {lawyer.specialisations.map((s) => (
          <span key={s} className="text-xs bg-surface-overlay border border-surface-border text-gray-300 px-2.5 py-1 rounded-full">
            {specialisationLabels[s] ?? s}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-surface-border">
        <div>
          <span className="text-white font-bold text-lg">${lawyer.pricePerReview}</span>
          <span className="text-gray-500 text-xs ml-1">/ review</span>
        </div>
        {lawyer.isAvailable ? (
          <button
            id={`hire-${lawyer.id}`}
            className="btn-primary text-sm py-2 px-4"
            type="button"
          >
            Request review
          </button>
        ) : (
          <span className="text-gray-500 text-sm">Unavailable</span>
        )}
      </div>
    </div>
  );
}
