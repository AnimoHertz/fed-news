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
  pnl: number;
  pnlMultiple: number;
}

interface Transaction {
  type: 'buy' | 'sell';
  amount: number;
  solAmount: number;
}

async function fetchSolPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112'
    );
    if (!response.ok) return 200;
    const data = await response.json();
    return parseFloat(data.pairs?.[0]?.priceUsd) || 200;
  } catch {
    return 200;
  }
}

async function fetchWalletTransactions(
  walletAddress: string,
  heliusApiKey: string,
  solPrice: number
): Promise<{ pnl: number; multiple: number; costBasis: number }> {
  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${heliusApiKey}&limit=100`
    );

    if (!response.ok) {
      return { pnl: 0, multiple: 1, costBasis: 0 };
    }

    const txData = await response.json();
    const transactions: Transaction[] = [];

    for (const tx of txData) {
      if (tx.tokenTransfers) {
        for (const transfer of tx.tokenTransfers) {
          if (transfer.mint === FED_TOKEN_MINT) {
            const isBuy = transfer.toUserAccount === walletAddress;
            const amount = transfer.tokenAmount || 0;

            // Find corresponding SOL transfer
            let solAmount = 0;
            if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
              const solTransfer = tx.nativeTransfers.find(
                (nt: { fromUserAccount: string; toUserAccount: string; amount: number }) =>
                  (isBuy && nt.fromUserAccount === walletAddress) ||
                  (!isBuy && nt.toUserAccount === walletAddress)
              );
              if (solTransfer) {
                solAmount = solTransfer.amount / 1e9;
              }
            }

            if (amount > 0 && solAmount > 0) {
              transactions.push({
                type: isBuy ? 'buy' : 'sell',
                amount,
                solAmount,
              });
            }
          }
        }
      }
    }

    // Calculate cost basis from buys
    let totalBought = 0;
    let totalSolSpent = 0;

    for (const tx of transactions) {
      if (tx.type === 'buy') {
        totalBought += tx.amount;
        totalSolSpent += tx.solAmount;
      }
    }

    if (totalBought === 0 || totalSolSpent === 0) {
      return { pnl: 0, multiple: 1, costBasis: 0 };
    }

    const costBasis = totalSolSpent * solPrice;

    return { pnl: 0, multiple: 1, costBasis };
  } catch (error) {
    console.error(`Failed to fetch transactions for ${walletAddress}:`, error);
    return { pnl: 0, multiple: 1, costBasis: 0 };
  }
}

export async function GET() {
  const heliusApiKey = process.env.HELIUS_API_KEY || process.env.HELIUS_API;

  if (!heliusApiKey) {
    return NextResponse.json({ error: 'Helius API key not configured' }, { status: 500 });
  }

  try {
    // Fetch current token price and SOL price in parallel
    const [priceData, solPrice] = await Promise.all([
      fetchTokenPrice(),
      fetchSolPrice(),
    ]);
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

    // Fetch transaction data and calculate PnL for each holder
    const holderData: HolderData[] = await Promise.all(
      sortedHolders.map(async (holder) => {
        const percentage = (holder.balance / TOTAL_SUPPLY) * 100;
        const valueUsd = holder.balance * currentPrice;
        const { costBasis } = await fetchWalletTransactions(holder.owner, heliusApiKey, solPrice);

        // Calculate PnL: current value - cost basis
        const pnl = costBasis > 0 ? valueUsd - costBasis : 0;
        const multiple = costBasis > 0 ? valueUsd / costBasis : 1;

        return {
          address: holder.owner,
          balance: holder.balance,
          percentage,
          valueUsd,
          pnl,
          pnlMultiple: multiple,
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
