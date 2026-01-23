'use client';

import { useState } from 'react';
import { ChatMessage } from '@/types/chat';

interface MessageInputProps {
  walletAddress: string;
  onMessageSent: (message: ChatMessage) => void;
}

export function MessageInput({ walletAddress, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send message');
        return;
      }

      setContent('');
      onMessageSent(data.message);
    } catch {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a message..."
        maxLength={500}
        rows={3}
        className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-gray-600 focus:outline-none resize-none"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <span className="text-xs text-gray-500">
            {content.length}/500
          </span>
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
