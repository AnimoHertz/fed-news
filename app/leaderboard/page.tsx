'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

interface RarityTiers {
  legendary: number;
  epic: number;
  rare: number;
  uncommon: number;
  common: number;
}

interface LeaderboardEntry {
  rank: number;
  wallet: string;
  agentCount: number;
  totalSpent: number;
  highestRarity: number;
  averageRarity: number;
  rarityTiers: RarityTiers;
  latestMint: string;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  totalAgents: number;
  totalRaised: number;
}

type SortOption = 'agents' | 'spent' | 'rarity' | 'recent';

function formatAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatFed(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toLocaleString();
}

function getRarityColor(score: number): string {
  if (score >= 800) return 'text-yellow-400';
  if (score >= 600) return 'text-purple-400';
  if (score >= 400) return 'text-blue-400';
  if (score >= 200) return 'text-emerald-400';
  return 'text-gray-400';
}

function getRarityLabel(score: number): string {
  if (score >= 800) return 'Legendary';
  if (score >= 600) return 'Epic';
  if (score >= 400) return 'Rare';
  if (score >= 200) return 'Uncommon';
  return 'Common';
}

function RarityBadges({ tiers }: { tiers: RarityTiers }) {
  const badges = [];
  if (tiers.legendary > 0) {
    badges.push(
      <span key="legendary" className="px-1.5 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400 font-mono">
        {tiers.legendary}L
      </span>
    );
  }
  if (tiers.epic > 0) {
    badges.push(
      <span key="epic" className="px-1.5 py-0.5 text-xs rounded bg-purple-500/20 text-purple-400 font-mono">
        {tiers.epic}E
      </span>
    );
  }
  if (tiers.rare > 0) {
    badges.push(
      <span key="rare" className="px-1.5 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400 font-mono">
        {tiers.rare}R
      </span>
    );
  }
  if (tiers.uncommon > 0) {
    badges.push(
      <span key="uncommon" className="px-1.5 py-0.5 text-xs rounded bg-emerald-500/20 text-emerald-400 font-mono">
        {tiers.uncommon}U
      </span>
    );
  }
  if (tiers.common > 0) {
    badges.push(
      <span key="common" className="px-1.5 py-0.5 text-xs rounded bg-gray-500/20 text-gray-400 font-mono">
        {tiers.common}C
      </span>
    );
  }
  return <div className="flex gap-1 flex-wrap">{badges}</div>;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('agents');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/agents/leaderboard?sort=${sort}&limit=50`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sort]);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Stats Bar */}
      {data && (
        <div className="border-b border-gray-800/50">
          <div className="max-w-5xl mx-auto px-4 py-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Total Agents:</span>
                <span className="text-emerald-400 font-mono">{data.totalAgents}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Collectors:</span>
                <span className="text-white font-mono">{data.total}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">$FED Raised:</span>
                <span className="text-emerald-400 font-mono">{formatFed(data.totalRaised)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-4">
        {/* Title and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-white">Agent Leaderboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-gray-600"
            >
              <option value="agents">Most Agents</option>
              <option value="spent">Most Spent</option>
              <option value="rarity">Highest Rarity</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-gray-400">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading leaderboard...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-24">
            <div className="text-red-400">{error}</div>
          </div>
        )}

        {data && !loading && (
          <>
            {data.entries.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                No agents minted yet. Be the first collector!
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {data.entries.map((entry) => (
                    <Link
                      key={entry.wallet}
                      href={`/profile/${entry.wallet}`}
                      className="block p-3 rounded-lg border border-gray-800/50 hover:border-gray-700 bg-gray-900/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm ${entry.rank <= 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                            #{entry.rank}
                          </span>
                          <span className="font-mono text-gray-300 text-sm">
                            {formatAddress(entry.wallet)}
                          </span>
                        </div>
                        <span className="font-mono text-white text-sm font-bold">
                          {entry.agentCount} {entry.agentCount === 1 ? 'agent' : 'agents'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-500">Spent: {formatFed(entry.totalSpent)} $FED</span>
                        <span className={getRarityColor(entry.highestRarity)}>
                          Best: {getRarityLabel(entry.highestRarity)}
                        </span>
                      </div>
                      <RarityBadges tiers={entry.rarityTiers} />
                    </Link>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b border-gray-800/50">
                        <th className="pb-3 font-medium">Rank</th>
                        <th className="pb-3 font-medium">Collector</th>
                        <th className="pb-3 font-medium">Agents</th>
                        <th className="pb-3 font-medium">$FED Spent</th>
                        <th className="pb-3 font-medium">Best Rarity</th>
                        <th className="pb-3 font-medium">Collection</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {data.entries.map((entry) => (
                        <tr
                          key={entry.wallet}
                          className="border-b border-gray-800/30 hover:bg-gray-900/20 transition-colors"
                        >
                          <td className="py-3">
                            <span className={`font-mono ${entry.rank <= 3 ? 'text-yellow-400 font-bold' : 'text-gray-400'}`}>
                              {entry.rank}
                            </span>
                          </td>
                          <td className="py-3">
                            <Link
                              href={`/profile/${entry.wallet}`}
                              className="font-mono text-gray-300 hover:text-white transition-colors"
                            >
                              {formatAddress(entry.wallet)}
                            </Link>
                          </td>
                          <td className="py-3">
                            <span className="font-mono text-white font-bold">{entry.agentCount}</span>
                          </td>
                          <td className="py-3">
                            <span className="font-mono text-emerald-400">{formatFed(entry.totalSpent)}</span>
                          </td>
                          <td className="py-3">
                            <span className={`font-mono ${getRarityColor(entry.highestRarity)}`}>
                              {entry.highestRarity} ({getRarityLabel(entry.highestRarity)})
                            </span>
                          </td>
                          <td className="py-3">
                            <RarityBadges tiers={entry.rarityTiers} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing top collectors of Federal Agents NFTs
            </p>
            <Link
              href="/agents"
              className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Mint your own agent →
            </Link>
          </div>
          <p className="text-xs text-gray-600 pt-2 border-t border-gray-800 text-center">
            This project is not affiliated with the Federal Reserve System or any government entity. For memetic and satirical purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
