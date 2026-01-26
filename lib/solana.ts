/**
 * Solana transaction helpers for NFT minting
 *
 * NOTE: Requires @metaplex-foundation/js and @solana/spl-token:
 * npm install @metaplex-foundation/js @solana/spl-token
 */

import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';

// Treasury wallet for $FED payments
export const TREASURY_WALLET = new PublicKey('7VxHbzoPZWj4GYs18NFjyctJYajBwXY639mkuPw1EAA6');

// $FED token mint
export const FED_TOKEN_MINT = new PublicKey('132STreShuLRNgkyF1QECv37yP9Cdp8JBAgnKBgKafed');

// Token decimals for $FED
export const FED_DECIMALS = 6;

// RPC URL
export function getRpcUrl(): string {
  const apiKey = process.env.HELIUS_API_KEY || process.env.HELIUS_API;
  if (apiKey) {
    return `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
  }
  return 'https://api.mainnet-beta.solana.com';
}

/**
 * Creates a Solana connection with the configured RPC
 */
export function getConnection(): Connection {
  return new Connection(getRpcUrl(), 'confirmed');
}

/**
 * Pricing structure for minting based on rarity
 */
export const MINT_PRICING = {
  basePrice: 5_000, // 5K $FED
  multipliers: {
    Common: 1,      // 5K $FED
    Uncommon: 1.5,  // 7.5K $FED
    Rare: 2,        // 10K $FED
    Epic: 3,        // 15K $FED
    Legendary: 5,   // 25K $FED
  },
} as const;

export type RarityTier = keyof typeof MINT_PRICING.multipliers;

/**
 * Calculates the mint price based on rarity tier
 * @param rarityTier - The rarity tier (Common, Uncommon, Rare, Epic, Legendary)
 * @returns Price in $FED (whole tokens, not raw)
 */
export function calculateMintPrice(rarityTier: RarityTier): number {
  const multiplier = MINT_PRICING.multipliers[rarityTier] || 1;
  return MINT_PRICING.basePrice * multiplier;
}

/**
 * Converts $FED amount to raw token units
 */
export function toRawAmount(amount: number): bigint {
  return BigInt(Math.round(amount * Math.pow(10, FED_DECIMALS)));
}

/**
 * Converts raw token units to $FED amount
 */
export function fromRawAmount(rawAmount: bigint): number {
  return Number(rawAmount) / Math.pow(10, FED_DECIMALS);
}

export interface TransferVerification {
  isValid: boolean;
  actualAmount?: number;
  sender?: string;
  recipient?: string;
  error?: string;
}

/**
 * Verifies a $FED token transfer transaction
 * Checks that the payment went to treasury and for the expected amount
 */
export async function verifyPaymentTransaction(
  signature: string,
  expectedFrom: string,
  expectedAmount: number
): Promise<TransferVerification> {
  const connection = getConnection();

  try {
    // Get parsed transaction
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { isValid: false, error: 'Transaction not found' };
    }

    if (tx.meta?.err) {
      return { isValid: false, error: 'Transaction failed on-chain' };
    }

    // Find the SPL token transfer instruction
    const transfer = findTokenTransfer(tx, FED_TOKEN_MINT.toBase58());

    if (!transfer) {
      return { isValid: false, error: 'No $FED token transfer found in transaction' };
    }

    // Verify sender
    if (transfer.source !== expectedFrom) {
      return {
        isValid: false,
        error: `Sender mismatch. Expected ${expectedFrom}, got ${transfer.source}`,
        sender: transfer.source,
      };
    }

    // Verify recipient is treasury
    if (transfer.destination !== TREASURY_WALLET.toBase58()) {
      return {
        isValid: false,
        error: 'Payment not sent to treasury wallet',
        recipient: transfer.destination,
      };
    }

    // Verify amount (allow 0.1% tolerance for rounding)
    const tolerance = expectedAmount * 0.001;
    if (Math.abs(transfer.amount - expectedAmount) > tolerance) {
      return {
        isValid: false,
        error: `Amount mismatch. Expected ${expectedAmount}, got ${transfer.amount}`,
        actualAmount: transfer.amount,
      };
    }

    return {
      isValid: true,
      actualAmount: transfer.amount,
      sender: transfer.source,
      recipient: transfer.destination,
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error verifying transaction',
    };
  }
}

interface TokenTransferInfo {
  source: string;
  destination: string;
  amount: number;
  mint: string;
}

/**
 * Finds SPL token transfer in a parsed transaction
 */
function findTokenTransfer(
  tx: ParsedTransactionWithMeta,
  expectedMint: string
): TokenTransferInfo | null {
  const instructions = tx.transaction.message.instructions;

  for (const ix of instructions) {
    if ('parsed' in ix && ix.program === 'spl-token') {
      const parsed = ix.parsed;

      if (parsed.type === 'transfer' || parsed.type === 'transferChecked') {
        const info = parsed.info;

        // For transferChecked, mint is directly available
        if (parsed.type === 'transferChecked' && info.mint === expectedMint) {
          return {
            source: info.authority || info.source,
            destination: info.destination,
            amount: info.tokenAmount?.uiAmount || 0,
            mint: info.mint,
          };
        }

        // For regular transfer, we need to check pre/post token balances
        if (parsed.type === 'transfer') {
          // Check if this involves our token
          const preBalances = tx.meta?.preTokenBalances || [];
          const postBalances = tx.meta?.postTokenBalances || [];

          const relevantBalance = [...preBalances, ...postBalances].find(
            (b) => b.mint === expectedMint
          );

          if (relevantBalance) {
            // Find amount from balance changes
            const sourcePreBalance = preBalances.find(
              (b) => b.mint === expectedMint && b.owner === info.authority
            );
            const sourcePostBalance = postBalances.find(
              (b) => b.mint === expectedMint && b.owner === info.authority
            );

            const amount =
              (sourcePreBalance?.uiTokenAmount?.uiAmount || 0) -
              (sourcePostBalance?.uiTokenAmount?.uiAmount || 0);

            if (amount > 0) {
              return {
                source: info.authority || info.source,
                destination: info.destination,
                amount,
                mint: expectedMint,
              };
            }
          }
        }
      }
    }
  }

  // Also check inner instructions
  const innerInstructions = tx.meta?.innerInstructions || [];
  for (const inner of innerInstructions) {
    for (const ix of inner.instructions) {
      if ('parsed' in ix && ix.program === 'spl-token') {
        const parsed = ix.parsed;

        if (parsed.type === 'transferChecked' && parsed.info.mint === expectedMint) {
          return {
            source: parsed.info.authority || parsed.info.source,
            destination: parsed.info.destination,
            amount: parsed.info.tokenAmount?.uiAmount || 0,
            mint: parsed.info.mint,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Waits for transaction confirmation
 */
export async function waitForConfirmation(
  signature: string,
  maxAttempts = 30
): Promise<boolean> {
  const connection = getConnection();

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const status = await connection.getSignatureStatus(signature);

      if (status.value?.confirmationStatus === 'confirmed' ||
          status.value?.confirmationStatus === 'finalized') {
        return !status.value.err;
      }

      if (status.value?.err) {
        return false;
      }
    } catch (error) {
      console.error(`Attempt ${i + 1}: Error checking status`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
}

/**
 * Gets the associated token account for a wallet and mint
 */
export async function getTokenAccount(
  walletAddress: string,
  mint: PublicKey = FED_TOKEN_MINT
): Promise<string | null> {
  const connection = getConnection();

  try {
    const response = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(walletAddress),
      { mint }
    );

    if (response.value.length > 0) {
      return response.value[0].pubkey.toBase58();
    }
    return null;
  } catch (error) {
    console.error('Error getting token account:', error);
    return null;
  }
}

/**
 * Checks if wallet has sufficient $FED balance for minting
 */
export async function checkSufficientBalance(
  walletAddress: string,
  requiredAmount: number
): Promise<{ sufficient: boolean; balance: number }> {
  const connection = getConnection();

  try {
    const response = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(walletAddress),
      { mint: FED_TOKEN_MINT }
    );

    let balance = 0;
    for (const account of response.value) {
      balance += account.account.data.parsed.info.tokenAmount.uiAmount || 0;
    }

    return {
      sufficient: balance >= requiredAmount,
      balance,
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    return { sufficient: false, balance: 0 };
  }
}
