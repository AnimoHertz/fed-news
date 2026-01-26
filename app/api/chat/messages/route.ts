import { NextRequest, NextResponse } from 'next/server';
import { getMessages, addMessage, deleteMessage, getUser } from '@/lib/kv';
import { fetchTokenBalance, getTierFromBalance } from '@/lib/token';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Helper to get profile NFTs for a list of wallet addresses
async function getProfileNfts(walletAddresses: string[]): Promise<Map<string, unknown>> {
  const profileNfts = new Map();

  if (!isSupabaseConfigured() || walletAddresses.length === 0) {
    return profileNfts;
  }

  try {
    // Get user profiles with their NFT IDs
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('wallet_address, profile_nft_id')
      .in('wallet_address', walletAddresses.map(w => w.toLowerCase()));

    if (!profiles || profiles.length === 0) {
      return profileNfts;
    }

    // Get the NFT IDs that are set
    const nftIds = profiles
      .filter(p => p.profile_nft_id)
      .map(p => p.profile_nft_id);

    if (nftIds.length === 0) {
      return profileNfts;
    }

    // Fetch the actual NFT data
    const { data: nfts } = await supabase
      .from('minted_agents')
      .select('id, head_style, eye_style, mouth_style, body_style, feet_style, accessory, bg_style, primary_color, secondary_color, accent_color, tier, rarity_score, rarity_tier')
      .in('id', nftIds);

    if (!nfts) {
      return profileNfts;
    }

    // Create a map of NFT ID to NFT data
    const nftMap = new Map(nfts.map(n => [n.id, n]));

    // Map wallet addresses to their NFT data
    for (const profile of profiles) {
      if (profile.profile_nft_id && nftMap.has(profile.profile_nft_id)) {
        const nft = nftMap.get(profile.profile_nft_id)!;
        profileNfts.set(profile.wallet_address.toLowerCase(), {
          id: nft.id,
          traits: {
            headStyle: nft.head_style,
            eyeStyle: nft.eye_style,
            mouthStyle: nft.mouth_style,
            bodyStyle: nft.body_style,
            feetStyle: nft.feet_style,
            accessory: nft.accessory,
            bgStyle: nft.bg_style,
            primaryColor: nft.primary_color,
            secondaryColor: nft.secondary_color,
            accentColor: nft.accent_color,
            tier: nft.tier,
          },
          rarityTier: nft.rarity_tier,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching profile NFTs:', error);
  }

  return profileNfts;
}

// Recursively collect all wallet addresses from messages and replies
function collectWalletAddresses(messages: { walletAddress: string; replies?: unknown[] }[]): string[] {
  const addresses: string[] = [];
  for (const msg of messages) {
    addresses.push(msg.walletAddress);
    if (msg.replies && Array.isArray(msg.replies)) {
      addresses.push(...collectWalletAddresses(msg.replies as { walletAddress: string; replies?: unknown[] }[]));
    }
  }
  return [...new Set(addresses)];
}

// Recursively attach profile NFTs to messages
function attachProfileNfts(messages: unknown[], profileNfts: Map<string, unknown>): unknown[] {
  return messages.map((msg: unknown) => {
    const message = msg as { walletAddress: string; replies?: unknown[] };
    const nft = profileNfts.get(message.walletAddress.toLowerCase());
    return {
      ...message,
      profileNft: nft || null,
      replies: message.replies ? attachProfileNfts(message.replies, profileNfts) : undefined,
    };
  });
}

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get('limit');
  const walletParam = request.nextUrl.searchParams.get('wallet');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 100;

  const messages = await getMessages(limit, walletParam);

  // Get all unique wallet addresses
  const walletAddresses = collectWalletAddresses(messages as { walletAddress: string; replies?: unknown[] }[]);

  // Fetch profile NFTs for all users
  const profileNfts = await getProfileNfts(walletAddresses);

  // Attach profile NFTs to messages
  const messagesWithNfts = attachProfileNfts(messages as unknown[], profileNfts);

  return NextResponse.json({ messages: messagesWithNfts });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, content, parentId } = body;

    if (!walletAddress || !content) {
      return NextResponse.json(
        { error: 'Wallet address and content required' },
        { status: 400 }
      );
    }

    // Get user's username
    const user = await getUser(walletAddress);
    if (!user) {
      return NextResponse.json(
        { error: 'Please set a username first' },
        { status: 400 }
      );
    }

    // Fetch current token balance
    const balance = await fetchTokenBalance(walletAddress);
    const tier = getTierFromBalance(balance);

    // Add message
    const result = await addMessage(
      walletAddress,
      user.username,
      content,
      balance,
      tier,
      parentId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, walletAddress } = body;

    if (!messageId || !walletAddress) {
      return NextResponse.json(
        { error: 'Message ID and wallet address required' },
        { status: 400 }
      );
    }

    const result = await deleteMessage(messageId, walletAddress);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
