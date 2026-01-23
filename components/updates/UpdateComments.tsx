'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { UpdateComment as UpdateCommentType } from '@/types/update-comments';
import { UserProfile } from '@/types/chat';
import { WalletButton } from '@/components/chat/WalletButton';
import { UsernameSetup } from '@/components/chat/UsernameSetup';
import { TierBadge } from '@/components/chat/TierBadge';
import { UpdateComment } from './UpdateComment';
import { UpdateCommentInput } from './UpdateCommentInput';

interface UpdateCommentsProps {
  commitSha: string;
}

export function UpdateComments({ commitSha }: UpdateCommentsProps) {
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [comments, setComments] = useState<UpdateCommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);

  const walletAddress = publicKey?.toBase58() || null;

  // Organize comments into threads
  const threadedComments = useMemo(() => {
    const topLevel: UpdateCommentType[] = [];
    const repliesMap: Map<string, UpdateCommentType[]> = new Map();

    // First pass: separate top-level and replies
    for (const comment of comments) {
      if (comment.parentId) {
        const existing = repliesMap.get(comment.parentId) || [];
        existing.push(comment);
        repliesMap.set(comment.parentId, existing);
      } else {
        topLevel.push(comment);
      }
    }

    // Second pass: attach replies to their parents
    return topLevel.map((comment) => ({
      ...comment,
      replies: (repliesMap.get(comment.id) || []).sort((a, b) => a.createdAt - b.createdAt),
    }));
  }, [comments]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/updates/comments?commitSha=${commitSha}&limit=50`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }, [commitSha]);

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
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUsernameSet = (username: string) => {
    if (profile) {
      setProfile({ ...profile, username });
    }
    setEditingUsername(false);
  };

  const handleCommentSent = (comment: UpdateCommentType) => {
    setComments((prev) => [comment, ...prev]);
    setReplyingTo(null);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
  };

  const handleReply = (parentId: string) => {
    const parent = comments.find((c) => c.id === parentId);
    if (parent) {
      setReplyingTo({ id: parentId, username: parent.username });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-white">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
        {profile && profile.username && !editingUsername && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{profile.username}</span>
            <TierBadge tier={profile.tier} balance={profile.balance} />
          </div>
        )}
      </div>

      {/* Wallet connection / Username setup */}
      {!walletAddress && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 bg-gray-900/30">
          <WalletButton />
          <span className="text-sm text-gray-400">Connect wallet to comment</span>
        </div>
      )}

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
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Comment input */}
      {walletAddress && profile?.username && !editingUsername && (
        <UpdateCommentInput
          commitSha={commitSha}
          walletAddress={walletAddress}
          onCommentSent={handleCommentSent}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      )}

      {/* Comments list */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-4">Loading comments...</p>
        ) : threadedComments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
        ) : (
          threadedComments.map((comment) => (
            <UpdateComment
              key={comment.id}
              comment={comment}
              currentWallet={walletAddress}
              onDelete={handleCommentDeleted}
              onReply={handleReply}
            />
          ))
        )}
      </div>
    </div>
  );
}
