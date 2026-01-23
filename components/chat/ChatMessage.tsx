'use client';

import { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { TierBadge } from './TierBadge';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
  currentWallet?: string | null;
  onDelete?: (messageId: string) => void;
  onReply?: (parentId: string) => void;
  isReply?: boolean;
}

export function ChatMessage({ message, currentWallet, onDelete, onReply, isReply = false }: ChatMessageProps) {
  const [deleting, setDeleting] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });

  const isOwner = currentWallet &&
    message.walletAddress.toLowerCase() === currentWallet.toLowerCase();

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

  return (
    <div className={`p-4 rounded-lg border border-gray-800 bg-gray-900/30 ${isReply ? 'ml-8 border-l-2 border-l-gray-700' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-white">{message.username}</span>
          <TierBadge tier={message.tier} balance={message.balance} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
          {currentWallet && onReply && !isReply && (
            <button
              onClick={() => onReply(message.id)}
              className="px-2 py-1 text-xs text-gray-400 border border-gray-700 rounded hover:bg-gray-800 transition-colors"
            >
              Reply
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2 py-1 text-xs text-red-400 border border-red-500/30 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
              title="Delete message"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-300 whitespace-pre-wrap break-words">{message.content}</p>

      {/* Render replies */}
      {message.replies && message.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {message.replies.map((reply) => (
            <ChatMessage
              key={reply.id}
              message={reply}
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
