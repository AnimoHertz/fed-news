'use client';

import { HolderTier } from '@/types/chat';
import { getTierInfo, formatBalance } from '@/lib/token';

interface TierBadgeProps {
  tier: HolderTier;
  balance: number;
  showBalance?: boolean;
}

export function TierBadge({ tier, balance, showBalance = true }: TierBadgeProps) {
  const info = getTierInfo(tier);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded ${info.bgColor} ${info.borderColor} border`}
    >
      <span className={info.color}>{info.name}</span>
      {showBalance && balance > 0 && (
        <span className="text-gray-500">
          {formatBalance(balance)}
        </span>
      )}
    </span>
  );
}
