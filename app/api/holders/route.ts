import { NextResponse } from 'next/server';
import { fetchTokenPrice } from '@/lib/price';

const FED_TOKEN_MINT = '132STreShuLRNgkyF1QECv37yP9Cdp8JBAgnKBgKafed';
const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens

interface TokenAccount {
  address: string;
  owner: string;
  amount: string;
}

interface Transaction {
  signature: string;
  timestamp: number;
  type: 'buy' | 'sell';
  amount: number;
  price?: number;
}

interface HolderData {
  address: string;
  balance: number;
  percentage: number;
  valueUsd: number;
  pnl: number;
  pnlMultiple: number;
  status: 'Buying' | 'Holding' | 'Flipping';
  statusDuration: string;
  transactions: Transaction[];
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function determineStatus(
  transactions: Transaction[]
): { status: 'Buying' | 'Holding' | 'Flipping'; since: number } {
  if (transactions.length === 0) {
    return { status: 'Holding', since: Date.now() - 1000 * 60 * 60 * 24 };
  }

  const recentTxs = transactions.slice(0, 10);
  const buys = recentTxs.filter((t) => t.type === 'buy');
  const sells = recentTxs.filter((t) => t.type === 'sell');

  // Check for flipping (both buy and sell in recent transactions)
  if (buys.length > 0 && sells.length > 0) {
    const lastActivity = Math.max(...recentTxs.map((t) => t.timestamp));
    return { status: 'Flipping', since: lastActivity };
  }

  // Check if mostly buying
  if (buys.length > sells.length) {
    const lastBuy = Math.max(...buys.map((t) => t.timestamp));
    return { status: 'Buying', since: lastBuy };
  }

  // Default to holding
  const lastActivity = transactions[0]?.timestamp || Date.now();
  return { status: 'Holding', since: lastActivity };
}

function calculatePnL(
  transactions: Transaction[],
  currentBalance: number,
  currentPrice: number
): { pnl: number; multiple: number } {
  if (transactions.length === 0 || currentBalance === 0) {
    return { pnl: 0, multiple: 1 };
  }

  // Calculate weighted average buy price
  let totalBought = 0;
  let totalCost = 0;

  for (const tx of transactions) {
    if (tx.type === 'buy' && tx.price && tx.price > 0) {
      totalBought += tx.amount;
      totalCost += tx.amount * tx.price;
    }
  }

  if (totalBought === 0 || totalCost === 0) {
    return { pnl: 0, multiple: 1 };
  }

  const avgBuyPrice = totalCost / totalBought;
  const currentValue = currentBalance * currentPrice;
  const costBasis = currentBalance * avgBuyPrice;
  const pnl = currentValue - costBasis;
  const multiple = avgBuyPrice > 0 ? currentPrice / avgBuyPrice : 1;

  return { pnl, multiple };
}

export async function GET() {
  const heliusApiKey = process.env.HELIUS_API_KEY || process.env.HELIUS_API;

  if (!heliusApiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
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

    // Fetch transaction history for each top holder
    const holderData: HolderData[] = await Promise.all(
      sortedHolders.map(async (holder) => {
        const transactions: Transaction[] = [];

        try {
          // Fetch transactions for this holder
          const txResponse = await fetch(
            `https://api.helius.xyz/v0/addresses/${holder.owner}/transactions?api-key=${heliusApiKey}&limit=50`
          );

          if (txResponse.ok) {
            const txData = await txResponse.json();

            for (const tx of txData) {
              // Look for token transfers involving FED
              if (tx.tokenTransfers) {
                for (const transfer of tx.tokenTransfers) {
                  if (transfer.mint === FED_TOKEN_MINT) {
                    const isBuy = transfer.toUserAccount === holder.owner;
                    const amount = transfer.tokenAmount || 0;

                    // Try to estimate price from native transfers
                    let price: number | undefined;
                    if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
                      const solTransfer = tx.nativeTransfers.find(
                        (nt: { fromUserAccount: string; toUserAccount: string; amount: number }) =>
                          (isBuy && nt.fromUserAccount === holder.owner) ||
                          (!isBuy && nt.toUserAccount === holder.owner)
                      );
                      if (solTransfer && amount > 0) {
                        // Estimate SOL price (rough approximation)
                        const solAmount = solTransfer.amount / 1e9;
                        const solPrice = 150; // Approximate SOL price
                        price = (solAmount * solPrice) / amount;
                      }
                    }

                    transactions.push({
                      signature: tx.signature,
                      timestamp: tx.timestamp * 1000,
                      type: isBuy ? 'buy' : 'sell',
                      amount,
                      price,
                    });
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch transactions for ${holder.owner}:`, error);
        }

        // Sort transactions by timestamp descending
        transactions.sort((a, b) => b.timestamp - a.timestamp);

        const percentage = (holder.balance / TOTAL_SUPPLY) * 100;
        const valueUsd = holder.balance * currentPrice;
        const { status, since } = determineStatus(transactions);
        const statusDuration = formatDuration(Date.now() - since);
        const { pnl, multiple } = calculatePnL(transactions, holder.balance, currentPrice);

        return {
          address: holder.owner,
          balance: holder.balance,
          percentage,
          valueUsd,
          pnl,
          pnlMultiple: multiple,
          status,
          statusDuration,
          transactions,
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
