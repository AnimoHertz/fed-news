import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'minting' | 'collection' | 'forum' | 'holder' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
}

interface AchievementsResponse {
  achievements: Achievement[];
  stats: {
    total: number;
    unlocked: number;
    points: number;
  };
}

const TIER_POINTS = {
  bronze: 10,
  silver: 25,
  gold: 50,
  diamond: 100,
};

export async function GET(request: NextRequest) {
  const walletParam = request.nextUrl.searchParams.get('wallet');

  if (!walletParam) {
    return NextResponse.json(
      { error: 'Wallet address required' },
      { status: 400 }
    );
  }

  const wallet = walletParam.toLowerCase();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      achievements: getAchievementDefinitions({}),
      stats: { total: 0, unlocked: 0, points: 0 },
      warning: 'Database not configured',
    });
  }

  try {
    // Fetch all data needed for achievements in parallel
    const [agentsResult, messagesResult, upvotesResult, profileResult] = await Promise.all([
      // Get minted agents data
      supabase
        .from('minted_agents')
        .select('id, rarity_score, rarity_tier, payment_amount, created_at, minter_wallet')
        .or(`owner_wallet.eq.${wallet},minter_wallet.eq.${wallet}`),

      // Get forum messages
      supabase
        .from('chat_messages')
        .select('id, created_at')
        .eq('wallet_address', wallet),

      // Get upvotes received (messages by this user that have been upvoted)
      supabase
        .from('chat_messages')
        .select('id')
        .eq('wallet_address', wallet)
        .then(async ({ data: userMessages }) => {
          if (!userMessages?.length) return { count: 0 };
          const messageIds = userMessages.map(m => m.id);
          const { count } = await supabase
            .from('message_upvotes')
            .select('*', { count: 'exact', head: true })
            .in('message_id', messageIds);
          return { count: count || 0 };
        }),

      // Check if user has set profile
      supabase
        .from('chat_users')
        .select('username')
        .eq('wallet_address', wallet)
        .single(),
    ]);

    // Process agent data
    const agents = agentsResult.data || [];
    const ownedAgents = agents.filter(a => true); // All agents returned are owned or minted by user
    const mintedAgents = agents.filter(a => a.minter_wallet?.toLowerCase() === wallet);

    const agentStats = {
      totalOwned: ownedAgents.length,
      totalMinted: mintedAgents.length,
      legendaryCount: agents.filter(a => a.rarity_tier === 'legendary').length,
      epicCount: agents.filter(a => a.rarity_tier === 'epic').length,
      rareCount: agents.filter(a => a.rarity_tier === 'rare').length,
      uncommonCount: agents.filter(a => a.rarity_tier === 'uncommon').length,
      commonCount: agents.filter(a => a.rarity_tier === 'common').length,
      highestRarity: Math.max(...agents.map(a => a.rarity_score || 0), 0),
      totalSpent: agents.reduce((sum, a) => sum + ((a.payment_amount || 0) / 1_000_000), 0),
      firstMintDate: mintedAgents.length > 0
        ? mintedAgents.reduce((earliest, a) =>
            a.created_at < earliest ? a.created_at : earliest,
            mintedAgents[0].created_at
          )
        : null,
    };

    // Process forum data
    const messages = messagesResult.data || [];
    const forumStats = {
      postCount: messages.length,
      upvotesReceived: upvotesResult.count || 0,
      firstPostDate: messages.length > 0
        ? messages.reduce((earliest, m) =>
            m.created_at < earliest ? m.created_at : earliest,
            messages[0].created_at
          )
        : null,
    };

    // Profile completion
    const hasUsername = !!profileResult.data?.username;

    // Calculate unique rarity tiers
    const uniqueTiers = new Set(agents.map(a => a.rarity_tier).filter(Boolean));

    // Build achievement data
    const achievementData = {
      agentStats,
      forumStats,
      hasUsername,
      uniqueTiers: uniqueTiers.size,
    };

    const achievements = getAchievementDefinitions(achievementData);

    // Calculate stats
    const unlocked = achievements.filter(a => a.unlocked);
    const points = unlocked.reduce((sum, a) => sum + TIER_POINTS[a.tier], 0);

    return NextResponse.json({
      achievements,
      stats: {
        total: achievements.length,
        unlocked: unlocked.length,
        points,
      },
    });
  } catch (error) {
    console.error('Achievements error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

function getAchievementDefinitions(data: {
  agentStats?: {
    totalOwned: number;
    totalMinted: number;
    legendaryCount: number;
    epicCount: number;
    rareCount: number;
    uncommonCount: number;
    commonCount: number;
    highestRarity: number;
    totalSpent: number;
    firstMintDate: string | null;
  };
  forumStats?: {
    postCount: number;
    upvotesReceived: number;
    firstPostDate: string | null;
  };
  hasUsername?: boolean;
  uniqueTiers?: number;
}): Achievement[] {
  const { agentStats, forumStats, hasUsername, uniqueTiers } = data;

  const achievements: Achievement[] = [
    // MINTING ACHIEVEMENTS
    {
      id: 'first_mint',
      name: 'Genesis Agent',
      description: 'Mint your first Federal Agent',
      icon: 'sparkles',
      category: 'minting',
      tier: 'bronze',
      unlocked: (agentStats?.totalMinted || 0) >= 1,
      progress: Math.min(agentStats?.totalMinted || 0, 1),
      maxProgress: 1,
    },
    {
      id: 'collector_5',
      name: 'Agent Recruiter',
      description: 'Own 5 Federal Agents',
      icon: 'users',
      category: 'minting',
      tier: 'silver',
      unlocked: (agentStats?.totalOwned || 0) >= 5,
      progress: Math.min(agentStats?.totalOwned || 0, 5),
      maxProgress: 5,
    },
    {
      id: 'collector_10',
      name: 'Squad Leader',
      description: 'Own 10 Federal Agents',
      icon: 'shield',
      category: 'minting',
      tier: 'gold',
      unlocked: (agentStats?.totalOwned || 0) >= 10,
      progress: Math.min(agentStats?.totalOwned || 0, 10),
      maxProgress: 10,
    },
    {
      id: 'collector_25',
      name: 'Agency Director',
      description: 'Own 25 Federal Agents',
      icon: 'building',
      category: 'minting',
      tier: 'diamond',
      unlocked: (agentStats?.totalOwned || 0) >= 25,
      progress: Math.min(agentStats?.totalOwned || 0, 25),
      maxProgress: 25,
    },

    // COLLECTION/RARITY ACHIEVEMENTS
    {
      id: 'rare_finder',
      name: 'Rare Find',
      description: 'Own a Rare or higher tier agent',
      icon: 'gem',
      category: 'collection',
      tier: 'bronze',
      unlocked: (agentStats?.highestRarity || 0) >= 400,
    },
    {
      id: 'epic_hunter',
      name: 'Epic Hunter',
      description: 'Own an Epic tier agent',
      icon: 'flame',
      category: 'collection',
      tier: 'silver',
      unlocked: (agentStats?.epicCount || 0) >= 1,
    },
    {
      id: 'legendary_find',
      name: 'Legendary Status',
      description: 'Own a Legendary tier agent',
      icon: 'crown',
      category: 'collection',
      tier: 'gold',
      unlocked: (agentStats?.legendaryCount || 0) >= 1,
    },
    {
      id: 'diversity',
      name: 'Diverse Portfolio',
      description: 'Own agents from 4 different rarity tiers',
      icon: 'palette',
      category: 'collection',
      tier: 'silver',
      unlocked: (uniqueTiers || 0) >= 4,
      progress: uniqueTiers || 0,
      maxProgress: 4,
    },
    {
      id: 'full_set',
      name: 'Complete Collection',
      description: 'Own agents from all 5 rarity tiers',
      icon: 'trophy',
      category: 'collection',
      tier: 'diamond',
      unlocked: (uniqueTiers || 0) >= 5,
      progress: uniqueTiers || 0,
      maxProgress: 5,
    },

    // SPENDING ACHIEVEMENTS
    {
      id: 'supporter',
      name: 'Fed Supporter',
      description: 'Spend 50K $FED on mints',
      icon: 'banknote',
      category: 'minting',
      tier: 'bronze',
      unlocked: (agentStats?.totalSpent || 0) >= 50000,
      progress: Math.min(agentStats?.totalSpent || 0, 50000),
      maxProgress: 50000,
    },
    {
      id: 'whale',
      name: 'Fed Whale',
      description: 'Spend 500K $FED on mints',
      icon: 'wallet',
      category: 'minting',
      tier: 'gold',
      unlocked: (agentStats?.totalSpent || 0) >= 500000,
      progress: Math.min(agentStats?.totalSpent || 0, 500000),
      maxProgress: 500000,
    },

    // FORUM ACHIEVEMENTS
    {
      id: 'first_post',
      name: 'Voice Heard',
      description: 'Make your first forum post',
      icon: 'message',
      category: 'forum',
      tier: 'bronze',
      unlocked: (forumStats?.postCount || 0) >= 1,
      progress: Math.min(forumStats?.postCount || 0, 1),
      maxProgress: 1,
    },
    {
      id: 'active_poster',
      name: 'Regular Contributor',
      description: 'Make 10 forum posts',
      icon: 'messages',
      category: 'forum',
      tier: 'silver',
      unlocked: (forumStats?.postCount || 0) >= 10,
      progress: Math.min(forumStats?.postCount || 0, 10),
      maxProgress: 10,
    },
    {
      id: 'forum_veteran',
      name: 'Forum Veteran',
      description: 'Make 50 forum posts',
      icon: 'scroll',
      category: 'forum',
      tier: 'gold',
      unlocked: (forumStats?.postCount || 0) >= 50,
      progress: Math.min(forumStats?.postCount || 0, 50),
      maxProgress: 50,
    },
    {
      id: 'liked',
      name: 'Crowd Favorite',
      description: 'Receive 10 upvotes on your posts',
      icon: 'heart',
      category: 'forum',
      tier: 'silver',
      unlocked: (forumStats?.upvotesReceived || 0) >= 10,
      progress: Math.min(forumStats?.upvotesReceived || 0, 10),
      maxProgress: 10,
    },
    {
      id: 'influencer',
      name: 'Influencer',
      description: 'Receive 100 upvotes on your posts',
      icon: 'star',
      category: 'forum',
      tier: 'diamond',
      unlocked: (forumStats?.upvotesReceived || 0) >= 100,
      progress: Math.min(forumStats?.upvotesReceived || 0, 100),
      maxProgress: 100,
    },

    // PROFILE ACHIEVEMENTS
    {
      id: 'identity',
      name: 'Identity Established',
      description: 'Set a username for your profile',
      icon: 'user',
      category: 'special',
      tier: 'bronze',
      unlocked: hasUsername || false,
    },
    {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'Be among the first 100 minters',
      icon: 'rocket',
      category: 'special',
      tier: 'gold',
      unlocked: false, // Would need to track minter order
    },
  ];

  return achievements;
}
