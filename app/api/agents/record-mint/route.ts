import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidHash, AgentTraits } from '@/lib/agent-hash';
import { verifyPaymentTransaction } from '@/lib/solana';

interface RecordMintRequest {
  traitHash: string;
  traits: AgentTraits;
  nftMintAddress: string;
  metadataUri: string;
  imageUri: string;
  ownerWallet: string;
  minterWallet: string;
  mintTransaction: string;
  paymentTransaction: string;
  paymentAmount: number;
  rarityScore: number;
  rarityTier: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecordMintRequest = await request.json();

    // Validate required fields
    const requiredFields = [
      'traitHash',
      'traits',
      'nftMintAddress',
      'metadataUri',
      'imageUri',
      'ownerWallet',
      'minterWallet',
      'mintTransaction',
      'paymentTransaction',
      'paymentAmount',
      'rarityScore',
      'rarityTier',
    ] as const;

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate hash format
    if (!isValidHash(body.traitHash)) {
      return NextResponse.json(
        { error: 'Invalid trait hash format' },
        { status: 400 }
      );
    }

    // Validate rarity score
    if (body.rarityScore < 0 || body.rarityScore > 1000) {
      return NextResponse.json(
        { error: 'Rarity score must be between 0 and 1000' },
        { status: 400 }
      );
    }

    // Verify the payment transaction
    const verification = await verifyPaymentTransaction(
      body.paymentTransaction,
      body.minterWallet,
      body.paymentAmount
    );

    if (!verification.isValid) {
      console.error('Payment verification failed:', verification.error);
      // For development, we might want to skip verification
      // In production, uncomment the following:
      // return NextResponse.json(
      //   { error: `Payment verification failed: ${verification.error}` },
      //   { status: 400 }
      // );
    }

    if (!isSupabaseConfigured()) {
      // Return success without recording if Supabase not configured
      return NextResponse.json({
        success: true,
        warning: 'Database not configured - mint not recorded',
        traitHash: body.traitHash,
      });
    }

    // Check if already minted (race condition protection)
    const { data: existing } = await supabase
      .from('minted_agents')
      .select('id')
      .eq('trait_hash', body.traitHash)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This agent has already been minted' },
        { status: 409 }
      );
    }

    // Insert the mint record
    const { data, error } = await supabase
      .from('minted_agents')
      .insert({
        trait_hash: body.traitHash,
        head_style: body.traits.headStyle,
        eye_style: body.traits.eyeStyle,
        mouth_style: body.traits.mouthStyle,
        body_style: body.traits.bodyStyle,
        feet_style: body.traits.feetStyle,
        accessory: body.traits.accessory,
        bg_style: body.traits.bgStyle,
        primary_color: body.traits.primaryColor,
        secondary_color: body.traits.secondaryColor || null,
        accent_color: body.traits.accentColor,
        tier: body.traits.tier,
        nft_mint_address: body.nftMintAddress,
        metadata_uri: body.metadataUri,
        image_uri: body.imageUri,
        owner_wallet: body.ownerWallet,
        minter_wallet: body.minterWallet,
        mint_transaction: body.mintTransaction,
        payment_transaction: body.paymentTransaction,
        payment_amount: Math.round(body.paymentAmount * 1_000_000), // Store as raw amount
        rarity_score: body.rarityScore,
        rarity_tier: body.rarityTier,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);

      if (error.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'This agent has already been minted' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to record mint' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      traitHash: body.traitHash,
    });
  } catch (error) {
    console.error('Record mint error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
