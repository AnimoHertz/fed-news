import { NextRequest, NextResponse } from 'next/server';
import { calculateMintPrice, MINT_PRICING, RarityTier } from '@/lib/solana';

export async function GET(request: NextRequest) {
  const rarityTier = request.nextUrl.searchParams.get('rarityTier') as RarityTier | null;

  // Return base pricing info if no tier specified
  if (!rarityTier) {
    return NextResponse.json({
      basePrice: MINT_PRICING.basePrice,
      multipliers: MINT_PRICING.multipliers,
      prices: {
        Common: calculateMintPrice('Common'),
        Uncommon: calculateMintPrice('Uncommon'),
        Rare: calculateMintPrice('Rare'),
        Epic: calculateMintPrice('Epic'),
        Legendary: calculateMintPrice('Legendary'),
      },
    });
  }

  // Validate tier
  const validTiers: RarityTier[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  if (!validTiers.includes(rarityTier)) {
    return NextResponse.json(
      { error: 'Invalid rarity tier' },
      { status: 400 }
    );
  }

  const price = calculateMintPrice(rarityTier);
  const multiplier = MINT_PRICING.multipliers[rarityTier];

  return NextResponse.json({
    rarityTier,
    price,
    multiplier,
    basePrice: MINT_PRICING.basePrice,
  });
}
