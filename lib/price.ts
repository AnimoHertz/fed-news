const FED_TOKEN_ADDRESS = '132STreShuLRNgkyF1QECv37yP9Cdp8JBAgnKBgKafed';

export interface TokenPrice {
  priceUsd: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
}

export async function fetchTokenPrice(): Promise<TokenPrice | null> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${FED_TOKEN_ADDRESS}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      console.error('DexScreener API error:', response.status);
      return null;
    }

    const data = await response.json();
    const pair = data.pairs?.[0];

    if (!pair) {
      console.error('No pair data found');
      return null;
    }

    return {
      priceUsd: parseFloat(pair.priceUsd) || 0,
      priceChange24h: pair.priceChange?.h24 || 0,
      volume24h: pair.volume?.h24 || 0,
      liquidity: pair.liquidity?.usd || 0,
      marketCap: pair.fdv || 0,
    };
  } catch (error) {
    console.error('Failed to fetch token price:', error);
    return null;
  }
}

export function formatPrice(price: number): string {
  if (price < 0.00001) {
    return `$${price.toExponential(2)}`;
  }
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  }
  if (price < 1) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toFixed(2)}`;
}

export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
}

export const JUPITER_SWAP_URL = `https://jup.ag/swap/SOL-${FED_TOKEN_ADDRESS}`;
export const DEXSCREENER_URL = `https://dexscreener.com/solana/${FED_TOKEN_ADDRESS}`;
