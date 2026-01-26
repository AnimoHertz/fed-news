'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { PayoutShareCard } from '@/components/payouts/PayoutShareCard';
import { MoneyPrinterAnimation } from '@/components/payouts/MoneyPrinterAnimation';

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

interface ProgressData {
  page: number;
  maxPages: number;
  transactionsScanned: number;
  transfersFound: number;
  totalSoFar: number;
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

function PayoutsContent() {
  const searchParams = useSearchParams();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PayoutData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [autoTriggered, setAutoTriggered] = useState(false);

  const isValidSolanaAddress = (addr: string) => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
  };

  // Auto-trigger lookup if address is provided in URL
  useEffect(() => {
    const urlAddress = searchParams.get('address');
    if (urlAddress && isValidSolanaAddress(urlAddress) && !autoTriggered) {
      setAddress(urlAddress);
      setAutoTriggered(true);
    }
  }, [searchParams, autoTriggered]);

  // Trigger lookup when address is set from URL
  useEffect(() => {
    if (autoTriggered && address && !loading && !data) {
      lookupPayouts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTriggered, address]);

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
    setProgress(null);
    setStatusMessage('Connecting...');

    try {
      const response = await fetch(`/api/payouts?address=${encodeURIComponent(trimmedAddress)}`);

      if (!response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payout data');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream not available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const event = JSON.parse(jsonStr);

              if (event.type === 'status') {
                setStatusMessage(event.message);
              } else if (event.type === 'progress') {
                setProgress({
                  page: event.page,
                  maxPages: event.maxPages,
                  transactionsScanned: event.transactionsScanned,
                  transfersFound: event.transfersFound,
                  totalSoFar: event.totalSoFar,
                });
                setStatusMessage(`Scanning page ${event.page}... Found ${event.transfersFound} distributions`);
              } else if (event.type === 'complete') {
                setData({
                  totalReceived: event.totalReceived,
                  transferCount: event.transferCount,
                  transfers: event.transfers,
                  fedBalance: event.fedBalance,
                  tier: event.tier,
                  tierName: event.tierName,
                  tierColor: event.tierColor,
                  tierMultiplier: event.tierMultiplier,
                });
                setProgress(null);
                setStatusMessage('');
              } else if (event.type === 'error') {
                throw new Error(event.message);
              }
            } catch (parseError) {
              console.error('Failed to parse event:', parseError);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lookup payouts');
    } finally {
      setLoading(false);
      setProgress(null);
      setStatusMessage('');
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
        {/* Title + Animation */}
        <section className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">Payouts</p>
            <h1 className="text-2xl sm:text-3xl font-medium mb-2">Check Your USD1 Payouts</h1>
            <p className="text-gray-400 text-sm sm:text-base">
              See how much has the new fed printer has paid you
            </p>
          </div>
          <div className="flex-shrink-0 hidden sm:block">
            <MoneyPrinterAnimation />
          </div>
        </section>

        {/* Address Input */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row gap-3">
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
              className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? 'Scanning...' : 'Lookup'}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-red-400 text-sm">{error}</p>
          )}
        </section>

        {/* Loading Progress */}
        {loading && (
          <section className="mb-12">
            <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{statusMessage}</span>
                  {progress && (
                    <span className="text-gray-500 font-mono">
                      {progress.transactionsScanned.toLocaleString()} txs scanned
                    </span>
                  )}
                </div>

                {progress && (
                  <>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(progress.page / progress.maxPages) * 100}%` }}
                      />
                    </div>

                    {/* Live Stats */}
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-emerald-400 font-mono">{formatCurrency(progress.totalSoFar)}</span>
                        <span className="text-gray-500 ml-2">found so far</span>
                      </div>
                      <div>
                        <span className="text-white font-mono">{progress.transfersFound}</span>
                        <span className="text-gray-500 ml-2">distributions</span>
                      </div>
                    </div>
                  </>
                )}

                {!progress && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm">Initializing...</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        {data && (
          <section>
            {/* Shareable Card */}
            <PayoutShareCard
              totalReceived={data.totalReceived}
              transferCount={data.transferCount}
              tierName={data.tierName}
              tierColor={data.tierColor}
              address={address}
            />

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
                    className={`p-3 rounded-lg border ${bonus.borderColor} ${bonus.bgColor} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2`}
                  >
                    <div>
                      <span className={`text-sm font-medium ${bonus.color}`}>{bonus.name}</span>
                      <span className="text-gray-600 text-sm ml-2 hidden sm:inline">·</span>
                      <span className="text-gray-500 text-xs sm:text-sm sm:ml-2 block sm:inline mt-0.5 sm:mt-0">{bonus.description}</span>
                    </div>
                    <span className={`font-mono text-xs sm:text-sm ${bonus.color}`}>up to {bonus.max}</span>
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

export default function PayoutsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-4 w-24 bg-gray-800 rounded mb-4" />
            <div className="h-8 w-64 bg-gray-800 rounded mb-2" />
            <div className="h-4 w-48 bg-gray-700 rounded" />
          </div>
        </main>
      </div>
    }>
      <PayoutsContent />
    </Suspense>
  );
}
