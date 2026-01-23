import { supabase, isSupabaseConfigured } from './supabase';
import { UpdateComment } from '@/types/update-comments';
import { HolderTier } from '@/types/chat';

// Get comments for a specific update (commit)
export async function getCommentsForUpdate(
  commitSha: string,
  limit: number = 100
): Promise<UpdateComment[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('update_comments')
    .select('*')
    .eq('commit_sha', commitSha)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    commitSha: row.commit_sha,
    walletAddress: row.wallet_address,
    username: row.username,
    content: row.content,
    balance: row.balance,
    tier: row.tier as HolderTier,
    createdAt: new Date(row.created_at).getTime(),
    parentId: row.parent_id || null,
  }));
}

// Add a comment to an update
export async function addUpdateComment(
  commitSha: string,
  walletAddress: string,
  username: string,
  content: string,
  balance: number,
  tier: HolderTier,
  parentId?: string | null
): Promise<{ success: boolean; comment?: UpdateComment; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  // Validate content
  if (!content || content.trim().length === 0) {
    return { success: false, error: 'Comment cannot be empty' };
  }

  if (content.length > 500) {
    return { success: false, error: 'Comment must be 500 characters or less' };
  }

  const { data, error } = await supabase
    .from('update_comments')
    .insert({
      commit_sha: commitSha,
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
    console.error('Failed to add comment:', error);
    return { success: false, error: 'Failed to post comment' };
  }

  const comment: UpdateComment = {
    id: data.id,
    commitSha: data.commit_sha,
    walletAddress: data.wallet_address,
    username: data.username,
    content: data.content,
    balance: data.balance,
    tier: data.tier as HolderTier,
    createdAt: new Date(data.created_at).getTime(),
    parentId: data.parent_id || null,
  };

  return { success: true, comment };
}

// Delete a comment (only owner can delete)
export async function deleteUpdateComment(
  commentId: string,
  walletAddress: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  // Verify the comment belongs to this wallet
  const { data: comment } = await supabase
    .from('update_comments')
    .select('wallet_address')
    .eq('id', commentId)
    .single();

  if (!comment) {
    return { success: false, error: 'Comment not found' };
  }

  if (comment.wallet_address !== walletAddress.toLowerCase()) {
    return { success: false, error: 'Not authorized to delete this comment' };
  }

  // Delete the comment and any replies
  const { error } = await supabase
    .from('update_comments')
    .delete()
    .or(`id.eq.${commentId},parent_id.eq.${commentId}`);

  if (error) {
    console.error('Failed to delete comment:', error);
    return { success: false, error: 'Failed to delete comment' };
  }

  return { success: true };
}
