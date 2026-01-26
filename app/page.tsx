import Link from 'next/link';
import { fetchAllRecentCommits, fetchHolderCount } from '@/lib/github';
import { parseCommit, filterCommits, getLatestStats } from '@/lib/commits';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { fetchTokenPrice, formatPrice, formatLargeNumber, JUPITER_SWAP_URL, DEXSCREENER_URL } from '@/lib/price';
import { getCommentCounts } from '@/lib/update-comments';
import { CommitList } from '@/components/commits/CommitList';
import { CopyAddress } from '@/components/ui/CopyAddress';
import { Header } from '@/components/layout/Header';
import { BackgroundAnimation } from '@/components/home/BackgroundAnimation';
import { StatsDisplay } from '@/components/home/StatsDisplay';
import { ResearchBanner } from '@/components/home/ResearchBanner';
import { ForumCard } from '@/components/home/ForumCard';

export const revalidate = 60;

export default async function HomePage() {
  const [rawCommits, holderCount, price] = await Promise.all([
    fetchAllRecentCommits(100),
    fetchHolderCount(),
    fetchTokenPrice(),
  ]);
  const commits = rawCommits.map(parseCommit);
  const stats = getLatestStats(commits);
  const recentCommits = filterCommits(commits, { hideStats: true }).slice(0, 15);

  // Get research commits for the banner
  const researchCommits = commits.filter(c => c.category === 'research');
  const latestResearch = researchCommits[0] || null;

  // Fetch comment counts for displayed commits
  const commentCounts = await getCommentCounts(recentCommits.map(c => c.sha));

  return (
    <div className="min-h-screen relative">
      <BackgroundAnimation />
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Manifesto Excerpt */}
        <section className="mb-16">
          <div className="animated-border animated-border-slow relative rounded-xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-8 md:p-10 overflow-hidden">

            <h1 className="text-3xl md:text-4xl font-medium text-white mb-3">
              The First Self-Evolving Crypto Mechanism
            </h1>

            <p className="text-lg text-gray-400 mb-8">
              Novel Crypto Mechanism Built by AI. In real-time. While you watch.
            </p>

            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              For the first time, a crypto project isn&apos;t just using AI as a tool. It&apos;s being{' '}
              <span className="text-white font-medium">built by AI</span>, continuously, autonomously, in the open.
              Every commit you see on this site was written by an AI working through problems,
              making decisions, and shipping code. Not once. Not as a gimmick. But as the
              fundamental architecture of how this project evolves.
            </p>

            <Link
              href="/manifesto"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white text-sm font-medium transition-all hover:gap-3"
            >
              Read the full manifesto
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Hero */}
        <section className="mb-16">
          {/* Stats */}
          {(stats || holderCount) && (
            <div className="mb-8">
              <StatsDisplay
                distributed={stats?.distributed ?? 0}
                distributions={stats?.distributions ?? 0}
                holders={holderCount ?? 0}
              />
            </div>
          )}

          {/* Price Widget */}
          {price && (
            <div className="mb-8 animated-border animated-border-emerald animated-border-subtle">
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-6 p-4 rounded-t-lg bg-gray-900/30">
                <div className="flex items-center justify-between sm:justify-start">
                  <span className="text-2xl sm:text-3xl font-mono text-white">{formatPrice(price.priceUsd)}</span>
                  <span className={`ml-3 text-sm font-mono ${price.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {price.priceChange24h >= 0 ? '+' : ''}{price.priceChange24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex gap-4 sm:gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">MCap</span>
                    <span className="text-white ml-2">{formatLargeNumber(price.marketCap)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">24h Vol</span>
                    <span className="text-white ml-2">{formatLargeNumber(price.volume24h)}</span>
                  </div>
                </div>
                <div className="flex gap-2 sm:ml-auto">
                  <a
                    href={DEXSCREENER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none text-center px-3 py-1.5 text-sm text-gray-400 border border-gray-700 rounded hover:text-white hover:border-gray-500 transition-colors"
                  >
                    Full Chart
                  </a>
                  <a
                    href={JUPITER_SWAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none text-center px-4 py-1.5 text-sm font-medium text-black bg-white rounded hover:bg-gray-200 transition-colors"
                  >
                    Buy $FED
                  </a>
                </div>
              </div>
              <div className="rounded-b-lg border-t border-gray-800 overflow-hidden">
                <iframe
                  src="https://dexscreener.com/solana/132STreShuLRNgkyF1QECv37yP9Cdp8JBAgnKBgKafed?embed=1&theme=dark&info=0&trades=0&chartLeftToolbar=0&chartDefaultOnMobile=1"
                  className="w-full h-[300px] sm:h-[400px]"
                  title="$FED Price Chart"
                />
              </div>
            </div>
          )}
        </section>

        {/* Forum Card */}
        <ForumCard />

        {/* Research Banner */}
        <ResearchBanner latestResearch={latestResearch} totalCount={researchCommits.length} />

        {/* Updates */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-medium text-white mb-3">
            Autonomous Github Commits
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-6">
            Every line of code below was written by an AI agent working autonomously. Watch the project evolve in real-time as Ralph ships features, fixes bugs, and builds new mechanisms.
          </p>

          <CommitList commits={recentCommits} commentCounts={commentCounts} />

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
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-3">
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
              href="https://github.com/snark-tank/ralph"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
              title="View on GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
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
          <p className="text-xs text-gray-600 pt-3 border-t border-gray-800">
            This project is not affiliated with the Federal Reserve System or any government entity. For memetic and satirical purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
