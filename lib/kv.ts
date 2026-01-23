import { supabase, isSupabaseConfigured } from './supabase';
import { ChatUser, ChatMessage, HolderTier } from '@/types/chat';

const MAX_MESSAGES = 1000;

// User operations
export async function getUser(walletAddress: string): Promise<ChatUser | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('chat_users')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();

  if (error || !data) return null;

  return {
    walletAddress: data.wallet_address,
    username: data.username,
    createdAt: new Date(data.created_at).getTime(),
  };
}

export async function getUserByUsername(username: string): Promise<ChatUser | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('chat_users')
    .select('*')
    .eq('username_lower', username.toLowerCase())
    .single();

  if (error || !data) return null;

  return {
    walletAddress: data.wallet_address,
    username: data.username,
    createdAt: new Date(data.created_at).getTime(),
  };
}

export async function setUsername(
  walletAddress: string,
  username: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  // Validate username
  if (!username || username.length < 3 || username.length > 20) {
    return { success: false, error: 'Username must be 3-20 characters' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { success: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  // Check if username is taken by someone else
  const existingUser = await getUserByUsername(username);
  if (existingUser && existingUser.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    return { success: false, error: 'Username already taken' };
  }

  // Upsert user
  const { error } = await supabase
    .from('chat_users')
    .upsert({
      wallet_address: walletAddress.toLowerCase(),
      username,
      username_lower: username.toLowerCase(),
    }, {
      onConflict: 'wallet_address',
    });

  if (error) {
    console.error('Failed to set username:', error);
    return { success: false, error: 'Failed to set username' };
  }

  return { success: true };
}

// Message operations
export async function getMessages(limit: number = 100): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    walletAddress: row.wallet_address,
    username: row.username,
    content: row.content,
    balance: row.balance,
    tier: row.tier as HolderTier,
    createdAt: new Date(row.created_at).getTime(),
    parentId: row.parent_id || null,
  }));
}

export async function addMessage(
  walletAddress: string,
  username: string,
  content: string,
  balance: number,
  tier: HolderTier,
  parentId?: string | null
): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  // Validate content
  if (!content || content.trim().length === 0) {
    return { success: false, error: 'Message cannot be empty' };
  }

  if (content.length > 500) {
    return { success: false, error: 'Message must be 500 characters or less' };
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      wallet_address: walletAddress.toLowerCase(),
      username,
      content: content.trim(),
      balance,
      tier,
      parent_id: parentId || null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to add message:', error);
    return { success: false, error: 'Failed to send message' };
  }

  const message: ChatMessage = {
    id: data.id,
    walletAddress: data.wallet_address,
    username: data.username,
    content: data.content,
    balance: data.balance,
    tier: data.tier as HolderTier,
    createdAt: new Date(data.created_at).getTime(),
    parentId: data.parent_id || null,
  };

  // Clean up old messages (keep only MAX_MESSAGES)
  // This runs async, don't wait for it
  cleanupOldMessages();

  return { success: true, message };
}

export async function deleteMessage(
  messageId: string,
  walletAddress: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  // Verify the message belongs to this wallet
  const { data: message } = await supabase
    .from('chat_messages')
    .select('wallet_address')
    .eq('id', messageId)
    .single();

  if (!message) {
    return { success: false, error: 'Message not found' };
  }

  if (message.wallet_address !== walletAddress.toLowerCase()) {
    return { success: false, error: 'Not authorized to delete this message' };
  }

  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('Failed to delete message:', error);
    return { success: false, error: 'Failed to delete message' };
  }

  return { success: true };
}

async function cleanupOldMessages() {
  if (!isSupabaseConfigured()) return;

  try {
    // Get the ID of the message at position MAX_MESSAGES
    const { data } = await supabase
      .from('chat_messages')
      .select('id')
      .order('created_at', { ascending: false })
      .range(MAX_MESSAGES, MAX_MESSAGES);

    if (data && data.length > 0) {
      // Delete all messages older than this
      const cutoffId = data[0].id;
      await supabase
        .from('chat_messages')
        .delete()
        .lt('id', cutoffId);
    }
  } catch (error) {
    console.error('Failed to cleanup old messages:', error);
  }
}
