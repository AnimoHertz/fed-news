export type HolderTier = 'chairman' | 'governor' | 'director' | 'member' | 'citizen' | 'none';

export interface TierInfo {
  tier: HolderTier;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface ChatUser {
  walletAddress: string;
  username: string;
  createdAt: number;
}

export interface ProfileNftData {
  id: string;
  traits: {
    headStyle: string;
    eyeStyle: string;
    mouthStyle: string;
    bodyStyle: string;
    feetStyle: string;
    accessory: string;
    bgStyle: string;
    primaryColor: string;
    secondaryColor: string | null;
    accentColor: string;
    tier: string;
  };
  rarityTier: string;
}

export interface ChatMessage {
  id: string;
  walletAddress: string;
  username: string;
  content: string;
  balance: number;
  tier: HolderTier;
  createdAt: number;
  parentId?: string | null;
  replies?: ChatMessage[];
  upvotes: number;
  upvotedByUser?: boolean;
  profileNft?: ProfileNftData | null;
}

export interface UserProfile {
  walletAddress: string;
  username: string | null;
  balance: number;
  tier: HolderTier;
  commentCount?: number;
}
