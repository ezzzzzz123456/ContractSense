import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Create Account' };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold">CS</span>
            </div>
            <span className="font-bold text-white text-xl">ContractSense</span>
          </Link>
        </div>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm mb-8">Start analysing contracts for free</p>

          <form id="register-form" className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Alice Johnson"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="alice@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password <span className="text-gray-500">(min. 8 characters)</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Account type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  htmlFor="role-user"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-surface-border bg-surface-overlay cursor-pointer hover:border-brand-500 transition-colors"
                >
                  <input type="radio" id="role-user" name="role" value="user" defaultChecked className="sr-only" />
                  <span className="text-2xl">📄</span>
                  <span className="text-sm font-medium text-white">User</span>
                  <span className="text-xs text-gray-500 text-center">Upload &amp; analyse contracts</span>
                </label>
                <label
                  htmlFor="role-lawyer"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-surface-border bg-surface-overlay cursor-pointer hover:border-brand-500 transition-colors"
                >
                  <input type="radio" id="role-lawyer" name="role" value="lawyer" className="sr-only" />
                  <span className="text-2xl">⚖️</span>
                  <span className="text-sm font-medium text-white">Lawyer</span>
                  <span className="text-xs text-gray-500 text-center">Review &amp; earn</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              id="register-submit"
              className="w-full btn-primary justify-center py-3 rounded-xl text-base font-semibold"
            >
              Create account →
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-gray-500 hover:text-gray-400 underline">Terms</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-gray-500 hover:text-gray-400 underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
