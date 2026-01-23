import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/kv';
import { fetchTokenBalance, getTierFromBalance } from '@/lib/token';
import { UserProfile } from '@/types/chat';

export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('wallet');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
  }

  // Fetch user and balance in parallel
  const [user, balance] = await Promise.all([
    getUser(walletAddress),
    fetchTokenBalance(walletAddress),
  ]);

  const tier = getTierFromBalance(balance);

  const profile: UserProfile = {
    walletAddress,
    username: user?.username || null,
    balance,
    tier,
  };

  return NextResponse.json(profile);
}
