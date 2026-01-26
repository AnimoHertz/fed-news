'use client';

import { useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { ChatMessage } from '@/types/chat';

interface UseReplyNotificationsParams {
  walletAddress: string | null;
  userMessageIds: Set<string>;
  onNewMessage: (message: ChatMessage) => void;
}

interface SupabaseRealtimePayload {
  new: {
    id: string;
    wallet_address: string;
    username: string;
    content: string;
    balance: number;
    tier: string;
    created_at: string;
    parent_id: string | null;
  };
}

export function useReplyNotifications({
  walletAddress,
  userMessageIds,
  onNewMessage,
}: UseReplyNotificationsParams) {
  const { showNotification } = useNotifications();

  const handleInsert = useCallback((payload: SupabaseRealtimePayload) => {
    const data = payload.new;

    // Transform to ChatMessage format
    const message: ChatMessage = {
      id: data.id,
      walletAddress: data.wallet_address,
      username: data.username,
      content: data.content,
      balance: data.balance,
      tier: data.tier as ChatMessage['tier'],
      createdAt: new Date(data.created_at).getTime(),
      parentId: data.parent_id,
    };

    // Add new message to UI
    onNewMessage(message);

    // Check if this is a reply to one of user's messages
    if (!walletAddress) return;
    if (!data.parent_id) return;
    if (!userMessageIds.has(data.parent_id)) return;

    // Don't notify for self-replies
    if (data.wallet_address === walletAddress) return;

    // Show browser notification
    showNotification(`${data.username} replied to your message`, {
      body: data.content.slice(0, 100) + (data.content.length > 100 ? '...' : ''),
      tag: `reply-${data.id}`,
    });
  }, [walletAddress, userMessageIds, onNewMessage, showNotification]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('chat_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        handleInsert
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleInsert]);
}
