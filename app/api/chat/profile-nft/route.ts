import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET - Get user's profile NFT and their minted agents
export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('wallet');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      profileNft: null,
      ownedAgents: [],
      warning: 'Database not configured',
    });
  }

  try {
    // Get user's profile NFT setting
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('profile_nft_id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    // Get all agents owned by this wallet
    const { data: ownedAgents, error: agentsError } = await supabase
      .from('minted_agents')
      .select('*')
      .eq('owner_wallet', walletAddress)
      .order('created_at', { ascending: false });

    if (agentsError && agentsError.code !== 'PGRST116') {
      console.error('Error fetching owned agents:', agentsError);
    }

    // If user has a profile NFT set, get its details
    let profileNft = null;
    if (profileData?.profile_nft_id) {
      const { data: nftData } = await supabase
        .from('minted_agents')
        .select('*')
        .eq('id', profileData.profile_nft_id)
        .single();

      if (nftData) {
        profileNft = {
          id: nftData.id,
          traitHash: nftData.trait_hash,
          traits: {
            headStyle: nftData.head_style,
            eyeStyle: nftData.eye_style,
            mouthStyle: nftData.mouth_style,
            bodyStyle: nftData.body_style,
            feetStyle: nftData.feet_style,
            accessory: nftData.accessory,
            bgStyle: nftData.bg_style,
            primaryColor: nftData.primary_color,
            secondaryColor: nftData.secondary_color,
            accentColor: nftData.accent_color,
            tier: nftData.tier,
          },
          rarityScore: nftData.rarity_score,
          rarityTier: nftData.rarity_tier,
        };
      }
    }

    // Transform owned agents
    const agents = (ownedAgents || []).map((row) => ({
      id: row.id,
      traitHash: row.trait_hash,
      traits: {
        headStyle: row.head_style,
        eyeStyle: row.eye_style,
        mouthStyle: row.mouth_style,
        bodyStyle: row.body_style,
        feetStyle: row.feet_style,
        accessory: row.accessory,
        bgStyle: row.bg_style,
        primaryColor: row.primary_color,
        secondaryColor: row.secondary_color,
        accentColor: row.accent_color,
        tier: row.tier,
      },
      rarityScore: row.rarity_score,
      rarityTier: row.rarity_tier,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      profileNft,
      ownedAgents: agents,
    });
  } catch (error) {
    console.error('Profile NFT error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile NFT' },
      { status: 500 }
    );
  }
}

// POST - Set user's profile NFT
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      warning: 'Database not configured',
    });
  }

  try {
    const { walletAddress, nftId } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // If nftId is provided, verify ownership
    if (nftId) {
      const { data: nft, error: nftError } = await supabase
        .from('minted_agents')
        .select('owner_wallet')
        .eq('id', nftId)
        .single();

      if (nftError || !nft) {
        return NextResponse.json(
          { error: 'NFT not found' },
          { status: 404 }
        );
      }

      if (nft.owner_wallet.toLowerCase() !== walletAddress.toLowerCase()) {
        return NextResponse.json(
          { error: 'You do not own this NFT' },
          { status: 403 }
        );
      }
    }

    // Upsert user profile
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        wallet_address: walletAddress.toLowerCase(),
        profile_nft_id: nftId || null,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error setting profile NFT:', error);
      return NextResponse.json(
        { error: 'Failed to set profile NFT' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile NFT error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
