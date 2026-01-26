'use client';

import { useState, useEffect } from 'react';

interface HolderData {
  address: string;
  balance: number;
  percentage: number;
  valueUsd: number;
  usd1Earned: number;
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

function formatTokens(balance: number): string {
  if (balance >= 1_000_000_000) {
    return `${(balance / 1_000_000_000).toFixed(1)}B`;
  }
  if (balance >= 1_000_000) {
    return `${(balance / 1_000_000).toFixed(1)}M`;
  }
  if (balance >= 1_000) {
    return `${(balance / 1_000).toFixed(0)}K`;
  }
  return balance.toFixed(0);
}

export function HoldersTable() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
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
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      {/* Stats summary */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs sm:text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Top 10 Own:</span>
          <span className="text-white font-mono">{data.top10Percentage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Total Holders:</span>
          <span className="text-white font-mono">{data.totalHolders.toLocaleString()}</span>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-2">
        {data.holders.map((holder, index) => (
          <a
            key={holder.address}
            href={`https://solscan.io/account/${holder.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg border border-gray-800/30 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-mono text-xs">#{index + 1}</span>
                <span className="font-mono text-gray-300 text-sm">{formatAddress(holder.address)}</span>
              </div>
              <span className="font-mono text-white text-sm">{holder.percentage.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-3">
                <span className="text-gray-500">{formatTokens(holder.balance)}</span>
                <span className="text-gray-400">{formatValue(holder.valueUsd)}</span>
              </div>
              <span className="font-mono text-emerald-400">
                {holder.usd1Earned > 0 ? `+$${holder.usd1Earned.toFixed(2)}` : '-'}
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-gray-800/50">
              <th className="pb-3 font-medium">Rank</th>
              <th className="pb-3 font-medium">Holder</th>
              <th className="pb-3 font-medium">Tokens</th>
              <th className="pb-3 font-medium">% of Supply</th>
              <th className="pb-3 font-medium">Value</th>
              <th className="pb-3 font-medium">USD1 Earned</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.holders.map((holder, index) => (
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
                  <span className="font-mono text-gray-400">{formatTokens(holder.balance)}</span>
                </td>
                <td className="py-2">
                  <span className="font-mono text-white">{holder.percentage.toFixed(2)}%</span>
                </td>
                <td className="py-2">
                  <span className="font-mono text-gray-400">{formatValue(holder.valueUsd)}</span>
                </td>
                <td className="py-2">
                  <span className="font-mono text-emerald-400">
                    {holder.usd1Earned > 0 ? `$${holder.usd1Earned.toFixed(2)}` : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
