import { fetchGrowthData } from '@/lib/growth';
import { formatNumber, formatCurrency } from '@/lib/utils';
import {
  HolderCountChart,
  TierBreakdownChart,
  NewHoldersChart,
  WeeklyNewHoldersChart,
} from '@/components/growth/GrowthCharts';
import { Header } from '@/components/layout/Header';
import { SocialSection } from '@/components/growth/SocialSection';
import { HoldersTable } from '@/components/growth/HoldersTable';

export const revalidate = 300;

export const metadata = {
  title: 'Members | Federal Cash',
  description: 'Track the growth of the $FED community and connect on social media.',
};

export default async function GrowthPage() {
  const growthData = await fetchGrowthData();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Title */}
        <section className="mb-12">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">Analytics</p>
          <h1 className="text-3xl font-medium mb-2">Community Growth</h1>
          <p className="text-gray-400">
            Track how the $FED community is growing over time.
          </p>
        </section>

        {growthData ? (
          <>
            {/* Summary Stats */}
            <section className="mb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="animated-border animated-border-subtle p-4 rounded-lg bg-gray-900/30">
                  <p className="text-sm text-gray-500 mb-1">Total Holders</p>
                  <p className="text-2xl font-mono text-white">
                    {formatNumber(growthData.currentDistribution.total)}
                  </p>
                </div>
                <div className="animated-border animated-border-emerald animated-border-subtle p-4 rounded-lg bg-emerald-500/10">
                  <p className="text-sm text-gray-500 mb-1">30d Growth</p>
                  <p className="text-2xl font-mono text-emerald-400">
                    +{formatNumber(growthData.totalGrowth)}
                  </p>
                </div>
                <div className="animated-border animated-border-cyan animated-border-subtle p-4 rounded-lg bg-blue-500/10">
                  <p className="text-sm text-gray-500 mb-1">Growth Rate</p>
                  <p className="text-2xl font-mono text-blue-400">
                    +{growthData.growthPercent.toFixed(1)}%
                  </p>
                </div>
                <div className="animated-border animated-border-subtle p-4 rounded-lg bg-purple-500/10">
                  <p className="text-sm text-gray-500 mb-1">Avg Daily</p>
                  <p className="text-2xl font-mono text-purple-400">
                    +{Math.round(growthData.totalGrowth / 30)}
                  </p>
                </div>
              </div>
            </section>

            {/* USD1 Distributed by Tier */}
            <section className="mb-12">
              <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                USD1 Distributed by Tier
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Total USD1 paid out to each holder tier based on holdings and multipliers.
              </p>
              <div className="space-y-3">
                {growthData.tierPayouts.map((tier) => {
                  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
                    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
                    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
                    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
                    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
                    gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400' },
                  };
                  const colors = colorClasses[tier.color] || colorClasses.gray;

                  return (
                    <div
                      key={tier.tier}
                      className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-medium ${colors.text}`}>{tier.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatNumber(tier.holderCount)} holder{tier.holderCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-mono ${colors.text}`}>
                            {formatCurrency(tier.totalPaid)}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            ~{formatCurrency(tier.avgPerHolder)} avg/holder
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-4 rounded-lg animated-border animated-border-gold animated-border-slow bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Distributed</span>
                  <span className="text-2xl font-mono text-white">{formatCurrency(growthData.totalDistributed)}</span>
                </div>
              </div>
            </section>

            {/* Amount Burned */}
            {growthData.burnData && (
              <section className="mb-12">
                <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                  Amount Burned
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Tokens permanently removed from circulation, increasing scarcity for remaining holders.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/10">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Burned</p>
                    <p className="text-xl sm:text-2xl font-mono text-orange-400">
                      {formatNumber(Math.round(growthData.burnData.totalBurned))}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">% of Supply</p>
                    <p className="text-xl sm:text-2xl font-mono text-red-400">
                      {growthData.burnData.burnedPercentage.toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Current Supply</p>
                    <p className="text-xl sm:text-2xl font-mono text-white">
                      {formatNumber(Math.round(growthData.burnData.currentSupply))}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Original Supply</p>
                    <p className="text-xl sm:text-2xl font-mono text-gray-400">
                      {formatNumber(growthData.burnData.originalSupply)}
                    </p>
                  </div>
                </div>
                {/* Burn progress bar */}
                <div className="mt-4 p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Burn Progress</span>
                    <span className="text-orange-400 font-mono">{growthData.burnData.burnedPercentage.toFixed(2)}% burned</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                      style={{ width: `${Math.min(growthData.burnData.burnedPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Charts Section */}
            <section className="mb-12">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-medium text-white mb-2">Growth Charts</h2>
                <p className="text-gray-400 text-sm">Visual breakdown of holder growth and distribution over time.</p>
              </div>

              {/* Holder Count Over Time */}
              <div className="mb-8">
                <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                  Total Holders Over Time
              </h2>
              <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                <HolderCountChart data={growthData} />
              </div>
              </div>

              {/* Tier Breakdown Over Time */}
              <div className="mb-8">
                <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                  Tier Distribution Over Time
                </h3>
                <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <TierBreakdownChart data={growthData} />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Stacked area chart showing holder counts by tier
                </p>
              </div>

              {/* New Holders Per Day */}
              <div className="mb-8">
                <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                  New Holders Per Day
                </h3>
                <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <NewHoldersChart data={growthData} />
                </div>
              </div>

              {/* Weekly Summary */}
              <div>
                <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                  Weekly New Holders
                </h3>
                <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <WeeklyNewHoldersChart data={growthData} />
                </div>
              </div>
            </section>

            {/* Current Tier Breakdown */}
            <section className="mb-12">
              <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">
                Current Tier Breakdown
              </h2>
              <div className="space-y-2">
                {[
                  { key: 'chairman', name: 'Fed Chairman', shortName: 'Chairman', color: 'bg-yellow-500', count: growthData.currentDistribution.chairman },
                  { key: 'governor', name: 'Fed Governor', shortName: 'Governor', color: 'bg-purple-500', count: growthData.currentDistribution.governor },
                  { key: 'director', name: 'Regional Director', shortName: 'Director', color: 'bg-blue-500', count: growthData.currentDistribution.director },
                  { key: 'member', name: 'Board Member', shortName: 'Member', color: 'bg-emerald-500', count: growthData.currentDistribution.member },
                  { key: 'citizen', name: 'Fed Citizen', shortName: 'Citizen', color: 'bg-gray-500', count: growthData.currentDistribution.citizen },
                ].map((tier) => {
                  const percent = (tier.count / growthData.currentDistribution.total) * 100;
                  return (
                    <div key={tier.key} className="flex items-center gap-2 sm:gap-3">
                      <div className="w-16 sm:w-24 text-xs sm:text-sm text-gray-400 truncate">
                        <span className="sm:hidden">{tier.shortName}</span>
                        <span className="hidden sm:inline">{tier.name}</span>
                      </div>
                      <div className="flex-1 h-5 sm:h-6 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${tier.color} transition-all`}
                          style={{ width: `${Math.max(percent, 1)}%` }}
                        />
                      </div>
                      <div className="w-16 sm:w-20 text-right text-xs sm:text-sm font-mono text-gray-300">
                        {formatNumber(tier.count)} <span className="text-gray-600 hidden sm:inline">({percent.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Top Holders */}
            <section className="mb-12">
              <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">
                Top Holders
              </h2>
              <div className="p-4 rounded-lg animated-border animated-border-subtle animated-border-slow bg-gray-900/30">
                <HoldersTable />
              </div>
            </section>

            {/* Note */}
            <section className="border-t border-gray-800 pt-8">
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
                <p className="text-sm text-amber-300 font-medium mb-1">Sample Data</p>
                <p className="text-sm text-gray-400">
                  Historical data shown is generated based on current holder counts.
                  Real historical tracking requires daily snapshot collection.
                </p>
              </div>
            </section>

            {/* Social Section */}
            <SocialSection />
          </>
        ) : (
          <section className="py-20">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Unable to load growth data.</p>
              <p className="text-sm text-gray-600">
                Please check that the HELIUS_API environment variable is configured.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
