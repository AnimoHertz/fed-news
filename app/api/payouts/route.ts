import { NextRequest } from 'next/server';
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
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return new Response(JSON.stringify({ error: 'Address is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate Solana address format
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      return new Response(JSON.stringify({ error: 'Invalid Solana address format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const heliusApiKey = process.env.HELIUS_API_KEY || process.env.HELIUS_API;
    if (!heliusApiKey) {
      console.error('HELIUS_API_KEY not found in environment');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  // Create a streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Fetch FED token balance to determine tier
        sendEvent({ type: 'status', message: 'Fetching token balance...' });
        const fedBalance = await fetchTokenBalance(address);
        const tier = getTierFromBalance(fedBalance);
        const tierInfo = getTierInfo(tier);
        const tierMultiplier = TIER_MULTIPLIERS[tier] || 1.0;

        const usd1Transfers: Transfer[] = [];
        let totalReceived = 0;
        let lastSignature: string | undefined;
        let pageCount = 0;
        const maxPages = 100;
        let totalTransactionsScanned = 0;

        sendEvent({ type: 'status', message: 'Scanning distribution history...' });

        // Query the DISTRIBUTION WALLET's transactions to find transfers TO the user
        while (pageCount < maxPages) {
          const url: URL = new URL(`https://api.helius.xyz/v0/addresses/${FED_DISTRIBUTION_WALLET}/transactions`);
          url.searchParams.set('api-key', heliusApiKey);
          if (lastSignature) {
            url.searchParams.set('before', lastSignature);
          }

          let response;
          let retries = 0;
          const maxRetries = 3;

          while (retries < maxRetries) {
            try {
              response = await fetch(url.toString());
              if (response.ok) break;

              if (response.status === 429) {
                // Rate limited - wait and retry
                retries++;
                sendEvent({ type: 'status', message: `Rate limited, waiting... (attempt ${retries}/${maxRetries})` });
                await new Promise(resolve => setTimeout(resolve, 2000 * retries));
                continue;
              }

              throw new Error(`Helius API error: ${response.status}`);
            } catch (fetchError) {
              retries++;
              if (retries >= maxRetries) throw fetchError;
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          if (!response || !response.ok) {
            throw new Error('Failed to fetch after retries');
          }

          const transactions = await response.json();

          if (transactions.length === 0) {
            break;
          }

          totalTransactionsScanned += transactions.length;

          // Process each transaction from the distribution wallet
          for (const tx of transactions) {
            if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
              for (const transfer of tx.tokenTransfers) {
                const isUSD1 = transfer.mint === USD1_MINT;
                const isRecipient = transfer.toUserAccount === address;
                const hasAmount = transfer.tokenAmount > 0;

                if (isUSD1 && isRecipient && hasAmount) {
                  const amount = transfer.tokenAmount;
                  totalReceived += amount;

                  usd1Transfers.push({
                    signature: tx.signature,
                    timestamp: tx.timestamp * 1000,
                    amount,
                    from: FED_DISTRIBUTION_WALLET,
                  });
                }
              }
            }
          }

          // Send progress update
          sendEvent({
            type: 'progress',
            page: pageCount + 1,
            maxPages,
            transactionsScanned: totalTransactionsScanned,
            transfersFound: usd1Transfers.length,
            totalSoFar: totalReceived,
          });

          lastSignature = transactions[transactions.length - 1].signature;
          pageCount++;

          // Send keepalive and small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 150));

          if (transactions.length < 100) {
            break;
          }
        }

        // Sort by timestamp descending (most recent first)
        usd1Transfers.sort((a, b) => b.timestamp - a.timestamp);

        // Send final result
        sendEvent({
          type: 'complete',
          totalReceived,
          transferCount: usd1Transfers.length,
          transfers: usd1Transfers.slice(0, 50),
          fedBalance,
          tier: tier,
          tierName: tierInfo.name,
          tierColor: tierInfo.color,
          tierMultiplier,
          pagesScanned: pageCount,
          totalTransactionsScanned,
        });

        controller.close();
      } catch (error) {
        console.error('Payout lookup error:', error);
        sendEvent({ type: 'error', message: 'Failed to fetch payout data. Please try again.' });
        controller.close();
      }
    },
  });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Payouts API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
