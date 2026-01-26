'use client';

import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  Transaction,
  PublicKey,
} from '@solana/web3.js';
import { CharacterProps } from '@/components/characters/ShapeCharacter';
import { generateTraitHash, characterToTraits, AgentTraits } from '@/lib/agent-hash';
import { calculateMintPrice, RarityTier, TREASURY_WALLET, FED_TOKEN_MINT, FED_DECIMALS } from '@/lib/solana';

export type MintStatus =
  | 'idle'
  | 'checking-availability'
  | 'unavailable'
  | 'uploading-image'
  | 'uploading-metadata'
  | 'awaiting-payment'
  | 'confirming-payment'
  | 'minting-nft'
  | 'recording'
  | 'success'
  | 'error';

export interface MintState {
  status: MintStatus;
  error: string | null;
  traitHash: string | null;
  imageUri: string | null;
  metadataUri: string | null;
  paymentTx: string | null;
  mintTx: string | null;
  nftMint: string | null;
  price: number;
}

export interface MintResult {
  success: boolean;
  traitHash?: string;
  imageUri?: string;
  metadataUri?: string;
  paymentTx?: string;
  mintTx?: string;
  nftMint?: string;
  error?: string;
}

interface UseMintAgentOptions {
  onStatusChange?: (status: MintStatus) => void;
  onSuccess?: (result: MintResult) => void;
  onError?: (error: string) => void;
}

export function useMintAgent(options?: UseMintAgentOptions) {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [state, setState] = useState<MintState>({
    status: 'idle',
    error: null,
    traitHash: null,
    imageUri: null,
    metadataUri: null,
    paymentTx: null,
    mintTx: null,
    nftMint: null,
    price: 0,
  });

  const updateStatus = useCallback((status: MintStatus, updates: Partial<MintState> = {}) => {
    setState(prev => ({ ...prev, status, ...updates }));
    options?.onStatusChange?.(status);
  }, [options]);

  /**
   * Check if the agent traits are available for minting
   */
  const checkAvailability = useCallback(async (
    character: CharacterProps & { tier: string }
  ): Promise<{ available: boolean; hash: string; price: number }> => {
    updateStatus('checking-availability');

    try {
      const traits = characterToTraits(character);
      const hash = await generateTraitHash(traits);

      const response = await fetch(`/api/agents/check-availability?hash=${hash}`);
      const data = await response.json();

      if (!data.available) {
        updateStatus('unavailable', { traitHash: hash, error: 'This agent has already been minted' });
        return { available: false, hash, price: 0 };
      }

      // Get pricing
      const priceResponse = await fetch(`/api/agents/mint-price?rarityTier=${data.rarityTier || 'Common'}`);
      const priceData = await priceResponse.json();

      updateStatus('idle', { traitHash: hash, price: priceData.price });
      return { available: true, hash, price: priceData.price };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check availability';
      updateStatus('error', { error: errorMessage });
      return { available: false, hash: '', price: 0 };
    }
  }, [updateStatus]);

  /**
   * Execute the full minting flow
   */
  const mint = useCallback(async (
    character: CharacterProps & { tier: string },
    imageDataUrl: string,
    rarityScore: number,
    rarityTier: string
  ): Promise<MintResult> => {
    if (!publicKey || !signTransaction || !connected) {
      const error = 'Wallet not connected';
      updateStatus('error', { error });
      options?.onError?.(error);
      return { success: false, error };
    }

    try {
      // Step 1: Check availability
      updateStatus('checking-availability');
      const traits = characterToTraits(character);
      const traitHash = await generateTraitHash(traits);

      const availResponse = await fetch(`/api/agents/check-availability?hash=${traitHash}`);
      const availData = await availResponse.json();

      if (!availData.available) {
        const error = 'This agent has already been minted';
        updateStatus('unavailable', { traitHash, error });
        options?.onError?.(error);
        return { success: false, error, traitHash };
      }

      // Calculate price
      const price = calculateMintPrice(rarityTier as RarityTier);
      setState(prev => ({ ...prev, traitHash, price }));

      // Step 2: Upload image to Arweave
      updateStatus('uploading-image', { traitHash });

      const imageResponse = await fetch('/api/agents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'image',
          data: imageDataUrl,
        }),
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const imageData = await imageResponse.json();
      const imageUri = imageData.uri;
      setState(prev => ({ ...prev, imageUri }));

      // Step 3: Upload metadata to Arweave
      updateStatus('uploading-metadata', { imageUri });

      const metadataResponse = await fetch('/api/agents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'metadata',
          traits,
          imageUri,
          rarityScore,
          rarityTier,
          creatorWallet: publicKey.toBase58(),
        }),
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to upload metadata');
      }

      const metadataData = await metadataResponse.json();
      const metadataUri = metadataData.uri;
      setState(prev => ({ ...prev, metadataUri }));

      // Step 4: Create and sign payment transaction
      updateStatus('awaiting-payment', { metadataUri });

      // Build SPL token transfer instruction
      const paymentTx = await createPaymentTransaction(
        connection,
        publicKey,
        price
      );

      // User signs the payment transaction
      const signedPaymentTx = await signTransaction(paymentTx);
      const paymentSignature = await connection.sendRawTransaction(signedPaymentTx.serialize());

      setState(prev => ({ ...prev, paymentTx: paymentSignature }));

      // Step 5: Wait for payment confirmation
      updateStatus('confirming-payment', { paymentTx: paymentSignature });

      const paymentConfirmation = await connection.confirmTransaction(paymentSignature, 'confirmed');

      if (paymentConfirmation.value.err) {
        throw new Error('Payment transaction failed');
      }

      // Step 6: Mint NFT (simplified - actual Metaplex minting would be more complex)
      updateStatus('minting-nft');

      // For now, we'll use a placeholder for the NFT mint
      // In production, this would use Metaplex SDK
      const nftMint = `NFT_${traitHash.slice(0, 16)}`;
      const mintTx = paymentSignature; // Placeholder

      setState(prev => ({ ...prev, nftMint, mintTx }));

      // Step 7: Record mint in database
      updateStatus('recording', { nftMint, mintTx });

      const recordResponse = await fetch('/api/agents/record-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traitHash,
          traits,
          nftMintAddress: nftMint,
          metadataUri,
          imageUri,
          ownerWallet: publicKey.toBase58(),
          minterWallet: publicKey.toBase58(),
          mintTransaction: mintTx,
          paymentTransaction: paymentSignature,
          paymentAmount: price,
          rarityScore,
          rarityTier,
        }),
      });

      if (!recordResponse.ok) {
        console.error('Failed to record mint, but NFT was created');
      }

      // Success!
      const result: MintResult = {
        success: true,
        traitHash,
        imageUri,
        metadataUri,
        paymentTx: paymentSignature,
        mintTx,
        nftMint,
      };

      updateStatus('success', {
        traitHash,
        imageUri,
        metadataUri,
        paymentTx: paymentSignature,
        mintTx,
        nftMint,
        error: null,
      });

      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Minting failed';
      updateStatus('error', { error: errorMessage });
      options?.onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [publicKey, signTransaction, connected, connection, updateStatus, options]);

  /**
   * Reset the mint state
   */
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      error: null,
      traitHash: null,
      imageUri: null,
      metadataUri: null,
      paymentTx: null,
      mintTx: null,
      nftMint: null,
      price: 0,
    });
  }, []);

  return {
    state,
    checkAvailability,
    mint,
    reset,
    isConnected: connected,
    walletAddress: publicKey?.toBase58() || null,
  };
}

/**
 * Creates a payment transaction for SPL token transfer to treasury
 */
async function createPaymentTransaction(
  connection: ReturnType<typeof useConnection>['connection'],
  payer: PublicKey,
  amount: number
): Promise<Transaction> {
  // Dynamic import to avoid SSR issues
  const { getAssociatedTokenAddress, createTransferInstruction } = await import('@solana/spl-token');

  const payerTokenAccount = await getAssociatedTokenAddress(FED_TOKEN_MINT, payer);
  const treasuryTokenAccount = await getAssociatedTokenAddress(FED_TOKEN_MINT, TREASURY_WALLET);

  // Convert amount to raw units
  const rawAmount = BigInt(Math.round(amount * Math.pow(10, FED_DECIMALS)));

  const transferInstruction = createTransferInstruction(
    payerTokenAccount,
    treasuryTokenAccount,
    payer,
    rawAmount
  );

  const transaction = new Transaction().add(transferInstruction);

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = payer;

  return transaction;
}

/**
 * Status display helpers
 */
export const STATUS_MESSAGES: Record<MintStatus, string> = {
  'idle': 'Ready to mint',
  'checking-availability': 'Checking availability...',
  'unavailable': 'Already minted',
  'uploading-image': 'Uploading image to Arweave...',
  'uploading-metadata': 'Uploading metadata...',
  'awaiting-payment': 'Waiting for payment signature...',
  'confirming-payment': 'Confirming payment...',
  'minting-nft': 'Minting NFT...',
  'recording': 'Recording mint...',
  'success': 'Mint successful!',
  'error': 'Minting failed',
};

export const STATUS_PROGRESS: Record<MintStatus, number> = {
  'idle': 0,
  'checking-availability': 10,
  'unavailable': 0,
  'uploading-image': 25,
  'uploading-metadata': 40,
  'awaiting-payment': 55,
  'confirming-payment': 70,
  'minting-nft': 85,
  'recording': 95,
  'success': 100,
  'error': 0,
};
