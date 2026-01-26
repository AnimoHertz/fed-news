'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ChatMessage as ChatMessageType, UserProfile } from '@/types/chat';
import { WalletButton } from './WalletButton';
import { UsernameSetup } from './UsernameSetup';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { TierBadge } from './TierBadge';
import { NotificationPrompt } from './NotificationPrompt';
import { useReplyNotifications } from '@/hooks/useReplyNotifications';

export function ChatForum() {
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const walletAddress = publicKey?.toBase58() || null;

  // Organize messages into threads (supports nested replies)
  const threadedMessages = useMemo(() => {
    const messageMap = new Map<string, ChatMessageType & { replies: ChatMessageType[] }>();
    const topLevel: (ChatMessageType & { replies: ChatMessageType[] })[] = [];

    // First pass: create a map of all messages with empty replies arrays
    for (const msg of messages) {
      messageMap.set(msg.id, { ...msg, replies: [] });
    }

    // Second pass: attach replies to their parents
    for (const msg of messages) {
      const messageWithReplies = messageMap.get(msg.id)!;
      if (msg.parentId) {
        const parent = messageMap.get(msg.parentId);
        if (parent) {
          parent.replies.push(messageWithReplies);
        }
      } else {
        topLevel.push(messageWithReplies);
      }
    }

    // Sort replies by creation time
    const sortReplies = (msg: ChatMessageType & { replies: ChatMessageType[] }) => {
      msg.replies.sort((a, b) => a.createdAt - b.createdAt);
      msg.replies.forEach(reply => {
        if ('replies' in reply) {
          sortReplies(reply as ChatMessageType & { replies: ChatMessageType[] });
        }
      });
    };

    topLevel.forEach(sortReplies);

    return topLevel;
  }, [messages]);

  // Track user's message IDs for reply notifications
  const userMessageIds = useMemo(() => {
    if (!walletAddress) return new Set<string>();
    return new Set(
      messages.filter((m) => m.walletAddress === walletAddress).map((m) => m.id)
    );
  }, [messages, walletAddress]);

  // Handle real-time message updates (avoid duplicates)
  const handleRealtimeMessage = useCallback((message: ChatMessageType) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [message, ...prev];
    });
  }, []);

  // Subscribe to real-time reply notifications
  useReplyNotifications({
    walletAddress,
    userMessageIds,
    onNewMessage: handleRealtimeMessage,
  });

  // Fetch messages
  const fetchMessages = useCallback(async (showRefreshing = false, wallet?: string | null) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const url = wallet
        ? `/api/chat/messages?limit=100&wallet=${wallet}`
        : '/api/chat/messages?limit=100';
      const response = await fetch(url);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch profile when wallet connects
  const fetchProfile = useCallback(async () => {
    if (!walletAddress) {
      setProfile(null);
      return;
    }

    try {
      const response = await fetch(`/api/chat/profile?wallet=${walletAddress}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchMessages(false, walletAddress);
  }, [fetchMessages, walletAddress]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUsernameSet = (username: string) => {
    if (profile) {
      setProfile({ ...profile, username });
    }
    setEditingUsername(false);
  };

  const handleMessageSent = (message: ChatMessageType) => {
    setMessages((prev) => [message, ...prev]);
    setReplyingToId(null);
  };

  const handleMessageDeleted = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId && m.parentId !== messageId));
  };

  const handleUpvoteChange = (messageId: string, upvotes: number, upvoted: boolean) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, upvotes, upvotedByUser: upvoted } : m
      )
    );
  };

  const handleRefresh = () => {
    fetchMessages(true, walletAddress);
    if (walletAddress) {
      fetchProfile();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <WalletButton />
          {profile && profile.username && !editingUsername && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-400">
                Posting as <span className="text-white">{profile.username}</span>
              </span>
              <button
                onClick={() => setEditingUsername(true)}
                className="text-xs text-gray-500 hover:text-white transition-colors"
                title="Change username"
              >
                (edit)
              </button>
              <TierBadge tier={profile.tier} balance={profile.balance} />
            </div>
          )}
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="self-end sm:self-auto px-3 py-1.5 text-sm text-gray-400 border border-gray-700 rounded hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Balance display when connected */}
      {walletAddress && profile && (
        <div className="p-3 sm:p-4 rounded-lg animated-border animated-border-emerald animated-border-subtle bg-gray-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-gray-400">Your $FED Balance</span>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-xl font-mono text-white">
                {profile.balance.toLocaleString()} FED
              </span>
              <TierBadge tier={profile.tier} balance={profile.balance} showBalance={false} />
            </div>
          </div>
        </div>
      )}

      {/* Username setup or message input */}
      {walletAddress && (!profile?.username || editingUsername) && (
        <div className="space-y-2">
          <UsernameSetup
            walletAddress={walletAddress}
            onUsernameSet={handleUsernameSet}
            currentUsername={profile?.username}
          />
          {editingUsername && (
            <button
              onClick={() => setEditingUsername(false)}
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {walletAddress && profile?.username && !editingUsername && (
        <MessageInput
          walletAddress={walletAddress}
          onMessageSent={handleMessageSent}
        />
      )}

      {/* Notification prompt for connected users */}
      {walletAddress && profile?.username && <NotificationPrompt />}

      {!walletAddress && (
        <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/30 text-center">
          <p className="text-gray-400">
            Connect your wallet to join the conversation.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/30 text-center">
            <p className="text-gray-400">Loading messages...</p>
          </div>
        ) : threadedMessages.length === 0 ? (
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/30 text-center">
            <p className="text-gray-400">No messages yet. Be the first to post!</p>
          </div>
        ) : (
          threadedMessages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              currentWallet={walletAddress}
              onDelete={handleMessageDeleted}
              onMessageSent={handleMessageSent}
              onUpvoteChange={handleUpvoteChange}
              replyingToId={replyingToId}
              onSetReplyingTo={setReplyingToId}
            />
          ))
        )}
      </div>
    </div>
  );
}
