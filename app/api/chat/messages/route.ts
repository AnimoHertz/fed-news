import { NextRequest, NextResponse } from 'next/server';
import { getMessages, addMessage, deleteMessage, getUser } from '@/lib/kv';
import { fetchTokenBalance, getTierFromBalance } from '@/lib/token';

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get('limit');
  const walletParam = request.nextUrl.searchParams.get('wallet');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 100;

  const messages = await getMessages(limit, walletParam);

  return NextResponse.json({ messages });
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
