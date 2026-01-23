import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Incentives | Fed News',
  description: 'Learn how the $FED reward system distributes USD1 stablecoins to holders every 2 minutes.',
};

export default function IncentivesPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/logoseal.png" alt="FED logo" width={120} height={120} />
              <span className="text-xl font-medium">Fed News</span>
            </Link>
            <div className="flex gap-4 text-sm text-gray-400">
              <Link href="/payouts" className="hover:text-white transition-colors">
                Payouts
              </Link>
              <Link href="/manifesto" className="hover:text-white transition-colors">
                Manifesto
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        {/* Title */}
        <header className="mb-16">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">Incentives</p>
          <h1 className="text-4xl font-medium leading-tight mb-4">
            The Money Printer
          </h1>
          <p className="text-xl text-gray-400">
            Every 2 minutes, $FED holders receive USD1 stablecoins. Automatically. Forever.
          </p>
        </header>

        {/* Visual Flow Diagram */}
        <section className="mb-20">
          <div className="relative">
            {/* Step 1 */}
            <div className="flex gap-6 mb-8">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-mono text-lg">
                1
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-lg text-white font-medium mb-2">Trading Generates Fees</h3>
                <p className="text-gray-400 mb-4">
                  $FED trades on a{' '}
                  <a
                    href="https://solscan.io/account/8mLRmqBVfe91twjpCF3hqTtGNMJMsukhEd6GGjXpqs2i"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Meteora DAMM v2 pool
                  </a>
                  {' '}paired with USD1. Every swap generates fees that accumulate in the pool.
                </p>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="text-center px-3 py-2 bg-gray-800/50 rounded">
                      <div className="text-white font-medium">$FED</div>
                    </div>
                    <div className="text-green-400">⇄</div>
                    <div className="text-center px-3 py-2 bg-gray-800/50 rounded">
                      <div className="text-white font-medium">USD1</div>
                    </div>
                  </div>
                  <p className="text-center text-gray-500 text-xs mt-3">Meteora DAMM v2 Pool</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 mb-8">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono text-lg">
                2
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-lg text-white font-medium mb-2">The Bot Runs Every 2 Minutes</h3>
                <p className="text-gray-400 mb-4">
                  An autonomous bot monitors the pool and triggers distributions on a fixed schedule.
                  No human intervention required—it runs 24/7, forever.
                </p>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">while</span>
                    <span className="text-gray-300">(true) {'{'}</span>
                  </div>
                  <div className="pl-4 text-gray-400">
                    sleep(2 minutes)
                  </div>
                  <div className="pl-4 text-gray-400">
                    claim_and_distribute()
                  </div>
                  <span className="text-gray-300">{'}'}</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 mb-8">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono text-lg">
                3
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-lg text-white font-medium mb-2">Fees Claimed as USD1</h3>
                <p className="text-gray-400 mb-4">
                  The bot claims the accumulated fees from the pool. Since the pool is $FED/USD1,
                  holders receive USD1 stablecoins—real dollar value, not volatile tokens.
                </p>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl mb-1">💰</div>
                      <div className="text-gray-500 text-xs">Pool Fees</div>
                    </div>
                    <div className="text-purple-400 text-2xl">→</div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">USD1</div>
                      <div className="text-gray-500 text-xs">Stablecoin</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-lg">
                4
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-lg text-white font-medium mb-2">Holders Get Paid</h3>
                <p className="text-gray-400 mb-4">
                  USD1 is distributed proportionally to all $FED holders. The more $FED you hold,
                  the larger your share of each distribution.
                </p>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Holder A (10%)</span>
                      <span className="text-amber-400">→ 10% of USD1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Holder B (5%)</span>
                      <span className="text-amber-400">→ 5% of USD1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Holder C (1%)</span>
                      <span className="text-amber-400">→ 1% of USD1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Points */}
        <section className="mb-16">
          <h2 className="text-2xl text-white font-medium mb-8">Why This Works</h2>

          <div className="grid gap-6">
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⏰</div>
                <div>
                  <h3 className="text-white font-medium mb-2">Predictable & Frequent</h3>
                  <p className="text-gray-400 text-sm">
                    Distributions happen every 2 minutes like clockwork. No waiting for monthly
                    or quarterly payouts. The system runs 24/7, 365 days a year.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🤖</div>
                <div>
                  <h3 className="text-white font-medium mb-2">Fully Autonomous</h3>
                  <p className="text-gray-400 text-sm">
                    No human needs to push a button. The bot runs independently, collecting and
                    distributing fees without any manual intervention. It can&apos;t be stopped or paused.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">💵</div>
                <div>
                  <h3 className="text-white font-medium mb-2">Stable Rewards</h3>
                  <p className="text-gray-400 text-sm">
                    You receive USD1 stablecoins, not volatile tokens. Whether $FED goes up or
                    down, your rewards maintain their dollar value.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📊</div>
                <div>
                  <h3 className="text-white font-medium mb-2">Proportional Distribution</h3>
                  <p className="text-gray-400 text-sm">
                    Rewards are distributed based on your share of the total supply.
                    Own 1% of $FED? You get 1% of every distribution. Simple math.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Flywheel */}
        <section className="mb-16">
          <h2 className="text-2xl text-white font-medium mb-6">The Flywheel Effect</h2>
          <p className="text-gray-400 mb-8">
            The system creates a positive feedback loop that benefits all participants:
          </p>

          <div className="relative bg-gray-900/30 border border-gray-800 rounded-lg p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg w-full max-w-xs">
                <p className="text-green-400 font-medium">More Trading Volume</p>
                <p className="text-gray-500 text-sm">People buy and sell $FED</p>
              </div>

              <div className="text-gray-500 text-2xl">↓</div>

              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg w-full max-w-xs">
                <p className="text-blue-400 font-medium">More Fees Collected</p>
                <p className="text-gray-500 text-sm">Meteora pool accumulates fees</p>
              </div>

              <div className="text-gray-500 text-2xl">↓</div>

              <div className="text-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg w-full max-w-xs">
                <p className="text-purple-400 font-medium">Bigger Distributions</p>
                <p className="text-gray-500 text-sm">More USD1 for holders</p>
              </div>

              <div className="text-gray-500 text-2xl">↓</div>

              <div className="text-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg w-full max-w-xs">
                <p className="text-amber-400 font-medium">Higher Demand</p>
                <p className="text-gray-500 text-sm">More people want to hold $FED</p>
              </div>

              <div className="text-gray-500 text-2xl">↓</div>

              <div className="text-center text-gray-500 text-sm">
                ↩ Cycle repeats
              </div>
            </div>
          </div>
        </section>

        {/* The Pool */}
        <section className="mb-16">
          <h2 className="text-2xl text-white font-medium mb-6">The Liquidity Pool</h2>
          <p className="text-gray-400 mb-6">
            $FED trades on a Meteora Dynamic AMM (DAMM) v2 pool paired with USD1, the World Liberty Financial stablecoin.
            This pool type automatically adjusts to market conditions and generates fees from every trade.
          </p>

          <a
            href="https://solscan.io/account/8mLRmqBVfe91twjpCF3hqTtGNMJMsukhEd6GGjXpqs2i"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-lg">M</span>
                </div>
                <div>
                  <h3 className="text-white font-medium">Meteora DAMM v2</h3>
                  <p className="text-gray-500 text-sm">$FED / USD1 Pool</p>
                </div>
              </div>
              <span className="text-gray-500 group-hover:text-white transition-colors">
                View on Solscan →
              </span>
            </div>
            <div className="font-mono text-xs text-gray-600 break-all">
              8mLRmqBVfe91twjpCF3hqTtGNMJMsukhEd6GGjXpqs2i
            </div>
          </a>
        </section>

        {/* Quick Stats */}
        <section className="mb-16">
          <h2 className="text-2xl text-white font-medium mb-6">By The Numbers</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-mono text-white mb-2">2 min</div>
              <div className="text-gray-500 text-sm">Distribution frequency</div>
            </div>
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-mono text-white mb-2">720</div>
              <div className="text-gray-500 text-sm">Distributions per day</div>
            </div>
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-mono text-white mb-2">USD1</div>
              <div className="text-gray-500 text-sm">Reward token</div>
            </div>
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-mono text-white mb-2">24/7</div>
              <div className="text-gray-500 text-sm">Always running</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-gray-800 pt-12">
          <div className="text-center">
            <p className="text-gray-400 mb-6">
              Ready to start earning? Check your past distributions or view the project&apos;s progress.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/payouts"
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Check Your Payouts
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-gray-700 rounded-lg text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
              >
                View Updates
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
