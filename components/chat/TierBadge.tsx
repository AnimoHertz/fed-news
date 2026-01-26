'use client';

import { HolderTier } from '@/types/chat';
import { getTierInfo, formatBalance } from '@/lib/token';

interface TierBadgeProps {
  tier: HolderTier;
  balance: number;
  showBalance?: boolean;
}

// Tier-specific icons
function getTierIcon(tier: HolderTier) {
  switch (tier) {
    case 'chairman':
      // Crown icon for Chairman
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
        </svg>
      );
    case 'governor':
      // Star icon for Governor
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case 'director':
      // Shield icon for Director
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
      );
    case 'member':
      // Badge/medal icon for Member
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      );
    case 'citizen':
    default:
      // User icon for Citizen
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      );
  }
}

// Get glow class for premium tiers
function getTierGlow(tier: HolderTier) {
  switch (tier) {
    case 'chairman':
      return 'tier-glow-chairman';
    case 'governor':
      return 'tier-glow-governor';
    default:
      return '';
  }
}

export function TierBadge({ tier, balance, showBalance = true }: TierBadgeProps) {
  const info = getTierInfo(tier);
  const glowClass = getTierGlow(tier);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded transition-all ${info.bgColor} ${info.borderColor} border ${glowClass}`}
    >
      <span className={info.color}>{getTierIcon(tier)}</span>
      <span className={info.color}>{info.name}</span>
      {showBalance && balance > 0 && (
        <span className="text-gray-500">
          {formatBalance(balance)}
        </span>
      )}
    </span>
  );
}
