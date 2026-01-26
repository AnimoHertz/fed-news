'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { CharacterProps } from './ShapeCharacter';
import { useMintAgent, STATUS_MESSAGES, STATUS_PROGRESS } from '@/hooks/useMintAgent';
import { formatBalance } from '@/lib/token';
import { generateTraitHash, characterToTraits } from '@/lib/agent-hash';

// Confetti particle component
function MintSuccessAnimation() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    rotation: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const colors = ['#10b981', '#fbbf24', '#a855f7', '#3b82f6', '#ec4899', '#f97316'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: '-10%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent animate-pulse" />
    </div>
  );
}

interface MintButtonProps {
  character: CharacterProps & { tier: string };
  rarityScore: number;
  rarityTier: string;
  getImageDataUrl: () => Promise<string>;
  onMintSuccess?: (result: { traitHash: string; nftMint: string }) => void;
}

export function MintButton({
  character,
  rarityScore,
  rarityTier,
  getImageDataUrl,
  onMintSuccess,
}: MintButtonProps) {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Create a stable key from character traits
  const characterKey = useMemo(() => {
    return JSON.stringify({
      h: character.headStyle,
      e: character.eyeStyle,
      m: character.mouthStyle,
      b: character.bodyStyle,
      f: character.feetStyle,
      a: character.accessory,
      bg: character.bgStyle,
      p: character.primaryColor,
      s: character.secondaryColor,
      ac: character.accentColor,
      t: character.tier,
    });
  }, [
    character.headStyle,
    character.eyeStyle,
    character.mouthStyle,
    character.bodyStyle,
    character.feetStyle,
    character.accessory,
    character.bgStyle,
    character.primaryColor,
    character.secondaryColor,
    character.accentColor,
    character.tier,
  ]);

  const handleMintSuccess = useCallback((result: { success: boolean; traitHash?: string; nftMint?: string }) => {
    if (result.traitHash && result.nftMint) {
      onMintSuccess?.({ traitHash: result.traitHash, nftMint: result.nftMint });
    }
  }, [onMintSuccess]);

  const {
    state,
    mint,
    reset,
  } = useMintAgent({
    onSuccess: handleMintSuccess,
  });

  // Check availability when character changes
  useEffect(() => {
    let mounted = true;

    async function check() {
      setIsAvailable(null);
      setCheckError(null);
      try {
        const traits = characterToTraits(character);
        const hash = await generateTraitHash(traits);

        const response = await fetch(`/api/agents/check-availability?hash=${hash}`);
        const data = await response.json();

        if (!mounted) return;

        if (!data.available) {
          setIsAvailable(false);
          setCheckError('This agent has already been minted');
          return;
        }

        // Get pricing
        const priceResponse = await fetch(`/api/agents/mint-price?rarityTier=${rarityTier}`);
        const priceData = await priceResponse.json();

        if (mounted) {
          setIsAvailable(true);
          setPrice(priceData.price);
        }
      } catch (error) {
        if (mounted) {
          setCheckError(error instanceof Error ? error.message : 'Failed to check');
          setIsAvailable(false);
        }
      }
    }

    check();
    return () => { mounted = false; };
  }, [characterKey, rarityTier]); // Use stable characterKey instead of character object

  const handleMint = async () => {
    if (!connected) {
      setVisible(true);
      return;
    }

    try {
      const imageDataUrl = await getImageDataUrl();
      await mint(character, imageDataUrl, rarityScore, rarityTier);
    } catch (error) {
      console.error('Mint error:', error);
    }
  };

  const isProcessing = ![
    'idle',
    'success',
    'error',
    'unavailable',
  ].includes(state.status);

  const progress = STATUS_PROGRESS[state.status];

  // Render different states
  if (state.status === 'success') {
    return (
      <div className="relative space-y-4">
        <MintSuccessAnimation />

        {/* Success card */}
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 animate-scale-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce-slow">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-emerald-400 text-lg">Minted!</h4>
              <p className="text-sm text-gray-400">Your agent is now on-chain</p>
            </div>
          </div>

          {state.paymentTx && (
            <a
              href={`https://solscan.io/tx/${state.paymentTx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on Solscan
            </a>
          )}
        </div>

        <button
          onClick={reset}
          className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Mint Another Agent
        </button>
      </div>
    );
  }

  if (state.status === 'unavailable' || isAvailable === false) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700">
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="text-gray-300">
          {checkError || 'This agent has already been minted'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Price display */}
      {isAvailable && price > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Mint Price:</span>
          <span className={`font-medium ${getRarityPriceColor(rarityTier)}`}>
            {formatBalance(price)} $FED
          </span>
        </div>
      )}

      {/* Progress bar during minting */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400">{STATUS_MESSAGES[state.status]}</p>
        </div>
      )}

      {/* Error display */}
      {state.status === 'error' && state.error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-400">{state.error}</p>
            <button
              onClick={reset}
              className="mt-2 text-xs text-gray-400 hover:text-gray-300"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Main mint button */}
      <button
        onClick={handleMint}
        disabled={isProcessing || isAvailable === null || !isAvailable}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium
          transition-all hover:scale-[1.02] active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${connected
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white'
            : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200'
          }
        `}
      >
        {isProcessing ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {STATUS_MESSAGES[state.status]}
          </>
        ) : isAvailable === null ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Checking...
          </>
        ) : connected ? (
          <>
            <MintIcon />
            Mint as NFT
          </>
        ) : (
          <>
            <WalletIcon />
            Connect to Mint
          </>
        )}
      </button>

      {/* Availability badge */}
      {isAvailable && !isProcessing && state.status !== 'error' && (
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Available for minting
        </div>
      )}
    </div>
  );
}

function MintIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}

function getRarityPriceColor(rarityTier: string): string {
  switch (rarityTier) {
    case 'Legendary':
      return 'text-yellow-400';
    case 'Epic':
      return 'text-purple-400';
    case 'Rare':
      return 'text-blue-400';
    case 'Uncommon':
      return 'text-emerald-400';
    default:
      return 'text-gray-300';
  }
}

/**
 * Compact availability badge for inline display
 */
export function AvailabilityBadge({
  available,
  checking,
}: {
  available: boolean | null;
  checking?: boolean;
}) {
  if (checking || available === null) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400">
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Checking
      </span>
    );
  }

  if (available) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Available
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-500 border border-gray-700">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
      Minted
    </span>
  );
}
