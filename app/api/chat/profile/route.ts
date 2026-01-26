import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserCommentCount, getOriginalWalletAddress } from '@/lib/kv';
import { fetchTokenBalance, getTierFromBalance } from '@/lib/token';
import { UserProfile } from '@/types/chat';

export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('wallet');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
  }

  // First get user to find original wallet address (for Helius API)
  const user = await getUser(walletAddress);

  // Try to get the original case wallet address from DB, fall back to provided address
  const originalWallet = await getOriginalWalletAddress(walletAddress) || walletAddress;

  // Fetch balance and comment count in parallel using original case wallet
  const [balance, commentCount] = await Promise.all([
    fetchTokenBalance(originalWallet),
    getUserCommentCount(walletAddress),
  ]);

  const tier = getTierFromBalance(balance);

  const profile: UserProfile = {
    walletAddress: originalWallet,
    username: user?.username || null,
    balance,
    tier,
    commentCount,
  };

  return NextResponse.json(profile);
}
