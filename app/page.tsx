import Link from 'next/link';
import { fetchAllRecentCommits } from '@/lib/github';
import { parseCommit, filterCommits, getLatestStats } from '@/lib/commits';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { CommitList } from '@/components/commits/CommitList';

export const revalidate = 60;

export default async function HomePage() {
  const rawCommits = await fetchAllRecentCommits(100);
  const commits = rawCommits.map(parseCommit);
  const stats = getLatestStats(commits);
  const recentCommits = filterCommits(commits, { hideStats: true }).slice(0, 15);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium">Fed News</h1>
            <div className="flex gap-4 text-sm text-gray-400">
              <Link href="/manifesto" className="hover:text-white transition-colors">
                Manifesto
              </Link>
              <Link href="/docs" className="hover:text-white transition-colors">
                Docs
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

          {stats && (
            <div className="flex gap-8 font-mono text-2xl">
              <div>
                <span className="text-white">{formatCurrency(stats.distributed)}</span>
                <span className="text-gray-500 text-sm ml-2">distributed</span>
              </div>
              <div>
                <span className="text-white">{formatNumber(stats.distributions)}</span>
                <span className="text-gray-500 text-sm ml-2">distributions</span>
              </div>
            </div>
          )}
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
        <div className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-600">
            Data from{' '}
            <a
              href="https://github.com/snark-tank/ralph"
              className="text-gray-400 hover:text-white"
            >
              snark-tank/ralph
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
