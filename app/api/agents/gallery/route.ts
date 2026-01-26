import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface MintedAgent {
  id: string;
  traitHash: string;
  traits: {
    headStyle: string;
    eyeStyle: string;
    mouthStyle: string;
    bodyStyle: string;
    feetStyle: string;
    accessory: string;
    bgStyle: string;
    primaryColor: string;
    secondaryColor: string | null;
    accentColor: string;
    tier: string;
  };
  nftMintAddress: string;
  metadataUri: string;
  imageUri: string;
  ownerWallet: string;
  minterWallet: string;
  paymentTransaction: string;
  paymentAmount: number;
  rarityScore: number;
  rarityTier: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get('limit');
  const offsetParam = request.nextUrl.searchParams.get('offset');
  const ownerParam = request.nextUrl.searchParams.get('owner');
  const tierParam = request.nextUrl.searchParams.get('tier');
  const rarityParam = request.nextUrl.searchParams.get('rarity');
  const sortParam = request.nextUrl.searchParams.get('sort') || 'newest';

  const limit = Math.min(parseInt(limitParam || '20', 10), 100);
  const offset = parseInt(offsetParam || '0', 10);

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      agents: [],
      total: 0,
      warning: 'Database not configured',
    });
  }

  try {
    let query = supabase
      .from('minted_agents')
      .select('*', { count: 'exact' });

    // Apply filters
    if (ownerParam) {
      query = query.eq('owner_wallet', ownerParam);
    }

    if (tierParam) {
      query = query.eq('tier', tierParam.toLowerCase());
    }

    if (rarityParam) {
      query = query.eq('rarity_tier', rarityParam);
    }

    // Apply sorting
    switch (sortParam) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'rarity_high':
        query = query.order('rarity_score', { ascending: false });
        break;
      case 'rarity_low':
        query = query.order('rarity_score', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch gallery' },
        { status: 500 }
      );
    }

    // Get total $FED raised
    const { data: sumData } = await supabase
      .from('minted_agents')
      .select('payment_amount')
      .then(({ data }) => ({
        data: data?.reduce((sum, row) => sum + (row.payment_amount || 0), 0) || 0
      }));

    const totalRaised = (sumData || 0) / 1_000_000; // Convert from raw

    // Transform data to API format
    const agents: MintedAgent[] = (data || []).map((row) => ({
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
      nftMintAddress: row.nft_mint_address,
      metadataUri: row.metadata_uri,
      imageUri: row.image_uri,
      ownerWallet: row.owner_wallet,
      minterWallet: row.minter_wallet,
      paymentTransaction: row.payment_transaction,
      paymentAmount: row.payment_amount / 1_000_000, // Convert from raw
      rarityScore: row.rarity_score,
      rarityTier: row.rarity_tier,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      agents,
      total: count || 0,
      totalRaised,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Gallery error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}

/**
 * Get statistics about minted agents
 */
export async function HEAD() {
  if (!isSupabaseConfigured()) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Total-Minted': '0',
      },
    });
  }

  try {
    const { count } = await supabase
      .from('minted_agents')
      .select('*', { count: 'exact', head: true });

    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Total-Minted': String(count || 0),
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
