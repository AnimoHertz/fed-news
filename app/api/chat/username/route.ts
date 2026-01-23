import { NextRequest, NextResponse } from 'next/server';
import { getUser, setUsername } from '@/lib/kv';

export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('wallet');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
  }

  const user = await getUser(walletAddress);

  return NextResponse.json({
    username: user?.username || null,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, username } = body;

    if (!walletAddress || !username) {
      return NextResponse.json(
        { error: 'Wallet address and username required' },
        { status: 400 }
      );
    }

    const result = await setUsername(walletAddress, username);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, username });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
