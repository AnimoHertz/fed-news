import { NextRequest, NextResponse } from 'next/server';
import { getCommentsForUpdate, addUpdateComment, deleteUpdateComment } from '@/lib/update-comments';
import { getUser } from '@/lib/kv';
import { fetchTokenBalance, getTierFromBalance } from '@/lib/token';

export async function GET(request: NextRequest) {
  const commitSha = request.nextUrl.searchParams.get('commitSha');
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 50;

  if (!commitSha) {
    return NextResponse.json(
      { error: 'commitSha parameter is required' },
      { status: 400 }
    );
  }

  const comments = await getCommentsForUpdate(commitSha, limit);

  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commitSha, walletAddress, content, parentId } = body;

    if (!commitSha || !walletAddress || !content) {
      return NextResponse.json(
        { error: 'commitSha, walletAddress, and content are required' },
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

    // Add comment
    const result = await addUpdateComment(
      commitSha,
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

    return NextResponse.json({ success: true, comment: result.comment });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, walletAddress } = body;

    if (!commentId || !walletAddress) {
      return NextResponse.json(
        { error: 'commentId and walletAddress are required' },
        { status: 400 }
      );
    }

    const result = await deleteUpdateComment(commentId, walletAddress);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
