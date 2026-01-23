'use client';

import { useState } from 'react';
import { UpdateComment } from '@/types/update-comments';

interface UpdateCommentInputProps {
  commitSha: string;
  walletAddress: string;
  onCommentSent: (comment: UpdateComment) => void;
  replyingTo?: { id: string; username: string } | null;
  onCancelReply?: () => void;
}

export function UpdateCommentInput({
  commitSha,
  walletAddress,
  onCommentSent,
  replyingTo,
  onCancelReply,
}: UpdateCommentInputProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/updates/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitSha,
          walletAddress,
          content: content.trim(),
          parentId: replyingTo?.id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to post comment');
        return;
      }

      setContent('');
      onCommentSent(data.comment);
      if (onCancelReply) onCancelReply();
    } catch {
      setError('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
          <span className="text-sm text-gray-400">
            Replying to <span className="text-white">{replyingTo.username}</span>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : 'Add a comment...'}
        maxLength={500}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-gray-600 focus:outline-none resize-none text-sm"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {error && <p className="text-xs text-red-400">{error}</p>}
          <span className="text-xs text-gray-500">{content.length}/500</span>
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Posting...' : replyingTo ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  );
}
