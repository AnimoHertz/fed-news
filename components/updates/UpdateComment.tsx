'use client';

import { useState } from 'react';
import { UpdateComment as UpdateCommentType } from '@/types/update-comments';
import { TierBadge } from '@/components/chat/TierBadge';
import { formatDistanceToNow } from 'date-fns';

interface UpdateCommentProps {
  comment: UpdateCommentType;
  currentWallet?: string | null;
  onDelete?: (commentId: string) => void;
  onReply?: (parentId: string) => void;
  isReply?: boolean;
}

export function UpdateComment({
  comment,
  currentWallet,
  onDelete,
  onReply,
  isReply = false,
}: UpdateCommentProps) {
  const [deleting, setDeleting] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

  const isOwner =
    currentWallet && comment.walletAddress.toLowerCase() === currentWallet.toLowerCase();

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/updates/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: comment.id,
          walletAddress: currentWallet,
        }),
      });

      if (response.ok && onDelete) {
        onDelete(comment.id);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border border-gray-800 bg-gray-900/30 ${
        isReply ? 'ml-6 border-l-2 border-l-gray-700' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-white text-sm">{comment.username}</span>
          <TierBadge tier={comment.tier} balance={comment.balance} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
          {currentWallet && onReply && !isReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="px-2 py-0.5 text-xs text-gray-400 border border-gray-700 rounded hover:bg-gray-800 transition-colors"
            >
              Reply
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2 py-0.5 text-xs text-red-400 border border-red-500/30 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
              title="Delete comment"
            >
              {deleting ? '...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">{comment.content}</p>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.replies.map((reply) => (
            <UpdateComment
              key={reply.id}
              comment={reply}
              currentWallet={currentWallet}
              onDelete={onDelete}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
