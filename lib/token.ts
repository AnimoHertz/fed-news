import { HolderTier, TierInfo } from '@/types/chat';

const FED_TOKEN_MINT = '132STreShuLRNgkyF1QECv37yP9Cdp8JBAgnKBgKafed';
const HELIUS_API_URL = 'https://mainnet.helius-rpc.com';

const TIER_THRESHOLDS: { tier: HolderTier; min: number }[] = [
  { tier: 'chairman', min: 50_000_000 },
  { tier: 'governor', min: 10_000_000 },
  { tier: 'director', min: 1_000_000 },
  { tier: 'member', min: 100_000 },
  { tier: 'citizen', min: 1 },
  { tier: 'none', min: 0 },
];

export const TIER_INFO: Record<HolderTier, TierInfo> = {
  chairman: {
    tier: 'chairman',
    name: 'Fed Chairman',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  governor: {
    tier: 'governor',
    name: 'Fed Governor',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  director: {
    tier: 'director',
    name: 'Regional Director',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  member: {
    tier: 'member',
    name: 'Board Member',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  citizen: {
    tier: 'citizen',
    name: 'Fed Citizen',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  },
  none: {
    tier: 'none',
    name: 'Non-holder',
    color: 'text-gray-600',
    bgColor: 'bg-gray-800/30',
    borderColor: 'border-gray-700/30',
  },
};

export function getTierFromBalance(balance: number): HolderTier {
  for (const { tier, min } of TIER_THRESHOLDS) {
    if (balance >= min) {
      return tier;
    }
  }
  return 'none';
}

export function getTierInfo(tier: HolderTier): TierInfo {
  return TIER_INFO[tier];
}

export function formatBalance(balance: number): string {
  if (balance >= 1_000_000) {
    return `${(balance / 1_000_000).toFixed(1)}M`;
  }
  if (balance >= 1_000) {
    return `${(balance / 1_000).toFixed(1)}K`;
  }
  return balance.toFixed(0);
}

export async function fetchTokenBalance(walletAddress: string): Promise<number> {
  const apiKey = process.env.HELIUS_API_KEY || process.env.HELIUS_API;
  console.log('[fetchTokenBalance] Wallet:', walletAddress);
  console.log('[fetchTokenBalance] API Key exists:', !!apiKey);

  if (!apiKey) {
    console.error('HELIUS_API_KEY not configured');
    return 0;
  }

  try {
    const response = await fetch(`${HELIUS_API_URL}/?api-key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'fed-balance',
        method: 'getTokenAccountsByOwner',
        params: [
          walletAddress,
          { mint: FED_TOKEN_MINT },
          { encoding: 'jsonParsed' },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Helius API error:', response.status);
      return 0;
    }

    const data = await response.json();
    console.log('[fetchTokenBalance] Response:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('Helius RPC error:', data.error);
      return 0;
    }

    const accounts = data.result?.value || [];
    console.log('[fetchTokenBalance] Accounts found:', accounts.length);

    if (accounts.length === 0) {
      return 0;
    }

    // Sum up all token accounts (usually just one)
    let totalBalance = 0;
    for (const account of accounts) {
      const amount = account.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
      totalBalance += amount;
    }

    console.log('[fetchTokenBalance] Total balance:', totalBalance);
    return totalBalance;
  } catch (error) {
    console.error('Failed to fetch token balance:', error);
    return 0;
  }
}
