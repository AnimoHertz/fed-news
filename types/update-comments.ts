import { HolderTier } from './chat';

export interface UpdateComment {
  id: string;
  commitSha: string;
  walletAddress: string;
  username: string;
  content: string;
  balance: number;
  tier: HolderTier;
  createdAt: number;
  parentId?: string | null;
  replies?: UpdateComment[];
}
