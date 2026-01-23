import Image from 'next/image';
import Link from 'next/link';
import { fetchAllRecentCommits, fetchHolderCount } from '@/lib/github';
import { parseCommit, filterCommits, getLatestStats } from '@/lib/commits';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { CommitList } from '@/components/commits/CommitList';
import { CopyAddress } from '@/components/ui/CopyAddress';

export const revalidate = 60;

export default async function HomePage() {
  const [rawCommits, holderCount] = await Promise.all([
    fetchAllRecentCommits(100),
    fetchHolderCount(),
  ]);
  const commits = rawCommits.map(parseCommit);
  const stats = getLatestStats(commits);
  const recentCommits = filterCommits(commits, { hideStats: true }).slice(0, 15);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logoseal.png" alt="FED logo" width={120} height={120} />
              <h1 className="text-xl font-medium">Fed News</h1>
            </div>
            <div className="flex gap-4 text-sm text-gray-400">
              <Link href="/how-it-works" className="hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="/payouts" className="hover:text-white transition-colors">
                Payouts
              </Link>
              <Link href="/manifesto" className="hover:text-white transition-colors">
                Manifesto
              </Link>
              <a
                href="https://github.com/snark-tank/ralph"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="mb-16">
          <p className="text-gray-400 mb-4">Autonomous USD1 distribution on Solana</p>

          {(stats || holderCount) && (
            <div className="flex flex-wrap gap-8 font-mono text-2xl mb-8">
              {stats && (
                <>
                  <div>
                    <span className="text-white">{formatCurrency(stats.distributed)}</span>
                    <span className="text-gray-500 text-sm ml-2">distributed</span>
                  </div>
                  <div>
                    <span className="text-white">{formatNumber(stats.distributions)}</span>
                    <span className="text-gray-500 text-sm ml-2">distributions</span>
                  </div>
                </>
              )}
              {holderCount && (
                <div>
                  <span className="text-white">{formatNumber(holderCount)}</span>
                  <span className="text-gray-500 text-sm ml-2">holders</span>
                </div>
              )}
            </div>
          )}

          <p className="text-gray-400 leading-relaxed">
            $FED is the first crypto project built entirely by AI in real-time. An autonomous agent runs 24/7,
            writing code, making decisions, and distributing stablecoin rewards to holders every 2 minutes.
            No human team. No roadmap delays. Just a machine that never stops building.
          </p>
        </section>

        {/* Updates */}
        <section>
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">
            Recent Updates
          </h2>

          <CommitList commits={recentCommits} />

          <div className="mt-8">
            <Link
              href="/commits"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              View all updates →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Data from{' '}
              <a
                href="https://github.com/snark-tank/ralph"
                className="text-gray-400 hover:text-white"
              >
                snark-tank/ralph
              </a>
            </p>
            <a
              href="https://x.com/fed_USD1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
              title="Follow @fed_USD1 on X"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
          <CopyAddress address="132STreShuLRNgkyF1QECv37yP9Cdp8JBAgnKBgKafed" label="$FED Token" />
          <p className="text-xs text-gray-600">
            This site was developed by a third party and is not affiliated with or endorsed by the $FED project.
            Information displayed may be inaccurate or out of date. Do your own research.
          </p>
        </div>
      </footer>
    </div>
  );
}
