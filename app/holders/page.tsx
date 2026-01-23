'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';

interface HolderData {
  address: string;
  balance: number;
  percentage: number;
  valueUsd: number;
  pnl: number;
  pnlMultiple: number;
}

interface HoldersResponse {
  holders: HolderData[];
  price: number;
  marketCap: number;
  top10Percentage: number;
  totalHolders: number;
}

function formatAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 3)}...${address.slice(-3)}`;
}

function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatPnL(pnl: number, multiple: number): { text: string; isPositive: boolean } {
  const isPositive = pnl >= 0;
  const sign = isPositive ? '' : '-';
  const absValue = Math.abs(pnl);
  let valueText: string;

  if (absValue >= 1_000_000) {
    valueText = `$${(absValue / 1_000_000).toFixed(0)}M`;
  } else if (absValue >= 1_000) {
    valueText = `$${(absValue / 1_000).toFixed(0)}K`;
  } else {
    valueText = `$${absValue.toFixed(0)}`;
  }

  const multipleText = `(${multiple.toFixed(1)}x)`;
  return { text: `${sign}${valueText} ${multipleText}`, isPositive };
}

function formatPrice(price: number): string {
  if (price < 0.00001) {
    return `$${price.toExponential(2)}`;
  }
  if (price < 0.01) {
    return `$${price.toFixed(7)}`;
  }
  return `$${price.toFixed(4)}`;
}

function formatMarketCap(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toFixed(0);
}

export default function HoldersPage() {
  const [data, setData] = useState<HoldersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/holders');
        if (!response.ok) {
          throw new Error('Failed to fetch holder data');
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
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Stats Bar */}
      {data && (
        <div className="border-b border-gray-800/50">
          <div className="max-w-5xl mx-auto px-4 py-2">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Market Cap:</span>
                <span className="text-emerald-400 font-mono">
                  {formatMarketCap(data.marketCap)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Price:</span>
                <span className="text-white font-mono">{formatPrice(data.price)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Top 10 Holders Owned:</span>
                <span className="text-white font-mono">{data.top10Percentage.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">CA:</span>
                <span className="text-gray-400 font-mono text-xs">132S...afed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-4">
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
              <span>Loading holder data...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-24">
            <div className="text-red-400">{error}</div>
          </div>
        )}

        {data && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-800/50">
                  <th className="pb-3 font-medium">Rank</th>
                  <th className="pb-3 font-medium">Holder</th>
                  <th className="pb-3 font-medium">% of Supply</th>
                  <th className="pb-3 font-medium">Value</th>
                  <th className="pb-3 font-medium">PnL</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.holders.map((holder, index) => {
                  const pnlData = formatPnL(holder.pnl, holder.pnlMultiple);
                  return (
                    <tr
                      key={holder.address}
                      className="border-b border-gray-800/30 hover:bg-gray-900/20 transition-colors"
                    >
                      <td className="py-2 font-mono text-gray-400">
                        {index + 1}
                      </td>
                      <td className="py-2">
                        <a
                          href={`https://solscan.io/account/${holder.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-gray-300 hover:text-white transition-colors"
                        >
                          {formatAddress(holder.address)}
                        </a>
                      </td>
                      <td className="py-2">
                        <span className="font-mono text-white">{holder.percentage.toFixed(2)}%</span>
                      </td>
                      <td className="py-2">
                        <span className="font-mono text-gray-400">{formatValue(holder.valueUsd)}</span>
                      </td>
                      <td className="py-2">
                        <span
                          className={`font-mono ${
                            pnlData.isPositive ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {pnlData.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
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
            {' & '}
            <a
              href="https://dexscreener.com"
              className="text-gray-400 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              DexScreener
            </a>
          </p>
          <a
            href="https://github.com/snark-tank/ralph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
