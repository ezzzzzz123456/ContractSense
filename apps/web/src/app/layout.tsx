import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    template: '%s | ContractSense',
    default: 'ContractSense — AI-Powered Contract Analysis',
  },
  description:
    'ContractSense analyses your contracts with AI, flags risks, and connects you with verified lawyers. Understand every clause before you sign.',
  keywords: ['contract analysis', 'AI legal', 'contract review', 'lawyer marketplace', 'trust seal'],
  openGraph: {
    title: 'ContractSense — AI-Powered Contract Analysis',
    description: 'Analyse contracts, flag risks, and hire verified lawyers — all in one platform.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
