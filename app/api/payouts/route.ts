import { NextRequest, NextResponse } from 'next/server';

// USD1 token mint address on Solana
const USD1_MINT = 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB';

interface Transfer {
  signature: string;
  timestamp: number;
  amount: number;
  from: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  // Validate Solana address format
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid Solana address format' }, { status: 400 });
  }

  const heliusApiKey = process.env.HELIUS_API;
  if (!heliusApiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Use Helius API to fetch transaction history (remove type filter to get all)
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${heliusApiKey}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Helius API error:', response.status, errorText);
      throw new Error(`Helius API error: ${response.status}`);
    }

    const transactions = await response.json();
    console.log(`Found ${transactions.length} transactions for ${address}`);

    // Filter for USD1 transfers where user is the recipient
    const usd1Transfers: Transfer[] = [];
    let totalReceived = 0;
    const allMints = new Set<string>();

    for (const tx of transactions) {
      if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
        for (const transfer of tx.tokenTransfers) {
          allMints.add(transfer.mint);

          if (
            transfer.mint === USD1_MINT &&
            transfer.toUserAccount === address
          ) {
            const amount = transfer.tokenAmount || 0;
            totalReceived += amount;
            usd1Transfers.push({
              signature: tx.signature,
              timestamp: tx.timestamp * 1000,
              amount,
              from: transfer.fromUserAccount || 'Unknown',
            });
          }
        }
      }
    }

    console.log('All token mints found:', Array.from(allMints));
    console.log('Looking for USD1:', USD1_MINT);
    console.log('USD1 transfers found:', usd1Transfers.length);

    // Sort by timestamp descending
    usd1Transfers.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      totalReceived,
      transferCount: usd1Transfers.length,
      transfers: usd1Transfers.slice(0, 20),
    });
  } catch (error) {
    console.error('Payout lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout data. Please try again.' },
      { status: 500 }
    );
  }
}
