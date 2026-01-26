import { NextRequest, NextResponse } from 'next/server';
import { fetchTokenBalance, getTierFromBalance, getTierInfo } from '@/lib/token';

// USD1 token mint address on Solana
const USD1_MINT = 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB';

// FED distribution wallet - only transfers from this address count as rewards
const FED_DISTRIBUTION_WALLET = '4Br5iKfRkYMk8WMj6w8YASynuq7Eoas16rkyvWsAdL4P';

// Tier multipliers matching roles page
const TIER_MULTIPLIERS: Record<string, number> = {
  chairman: 1.5,
  governor: 1.25,
  director: 1.1,
  member: 1.05,
  citizen: 1.0,
  none: 0,
};

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

  const heliusApiKey = process.env.HELIUS_API_KEY || process.env.HELIUS_API;
  if (!heliusApiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Fetch FED token balance to determine tier
    const fedBalance = await fetchTokenBalance(address);
    const tier = getTierFromBalance(fedBalance);
    const tierInfo = getTierInfo(tier);
    const tierMultiplier = TIER_MULTIPLIERS[tier] || 1.0;
    const usd1Transfers: Transfer[] = [];
    let totalReceived = 0;
    let lastSignature: string | undefined;
    let pageCount = 0;
    const maxPages = 20;


    // Use Helius to get detailed transaction data with individual transfer amounts
    while (pageCount < maxPages) {
      const url: URL = new URL(`https://api.helius.xyz/v0/addresses/${address}/transactions`);
      url.searchParams.set('api-key', heliusApiKey);
      if (lastSignature) {
        url.searchParams.set('before', lastSignature);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Helius API error:', response.status, errorText);
        throw new Error(`Helius API error: ${response.status}`);
      }

      const transactions = await response.json();

      if (transactions.length === 0) {
        break;
      }

      // Process each transaction
      for (const tx of transactions) {
        // Check tokenTransfers for the specific amount sent TO this address
        if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
          for (const transfer of tx.tokenTransfers) {
            // Filter: USD1 token, from distribution wallet, to this address, non-zero
            const isUSD1 = transfer.mint === USD1_MINT;
            const isFromDistribution = transfer.fromUserAccount === FED_DISTRIBUTION_WALLET;
            const isRecipient = transfer.toUserAccount === address;
            const hasAmount = transfer.tokenAmount > 0;

            if (isUSD1 && isFromDistribution && isRecipient && hasAmount) {
              const amount = transfer.tokenAmount;
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

      lastSignature = transactions[transactions.length - 1].signature;
      pageCount++;

      if (transactions.length < 100) {
        break;
      }
    }

    // Sort by timestamp descending (most recent first)
    usd1Transfers.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      totalReceived,
      transferCount: usd1Transfers.length,
      transfers: usd1Transfers.slice(0, 50),
      // Tier info
      fedBalance,
      tier: tier,
      tierName: tierInfo.name,
      tierColor: tierInfo.color,
      tierMultiplier,
    });
  } catch (error) {
    console.error('Payout lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout data. Please try again.' },
      { status: 500 }
    );
  }
}
