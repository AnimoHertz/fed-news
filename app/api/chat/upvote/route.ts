import { NextRequest, NextResponse } from 'next/server';
import { toggleUpvote } from '@/lib/kv';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, walletAddress } = body;

    if (!messageId || !walletAddress) {
      return NextResponse.json(
        { error: 'Message ID and wallet address required' },
        { status: 400 }
      );
    }

    const result = await toggleUpvote(messageId, walletAddress);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      upvoted: result.upvoted,
      upvotes: result.upvotes,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
