import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidHash } from '@/lib/agent-hash';

export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get('hash');

  if (!hash) {
    return NextResponse.json(
      { error: 'Hash parameter required' },
      { status: 400 }
    );
  }

  if (!isValidHash(hash)) {
    return NextResponse.json(
      { error: 'Invalid hash format' },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    // If Supabase not configured, assume available (for development)
    return NextResponse.json({
      available: true,
      hash,
      message: 'Database not configured - availability check skipped',
    });
  }

  try {
    const { data, error } = await supabase
      .from('minted_agents')
      .select('id, rarity_tier, owner_wallet, created_at')
      .eq('trait_hash', hash)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected for available agents
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (data) {
      // Already minted
      return NextResponse.json({
        available: false,
        hash,
        mintedBy: data.owner_wallet,
        mintedAt: data.created_at,
        rarityTier: data.rarity_tier,
      });
    }

    // Available for minting
    return NextResponse.json({
      available: true,
      hash,
    });
  } catch (error) {
    console.error('Check availability error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
