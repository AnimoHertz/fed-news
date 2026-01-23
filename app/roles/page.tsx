import { fetchTierDistribution } from '@/lib/github';
import { formatNumber } from '@/lib/utils';
import { Header } from '@/components/layout/Header';

export const revalidate = 300;

export const metadata = {
  title: 'Roles | Fed News',
  description: 'Holder tiers and reward multipliers for $FED token holders.',
};

const tiers = [
  { key: 'chairman', name: 'Fed Chairman', holdings: '50,000,000', multiplier: '1.5x', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { key: 'governor', name: 'Fed Governor', holdings: '10,000,000', multiplier: '1.25x', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { key: 'director', name: 'Regional Director', holdings: '1,000,000', multiplier: '1.1x', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { key: 'member', name: 'Board Member', holdings: '100,000', multiplier: '1.05x', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { key: 'citizen', name: 'Fed Citizen', holdings: 'Any', multiplier: '1.0x', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
];

const bonuses = [
  { name: 'Diamond Hands', description: 'Hold continuously without selling', max: '1.25x', note: 'Up to 1 year streak' },
  { name: 'Engagement', description: 'Participate and earn XP', max: '1.2x', note: 'Through community activity' },
  { name: 'Time Lock', description: 'Voluntarily lock your tokens', max: '2.0x', note: 'Longer locks = higher multiplier' },
];

export default async function RolesPage() {
  const distribution = await fetchTierDistribution();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Title */}
        <section className="mb-12">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">Roles</p>
          <h1 className="text-3xl font-medium mb-2">Holder Tiers</h1>
          <p className="text-gray-400">
            Your tier is determined by how much $FED you hold. Higher tiers earn bigger multipliers on USD1 distributions.
          </p>
          {distribution && (
            <p className="text-sm text-gray-500 mt-2">
              {formatNumber(distribution.total)} total holders
            </p>
          )}
        </section>

        {/* Tiers */}
        <section className="mb-16">
          <div className="space-y-3">
            {tiers.map((tier) => {
              const count = distribution ? distribution[tier.key as keyof typeof distribution] : null;
              return (
                <div
                  key={tier.name}
                  className={`p-4 rounded-lg border ${tier.bg} ${tier.border}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className={`font-medium ${tier.color}`}>{tier.name}</h3>
                        {count !== null && typeof count === 'number' && (
                          <span className="text-xs font-mono text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded">
                            {formatNumber(count)} holder{count !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {tier.holdings === 'Any' ? 'Any amount' : `${tier.holdings} $FED`}
                      </p>
                    </div>
                    <div className={`text-2xl font-mono ${tier.color}`}>
                      {tier.multiplier}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bonus Multipliers */}
        <section className="mb-16">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">
            Bonus Multipliers
          </h2>
          <p className="text-gray-400 mb-6">
            These stack on top of your tier multiplier. Maximize your rewards by combining all bonuses.
          </p>
          <div className="space-y-3">
            {bonuses.map((bonus) => (
              <div
                key={bonus.name}
                className="p-4 rounded-lg border border-gray-800 bg-gray-900/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{bonus.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{bonus.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-mono text-white">up to {bonus.max}</div>
                    <p className="text-xs text-gray-500 mt-1">{bonus.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Max Multiplier */}
        <section className="mb-16">
          <div className="p-6 rounded-lg border border-amber-500/30 bg-amber-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-amber-400">Maximum Multiplier</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Fed Chairman + all bonuses maxed
                </p>
              </div>
              <div className="text-3xl font-mono text-amber-400">4.5x</div>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-500/20">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">During QE milestone events</p>
                <div className="text-xl font-mono text-amber-300">13.5x</div>
              </div>
            </div>
          </div>
        </section>

        {/* Info */}
        <section className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-500">
            Multipliers affect USD1 distribution amounts. Your tier updates automatically based on your wallet balance at distribution time.
          </p>
        </section>
      </main>
    </div>
  );
}
