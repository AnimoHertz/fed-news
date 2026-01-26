'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/layout/Header';

interface Transfer {
  signature: string;
  timestamp: number;
  amount: number;
  from: string;
}

interface PayoutData {
  totalReceived: number;
  transferCount: number;
  transfers: Transfer[];
  fedBalance: number;
  tier: string;
  tierName: string;
  tierColor: string;
  tierMultiplier: number;
}

const bonusMultipliers = [
  { name: 'Diamond Hands', description: 'Hold continuously without selling', max: '1.25x', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
  { name: 'Engagement', description: 'Participate and earn XP', max: '1.2x', color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30' },
  { name: 'Time Lock', description: 'Voluntarily lock your tokens', max: '2.0x', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
];

function formatBalance(balance: number): string {
  if (balance >= 1_000_000) {
    return `${(balance / 1_000_000).toFixed(2)}M`;
  }
  if (balance >= 1_000) {
    return `${(balance / 1_000).toFixed(1)}K`;
  }
  return balance.toLocaleString();
}

export default function PayoutsPage() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PayoutData | null>(null);

  const isValidSolanaAddress = (addr: string) => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
  };

  const lookupPayouts = async () => {
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setError('Please enter an address');
      return;
    }

    if (!isValidSolanaAddress(trimmedAddress)) {
      setError('Invalid Solana address format');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Use our API route to fetch payout data (handles CORS)
      const response = await fetch(`/api/payouts?address=${encodeURIComponent(trimmedAddress)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch payout data');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lookup payouts');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      lookupPayouts();
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Title */}
        <section className="mb-12">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">Payouts</p>
          <h1 className="text-3xl font-medium mb-2">Check Your USD1 Payouts</h1>
          <p className="text-gray-400">
            Enter your Solana address to see how much USD1 you&apos;ve received from distributions.
          </p>
        </section>

        {/* Address Input */}
        <section className="mb-12">
          <div className="flex gap-3">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your Solana address"
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 font-mono text-sm"
            />
            <button
              onClick={lookupPayouts}
              disabled={loading}
              className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Lookup'}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-red-400 text-sm">{error}</p>
          )}
        </section>

        {/* Results */}
        {data && (
          <section>
            {/* Stats */}
            <div className="animated-border animated-border-emerald rounded-lg p-6 mb-8 bg-gray-900/50">
              <div className="flex flex-wrap gap-8 font-mono text-2xl">
                <div>
                  <span className="text-white">{formatCurrency(data.totalReceived)}</span>
                  <span className="text-gray-500 text-sm ml-2">received</span>
                </div>
                <div>
                  <span className="text-white">{data.transferCount}</span>
                  <span className="text-gray-500 text-sm ml-2">distributions</span>
                </div>
              </div>
            </div>

            {/* Your Multipliers */}
            <div className="mb-8">
              <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                Your Multipliers
              </h2>

              {/* Current Tier */}
              <div className={`p-4 rounded-lg mb-4 ${
                data.tier === 'chairman' ? 'animated-border animated-border-gold bg-yellow-500/10' :
                data.tier === 'governor' ? 'animated-border bg-purple-500/10' :
                data.tier === 'director' ? 'animated-border animated-border-cyan bg-blue-500/10' :
                data.tier === 'member' ? 'animated-border animated-border-emerald bg-emerald-500/10' :
                data.tier === 'citizen' ? 'border border-gray-500/30 bg-gray-500/10' :
                'border border-gray-700/30 bg-gray-800/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${data.tierColor}`}>{data.tierName}</span>
                      <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded font-mono">
                        {formatBalance(data.fedBalance)} $FED
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Your current tier based on holdings</p>
                  </div>
                  <div className={`text-2xl font-mono ${data.tierColor}`}>
                    {data.tierMultiplier}x
                  </div>
                </div>
              </div>

              {/* Bonus Multipliers */}
              <div className="space-y-2">
                {bonusMultipliers.map((bonus) => (
                  <div
                    key={bonus.name}
                    className={`p-3 rounded-lg border ${bonus.borderColor} ${bonus.bgColor} flex items-center justify-between`}
                  >
                    <div>
                      <span className={`text-sm font-medium ${bonus.color}`}>{bonus.name}</span>
                      <span className="text-gray-600 text-sm ml-2">·</span>
                      <span className="text-gray-500 text-sm ml-2">{bonus.description}</span>
                    </div>
                    <span className={`font-mono text-sm ${bonus.color}`}>up to {bonus.max}</span>
                  </div>
                ))}
              </div>

              {/* Max Potential */}
              <div className="mt-4 p-3 rounded-lg border border-gray-700 bg-gray-800/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Your max potential multiplier (with all bonuses)</span>
                  <span className="text-white font-mono">
                    {(data.tierMultiplier * 1.25 * 1.2 * 2.0).toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>

            {/* Transfer History */}
            {data.transfers.length > 0 && (
              <div>
                <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                  Recent Distributions
                </h2>
                <div className="space-y-2">
                  {data.transfers.map((transfer) => (
                    <a
                      key={transfer.signature}
                      href={`https://solscan.io/tx/${transfer.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-white font-mono">
                          +{formatCurrency(transfer.amount)}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {new Date(transfer.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        View →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {data.transferCount === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No USD1 distributions found for this address.</p>
                <p className="text-sm mt-2">
                  Make sure you&apos;re holding $FED tokens to receive distributions.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Info */}
        {!data && !loading && (
          <section className="border-t border-gray-800 pt-8">
            <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
              How it works
            </h2>
            <div className="space-y-4 text-gray-400 text-sm">
              <p>
                Every 2 minutes, the $FED system collects trading fees and distributes USD1
                stablecoins to token holders automatically.
              </p>
              <p>
                This page queries the Solana blockchain to show all USD1 transfers
                you&apos;ve received from distributions.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-2">
          <p className="text-sm text-gray-600">
            Data from{' '}
            <a
              href="https://helius.xyz"
              className="text-gray-400 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              Helius
            </a>
          </p>
          <p className="text-xs text-gray-600">
            This site was developed by a third party and is not affiliated with or endorsed by the $FED project.
          </p>
        </div>
      </footer>
    </div>
  );
}
