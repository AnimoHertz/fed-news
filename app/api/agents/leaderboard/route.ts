import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  agentCount: number;
  totalSpent: number;
  highestRarity: number;
  averageRarity: number;
  rarityTiers: {
    legendary: number;
    epic: number;
    rare: number;
    uncommon: number;
    common: number;
  };
  latestMint: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  totalAgents: number;
  totalRaised: number;
}

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get('limit');
  const offsetParam = request.nextUrl.searchParams.get('offset');
  const sortParam = request.nextUrl.searchParams.get('sort') || 'agents';

  const limit = Math.min(parseInt(limitParam || '50', 10), 100);
  const offset = parseInt(offsetParam || '0', 10);

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      entries: [],
      total: 0,
      totalAgents: 0,
      totalRaised: 0,
      warning: 'Database not configured',
    });
  }

  try {
    // Get all minted agents
    const { data, error } = await supabase
      .from('minted_agents')
      .select('owner_wallet, payment_amount, rarity_score, rarity_tier, created_at');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Aggregate by owner wallet
    const walletStats = new Map<string, {
      agentCount: number;
      totalSpent: number;
      highestRarity: number;
      totalRarity: number;
      rarityTiers: {
        legendary: number;
        epic: number;
        rare: number;
        uncommon: number;
        common: number;
      };
      latestMint: string;
    }>();

    let totalRaised = 0;

    for (const row of data || []) {
      const wallet = row.owner_wallet;
      const paymentAmount = (row.payment_amount || 0) / 1_000_000;
      const rarityScore = row.rarity_score || 0;
      const rarityTier = (row.rarity_tier || 'common').toLowerCase();
      const createdAt = row.created_at;

      totalRaised += paymentAmount;

      if (!walletStats.has(wallet)) {
        walletStats.set(wallet, {
          agentCount: 0,
          totalSpent: 0,
          highestRarity: 0,
          totalRarity: 0,
          rarityTiers: { legendary: 0, epic: 0, rare: 0, uncommon: 0, common: 0 },
          latestMint: createdAt,
        });
      }

      const stats = walletStats.get(wallet)!;
      stats.agentCount++;
      stats.totalSpent += paymentAmount;
      stats.highestRarity = Math.max(stats.highestRarity, rarityScore);
      stats.totalRarity += rarityScore;

      if (rarityTier in stats.rarityTiers) {
        stats.rarityTiers[rarityTier as keyof typeof stats.rarityTiers]++;
      }

      if (createdAt > stats.latestMint) {
        stats.latestMint = createdAt;
      }
    }

    // Convert to array and sort
    let entries = Array.from(walletStats.entries()).map(([wallet, stats]) => ({
      wallet,
      agentCount: stats.agentCount,
      totalSpent: stats.totalSpent,
      highestRarity: stats.highestRarity,
      averageRarity: Math.round(stats.totalRarity / stats.agentCount),
      rarityTiers: stats.rarityTiers,
      latestMint: stats.latestMint,
    }));

    // Sort based on parameter
    switch (sortParam) {
      case 'spent':
        entries.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case 'rarity':
        entries.sort((a, b) => b.highestRarity - a.highestRarity);
        break;
      case 'recent':
        entries.sort((a, b) => new Date(b.latestMint).getTime() - new Date(a.latestMint).getTime());
        break;
      case 'agents':
      default:
        entries.sort((a, b) => b.agentCount - a.agentCount);
        break;
    }

    const total = entries.length;
    const totalAgents = data?.length || 0;

    // Apply pagination and add ranks
    entries = entries.slice(offset, offset + limit).map((entry, index) => ({
      ...entry,
      rank: offset + index + 1,
    }));

    return NextResponse.json({
      entries,
      total,
      totalAgents,
      totalRaised,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
