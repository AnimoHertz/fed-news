import { NextResponse } from 'next/server';
import { fetchTokenPrice } from '@/lib/price';

const FED_TOKEN_MINT = '132STreShuLRNgkyF1QECv37yP9Cdp8JBAgnKBgKafed';
const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens

interface TokenAccount {
  address: string;
  owner: string;
  amount: string;
}

interface HolderData {
  address: string;
  balance: number;
  percentage: number;
  valueUsd: number;
}

export async function GET() {
  const heliusApiKey = process.env.HELIUS_API_KEY || process.env.HELIUS_API;

  if (!heliusApiKey) {
    return NextResponse.json({ error: 'Helius API key not configured' }, { status: 500 });
  }

  try {
    // Fetch current token price
    const priceData = await fetchTokenPrice();
    const currentPrice = priceData?.priceUsd || 0;
    const marketCap = priceData?.marketCap || 0;

    // Fetch all token accounts
    const holders: TokenAccount[] = [];
    let cursor: string | undefined;
    const limit = 1000;

    do {
      const params: Record<string, unknown> = {
        mint: FED_TOKEN_MINT,
        limit,
        options: { showZeroBalance: false },
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await fetch(
        `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccounts',
            params,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Helius API error: ${response.status}`);
      }

      const data = await response.json();
      const accounts = data?.result?.token_accounts || [];

      for (const account of accounts) {
        holders.push({
          address: account.address,
          owner: account.owner,
          amount: account.amount,
        });
      }

      cursor = data?.result?.cursor;
      if (accounts.length < limit) break;
    } while (cursor);

    // Sort by balance descending and take top 30
    const sortedHolders = holders
      .map((h) => ({
        ...h,
        balance: parseInt(h.amount, 10) / 1e6, // Convert from raw to decimal (6 decimals)
      }))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 30);

    // Calculate top 10 ownership percentage
    const top10Balance = sortedHolders.slice(0, 10).reduce((sum, h) => sum + h.balance, 0);
    const top10Percentage = (top10Balance / TOTAL_SUPPLY) * 100;

    // Build holder data
    const holderData: HolderData[] = sortedHolders.map((holder) => {
      const percentage = (holder.balance / TOTAL_SUPPLY) * 100;
      const valueUsd = holder.balance * currentPrice;

      return {
        address: holder.owner,
        balance: holder.balance,
        percentage,
        valueUsd,
      };
    });

    return NextResponse.json({
      holders: holderData,
      price: currentPrice,
      marketCap,
      top10Percentage,
      totalHolders: holders.length,
    });
  } catch (error) {
    console.error('Holder data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holder data' },
      { status: 500 }
    );
  }
}
