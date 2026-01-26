'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { TierBadge } from './TierBadge';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
  currentWallet?: string | null;
  onDelete?: (messageId: string) => void;
  onMessageSent?: (message: ChatMessageType) => void;
  onUpvoteChange?: (messageId: string, upvotes: number, upvoted: boolean) => void;
  isReply?: boolean;
  replyingToId?: string | null;
  onSetReplyingTo?: (id: string | null) => void;
  rootAuthorWallet?: string; // The original post author's wallet
  rootMessageId?: string; // The root message ID for threading
}

export function ChatMessage({
  message,
  currentWallet,
  onDelete,
  onMessageSent,
  onUpvoteChange,
  isReply = false,
  replyingToId,
  onSetReplyingTo,
  rootAuthorWallet,
  rootMessageId,
}: ChatMessageProps) {
  // For top-level messages, they are their own root
  const effectiveRootAuthor = rootAuthorWallet || message.walletAddress;
  const effectiveRootId = rootMessageId || message.id;
  const [deleting, setDeleting] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [upvoting, setUpvoting] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(message.upvotes);
  const [localUpvoted, setLocalUpvoted] = useState(message.upvotedByUser || false);
  const [upvoteAnimating, setUpvoteAnimating] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  const isReplying = replyingToId === message.id;

  const isOwner = currentWallet &&
    message.walletAddress.toLowerCase() === currentWallet.toLowerCase();

  // Check if this reply is from the original post author
  const isOriginalAuthor = isReply &&
    rootAuthorWallet &&
    message.walletAddress.toLowerCase() === rootAuthorWallet.toLowerCase();

  const handleDelete = async () => {
    if (!confirm('Delete this message?')) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: message.id,
          walletAddress: currentWallet
        }),
      });

      if (response.ok && onDelete) {
        onDelete(message.id);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentWallet) return;

    setReplyError('');
    setReplyLoading(true);

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: currentWallet,
          content: replyContent.trim(),
          parentId: message.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setReplyError(data.error || 'Failed to send reply');
        return;
      }

      setReplyContent('');
      if (onMessageSent) onMessageSent(data.message);
      if (onSetReplyingTo) onSetReplyingTo(null);
    } catch {
      setReplyError('Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleReplyClick = () => {
    if (onSetReplyingTo) {
      onSetReplyingTo(message.id);
    }
  };

  const handleCancelReply = () => {
    setReplyContent('');
    setReplyError('');
    if (onSetReplyingTo) onSetReplyingTo(null);
  };

  const handleUpvote = async () => {
    if (!currentWallet || upvoting) return;

    // Optimistic update
    const wasUpvoted = localUpvoted;
    const previousUpvotes = localUpvotes;
    const newUpvoted = !wasUpvoted;
    const newUpvotes = wasUpvoted ? localUpvotes - 1 : localUpvotes + 1;

    setLocalUpvoted(newUpvoted);
    setLocalUpvotes(newUpvotes);
    setUpvoting(true);

    // Trigger animation
    if (newUpvoted) {
      setUpvoteAnimating(true);
      setTimeout(() => setUpvoteAnimating(false), 400);
    }

    try {
      const response = await fetch('/api/chat/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: message.id,
          walletAddress: currentWallet,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Sync with server response
        setLocalUpvotes(data.upvotes);
        setLocalUpvoted(data.upvoted);
        if (onUpvoteChange) {
          onUpvoteChange(message.id, data.upvotes, data.upvoted);
        }
      } else {
        // Revert on error
        setLocalUpvoted(wasUpvoted);
        setLocalUpvotes(previousUpvotes);
      }
    } catch (error) {
      console.error('Failed to upvote:', error);
      // Revert on error
      setLocalUpvoted(wasUpvoted);
      setLocalUpvotes(previousUpvotes);
    } finally {
      setUpvoting(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg border border-gray-800 bg-gray-900/30 ${isReply ? 'ml-8 border-l-2 border-l-gray-700' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/profile?wallet=${message.walletAddress}`}
            className="font-medium text-white hover:text-emerald-400 transition-colors"
          >
            {message.username}
          </Link>
          <TierBadge tier={message.tier} balance={message.balance} />
          {isOriginalAuthor && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              Author
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
          {currentWallet && !isReplying && (
            // Show Reply button for:
            // - Top-level posts (anyone can reply)
            // - Replies (only the original post author or the reply author can continue the thread)
            (!isReply ||
              currentWallet.toLowerCase() === effectiveRootAuthor.toLowerCase() ||
              currentWallet.toLowerCase() === message.walletAddress.toLowerCase()
            ) && (
              <button
                onClick={handleReplyClick}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 border border-gray-700 rounded hover:bg-gray-800 hover:text-white transition-all hover:scale-105 active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply
              </button>
            )
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-400 border border-red-500/30 rounded hover:bg-red-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              title="Delete message"
            >
              {deleting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-300 whitespace-pre-wrap break-words">{message.content}</p>

      {/* Upvote button */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleUpvote}
          disabled={!currentWallet || upvoting}
          className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-all hover:scale-105 active:scale-95 ${
            localUpvoted
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-gray-500 border border-gray-700 hover:bg-gray-800 hover:text-gray-300'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          title={currentWallet ? (localUpvoted ? 'Remove upvote' : 'Upvote') : 'Connect wallet to upvote'}
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${upvoteAnimating ? 'animate-upvote' : ''}`}
            fill={localUpvoted ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
          <span className="font-mono">{localUpvotes}</span>
        </button>
      </div>

      {/* Inline reply input */}
      {isReplying && currentWallet && (
        <form onSubmit={handleReplySubmit} className="mt-4 ml-4 pl-4 border-l-2 border-gray-700">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`Reply to ${message.username}...`}
            maxLength={500}
            rows={2}
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-gray-600 focus:outline-none resize-none text-sm"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {replyError && (
                <p className="text-xs text-red-400">{replyError}</p>
              )}
              <span className="text-xs text-gray-500">
                {replyContent.length}/500
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelReply}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={replyLoading || !replyContent.trim()}
                className="px-3 py-1.5 text-xs font-medium rounded bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {replyLoading ? 'Sending...' : 'Reply'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Render replies */}
      {message.replies && message.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {message.replies.map((reply) => (
            <ChatMessage
              key={reply.id}
              message={reply}
              currentWallet={currentWallet}
              onDelete={onDelete}
              onMessageSent={onMessageSent}
              onUpvoteChange={onUpvoteChange}
              isReply={true}
              replyingToId={replyingToId}
              onSetReplyingTo={onSetReplyingTo}
              rootAuthorWallet={effectiveRootAuthor}
              rootMessageId={effectiveRootId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
