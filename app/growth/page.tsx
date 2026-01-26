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

export const revalidate = 300;

export const metadata = {
  title: 'Members | Fed News',
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
                <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <p className="text-sm text-gray-500 mb-1">Total Holders</p>
                  <p className="text-2xl font-mono text-white">
                    {formatNumber(growthData.currentDistribution.total)}
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                  <p className="text-sm text-gray-500 mb-1">30d Growth</p>
                  <p className="text-2xl font-mono text-emerald-400">
                    +{formatNumber(growthData.totalGrowth)}
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
                  <p className="text-sm text-gray-500 mb-1">Growth Rate</p>
                  <p className="text-2xl font-mono text-blue-400">
                    +{growthData.growthPercent.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/10">
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
              <div className="mt-4 p-4 rounded-lg border border-gray-800 bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Distributed</span>
                  <span className="text-2xl font-mono text-white">{formatCurrency(growthData.totalDistributed)}</span>
                </div>
              </div>
            </section>

            {/* Holder Count Over Time */}
            <section className="mb-12">
              <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                Total Holders Over Time
              </h2>
              <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                <HolderCountChart data={growthData} />
              </div>
            </section>

            {/* Tier Breakdown Over Time */}
            <section className="mb-12">
              <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                Tier Distribution Over Time
              </h2>
              <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                <TierBreakdownChart data={growthData} />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Stacked area chart showing holder counts by tier
              </p>
            </section>

            {/* New Holders Per Day */}
            <section className="mb-12">
              <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                New Holders Per Day
              </h2>
              <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                <NewHoldersChart data={growthData} />
              </div>
            </section>

            {/* Weekly Summary */}
            <section className="mb-12">
              <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                Weekly New Holders
              </h2>
              <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                <WeeklyNewHoldersChart data={growthData} />
              </div>
            </section>

            {/* Current Tier Breakdown */}
            <section className="mb-12">
              <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">
                Current Tier Breakdown
              </h2>
              <div className="space-y-2">
                {[
                  { key: 'chairman', name: 'Fed Chairman', color: 'bg-yellow-500', count: growthData.currentDistribution.chairman },
                  { key: 'governor', name: 'Fed Governor', color: 'bg-purple-500', count: growthData.currentDistribution.governor },
                  { key: 'director', name: 'Regional Director', color: 'bg-blue-500', count: growthData.currentDistribution.director },
                  { key: 'member', name: 'Board Member', color: 'bg-emerald-500', count: growthData.currentDistribution.member },
                  { key: 'citizen', name: 'Fed Citizen', color: 'bg-gray-500', count: growthData.currentDistribution.citizen },
                ].map((tier) => {
                  const percent = (tier.count / growthData.currentDistribution.total) * 100;
                  return (
                    <div key={tier.key} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-gray-400">{tier.name}</div>
                      <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${tier.color} transition-all`}
                          style={{ width: `${Math.max(percent, 1)}%` }}
                        />
                      </div>
                      <div className="w-20 text-right text-sm font-mono text-gray-300">
                        {formatNumber(tier.count)} <span className="text-gray-600">({percent.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
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
