import { NextResponse } from 'next/server';
import { fetchTokenPrice } from '@/lib/price';

const FED_TOKEN_MINT = '132STreShuLRNgkyF1QECv37yP9Cdp8JBAgnKBgKafed';
const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens

// USD1 token mint address on Solana
const USD1_MINT = 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB';

// FED distribution wallet - only transfers from this address count as rewards
const FED_DISTRIBUTION_WALLET = '4Br5iKfRkYMk8WMj6w8YASynuq7Eoas16rkyvWsAdL4P';

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
  usd1Earned: number;
}

async function fetchUsd1Earnings(
  walletAddress: string,
  heliusApiKey: string
): Promise<number> {
  try {
    let totalReceived = 0;
    let lastSignature: string | undefined;
    const maxPages = 5; // Limit pages to keep it fast

    for (let page = 0; page < maxPages; page++) {
      const url = new URL(`https://api.helius.xyz/v0/addresses/${walletAddress}/transactions`);
      url.searchParams.set('api-key', heliusApiKey);
      if (lastSignature) {
        url.searchParams.set('before', lastSignature);
      }

      const response = await fetch(url.toString());
      if (!response.ok) break;

      const transactions = await response.json();
      if (transactions.length === 0) break;

      for (const tx of transactions) {
        if (tx.tokenTransfers) {
          for (const transfer of tx.tokenTransfers) {
            const isUSD1 = transfer.mint === USD1_MINT;
            const isRecipient = transfer.toUserAccount === walletAddress;
            const isFromDistributionWallet = transfer.fromUserAccount === FED_DISTRIBUTION_WALLET;
            const hasAmount = transfer.tokenAmount > 0;

            if (isUSD1 && isRecipient && isFromDistributionWallet && hasAmount) {
              totalReceived += transfer.tokenAmount;
            }
          }
        }
      }

      lastSignature = transactions[transactions.length - 1].signature;
      if (transactions.length < 100) break;
    }

    return totalReceived;
  } catch (error) {
    console.error(`Failed to fetch USD1 earnings for ${walletAddress}:`, error);
    return 0;
  }
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

    // Build holder data with USD1 earnings
    const holderData: HolderData[] = await Promise.all(
      sortedHolders.map(async (holder) => {
        const percentage = (holder.balance / TOTAL_SUPPLY) * 100;
        const valueUsd = holder.balance * currentPrice;
        const usd1Earned = await fetchUsd1Earnings(holder.owner, heliusApiKey);

        return {
          address: holder.owner,
          balance: holder.balance,
          percentage,
          valueUsd,
          usd1Earned,
        };
      })
    );

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
