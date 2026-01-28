'use client';

import { Suspense, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WalletButton } from '@/components/chat/WalletButton';
import { TierBadge } from '@/components/chat/TierBadge';
import { UserProfile } from '@/types/chat';
import { getTierInfo } from '@/lib/token';
import { ShapeCharacter, CharacterProps } from '@/components/characters/ShapeCharacter';
import { AchievementGrid } from '@/components/achievements/AchievementCard';

interface ProfileNft {
  id: string;
  traitHash: string;
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
  rarityScore: number;
  rarityTier: string;
  createdAt?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'minting' | 'collection' | 'forum' | 'holder' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementsData {
  achievements: Achievement[];
  stats: { total: number; unlocked: number; points: number };
}

function ProfileContent() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileNft, setProfileNft] = useState<ProfileNft | null>(null);
  const [ownedAgents, setOwnedAgents] = useState<ProfileNft[]>([]);
  const [showNftSelector, setShowNftSelector] = useState(false);
  const [savingNft, setSavingNft] = useState(false);
  const [achievements, setAchievements] = useState<AchievementsData | null>(null);

  const connectedWallet = publicKey?.toBase58() || null;
  // Use query param wallet if provided, otherwise use connected wallet
  const targetWallet = searchParams.get('wallet') || connectedWallet;
  const isOwnProfile = connectedWallet && targetWallet?.toLowerCase() === connectedWallet.toLowerCase();

  useEffect(() => {
    if (!targetWallet) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const [profileRes, nftRes, achievementsRes] = await Promise.all([
          fetch(`/api/chat/profile?wallet=${targetWallet}`),
          fetch(`/api/chat/profile-nft?wallet=${targetWallet}`),
          fetch(`/api/achievements?wallet=${targetWallet}`),
        ]);

        const profileData = await profileRes.json();
        setProfile(profileData);

        const nftData = await nftRes.json();
        setProfileNft(nftData.profileNft || null);
        setOwnedAgents(nftData.ownedAgents || []);

        if (achievementsRes.ok) {
          const achievementsData = await achievementsRes.json();
          setAchievements(achievementsData);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetWallet]);

  const handleSelectNft = async (nftId: string | null) => {
    if (!connectedWallet) return;

    setSavingNft(true);
    try {
      const response = await fetch('/api/chat/profile-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: connectedWallet,
          nftId,
        }),
      });

      if (response.ok) {
        // Update local state
        if (nftId) {
          const selectedNft = ownedAgents.find(a => a.id === nftId);
          setProfileNft(selectedNft || null);
        } else {
          setProfileNft(null);
        }
        setShowNftSelector(false);
      }
    } catch (error) {
      console.error('Failed to set profile NFT:', error);
    } finally {
      setSavingNft(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const tierInfo = profile ? getTierInfo(profile.tier) : null;
  const isUnknownUser = profile && !profile.username;

  // Fake Satoshi profile for unknown users
  const satoshiProfile = {
    username: 'satoshi',
    walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    role: 'The Creator',
    balance: 1000000,
    posts: 1,
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-16">
        {/* Title */}
        <section className="mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide mb-2 sm:mb-4">Account</p>
          <h1 className="text-xl sm:text-3xl font-medium mb-2">
            {isOwnProfile ? 'Your Profile' : 'User Profile'}
          </h1>
        </section>

        {/* Not Connected State (only show if no target wallet) */}
        {!targetWallet && !loading && (
          <div className="p-8 rounded-lg border border-gray-800 bg-gray-900/30 text-center space-y-4">
            <p className="text-gray-400">Connect your wallet to view your profile.</p>
            <WalletButton />
          </div>
        )}

        {/* Loading State */}
        {loading && targetWallet && (
          <div className="p-8 rounded-lg border border-gray-800 bg-gray-900/30 text-center">
            <p className="text-gray-400">Loading profile...</p>
          </div>
        )}

        {/* Unknown User - Show Satoshi */}
        {!loading && isUnknownUser && (
          <div className="space-y-4 sm:space-y-6">
            {/* Identity Card */}
            <div className="p-4 sm:p-6 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xl sm:text-2xl font-bold text-yellow-400">
                    {satoshiProfile.username}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 font-mono mt-1 truncate">
                    {satoshiProfile.walletAddress}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shrink-0">
                  Legend
                </span>
              </div>
            </div>

            {/* Role */}
            <div className="p-4 sm:p-5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 sm:mb-2">Role</p>
              <p className="text-xl sm:text-2xl font-semibold text-yellow-400">
                {satoshiProfile.role}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-lg border border-gray-800 bg-gray-900/30">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 sm:mb-2">BTC Balance</p>
                <p className="text-lg sm:text-2xl font-mono text-white">
                  {satoshiProfile.balance.toLocaleString()}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-lg border border-gray-800 bg-gray-900/30">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 sm:mb-2">Whitepapers</p>
                <p className="text-lg sm:text-2xl font-mono text-white">
                  {satoshiProfile.posts}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 italic text-center px-2">
              &quot;If you don&apos;t believe me or don&apos;t get it, I don&apos;t have time to try to convince you, sorry.&quot;
            </p>

            {/* Actions */}
            <div className="pt-4">
              <button
                onClick={() => router.push('/forum')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                &larr; Back to Forum
              </button>
            </div>
          </div>
        )}

        {/* Profile Content */}
        {!loading && profile && !isUnknownUser && tierInfo && (
          <div className="space-y-4 sm:space-y-6">
            {/* Identity Card with NFT */}
            <div className="p-4 sm:p-6 rounded-lg border border-gray-800 bg-gray-900/30">
              <div className="flex items-start gap-4">
                {/* Profile Picture / NFT */}
                <div className="relative shrink-0">
                  {profileNft ? (
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden border-2 border-gray-700">
                      <ShapeCharacter
                        headStyle={profileNft.traits.headStyle as CharacterProps['headStyle']}
                        eyeStyle={profileNft.traits.eyeStyle as CharacterProps['eyeStyle']}
                        mouthStyle={profileNft.traits.mouthStyle as CharacterProps['mouthStyle']}
                        bodyStyle={profileNft.traits.bodyStyle as CharacterProps['bodyStyle']}
                        feetStyle={profileNft.traits.feetStyle as CharacterProps['feetStyle']}
                        accessory={profileNft.traits.accessory as CharacterProps['accessory']}
                        bgStyle={profileNft.traits.bgStyle as CharacterProps['bgStyle']}
                        primaryColor={profileNft.traits.primaryColor}
                        secondaryColor={profileNft.traits.secondaryColor || undefined}
                        accentColor={profileNft.traits.accentColor}
                        size={96}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  {isOwnProfile && ownedAgents.length > 0 && (
                    <button
                      onClick={() => setShowNftSelector(true)}
                      className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
                      title="Change profile picture"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold text-white truncate">
                        {profile.username}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 font-mono mt-1">
                        {formatAddress(profile.walletAddress)}
                      </p>
                      {profileNft && (
                        <p className="text-xs text-gray-600 mt-1">
                          {profileNft.rarityTier} Agent
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <TierBadge tier={profile.tier} balance={profile.balance} showBalance={false} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NFT Selector Modal */}
            {showNftSelector && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                <div className="w-full max-w-lg bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Select Profile Picture</h3>
                    <button
                      onClick={() => setShowNftSelector(false)}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {/* No NFT option */}
                      <button
                        onClick={() => handleSelectNft(null)}
                        disabled={savingNft}
                        className={`relative aspect-[3/4] rounded-lg border-2 transition-all ${
                          !profileNft
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                        }`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="absolute bottom-1 inset-x-1 text-xs text-gray-500 text-center">Default</span>
                      </button>

                      {/* Owned NFTs */}
                      {ownedAgents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => handleSelectNft(agent.id)}
                          disabled={savingNft}
                          className={`relative aspect-[3/4] rounded-lg border-2 overflow-hidden transition-all ${
                            profileNft?.id === agent.id
                              ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <ShapeCharacter
                            headStyle={agent.traits.headStyle as CharacterProps['headStyle']}
                            eyeStyle={agent.traits.eyeStyle as CharacterProps['eyeStyle']}
                            mouthStyle={agent.traits.mouthStyle as CharacterProps['mouthStyle']}
                            bodyStyle={agent.traits.bodyStyle as CharacterProps['bodyStyle']}
                            feetStyle={agent.traits.feetStyle as CharacterProps['feetStyle']}
                            accessory={agent.traits.accessory as CharacterProps['accessory']}
                            bgStyle={agent.traits.bgStyle as CharacterProps['bgStyle']}
                            primaryColor={agent.traits.primaryColor}
                            secondaryColor={agent.traits.secondaryColor || undefined}
                            accentColor={agent.traits.accentColor}
                            size={100}
                          />
                          {profileNft?.id === agent.id && (
                            <div className="absolute top-1 right-1 p-0.5 rounded-full bg-emerald-500">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {ownedAgents.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-2">You don&apos;t own any agents yet.</p>
                        <button
                          onClick={() => router.push('/agents')}
                          className="text-sm text-emerald-400 hover:text-emerald-300"
                        >
                          Mint your first agent &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                  {savingNft && (
                    <div className="p-3 bg-gray-800/50 border-t border-gray-800">
                      <p className="text-sm text-gray-400 text-center">Saving...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Role */}
            <div className={`p-4 sm:p-5 rounded-lg ${tierInfo.bgColor} border ${tierInfo.borderColor}`}>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 sm:mb-2">Role</p>
              <p className={`text-xl sm:text-2xl font-semibold ${tierInfo.color}`}>
                {tierInfo.name}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Token Balance */}
              <div className="p-4 sm:p-5 rounded-lg border border-gray-800 bg-gray-900/30">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 sm:mb-2">$FED Balance</p>
                <p className="text-lg sm:text-2xl font-mono text-white">
                  {profile.balance.toLocaleString()}
                </p>
              </div>

              {/* Comment Count */}
              <div className="p-4 sm:p-5 rounded-lg border border-gray-800 bg-gray-900/30">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 sm:mb-2">Forum Posts</p>
                <p className="text-lg sm:text-2xl font-mono text-white">
                  {profile.commentCount?.toLocaleString() ?? 0}
                </p>
              </div>
            </div>

            {/* Achievements Section */}
            {achievements && achievements.stats.unlocked > 0 && (
              <div className="p-4 sm:p-5 rounded-lg border border-gray-800 bg-gray-900/30">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Achievements ({achievements.stats.unlocked}/{achievements.stats.total})
                  </p>
                  <span className="text-xs text-emerald-400 font-mono">{achievements.stats.points} pts</span>
                </div>
                <AchievementGrid
                  achievements={achievements.achievements.filter(a => a.unlocked).slice(0, 4)}
                  compact
                />
                {achievements.stats.unlocked > 4 && (
                  <button
                    onClick={() => router.push(`/achievements?wallet=${targetWallet}`)}
                    className="mt-3 text-sm text-gray-400 hover:text-white w-full text-center"
                  >
                    View all {achievements.stats.unlocked} achievements &rarr;
                  </button>
                )}
              </div>
            )}

            {/* Minted Agents Section */}
            {isOwnProfile && ownedAgents.length > 0 && (
              <div className="p-4 sm:p-5 rounded-lg border border-gray-800 bg-gray-900/30">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Your Agents ({ownedAgents.length})</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {ownedAgents.slice(0, 6).map((agent) => (
                    <div
                      key={agent.id}
                      className="aspect-[3/4] rounded-lg overflow-hidden border border-gray-700"
                    >
                      <ShapeCharacter
                        headStyle={agent.traits.headStyle as CharacterProps['headStyle']}
                        eyeStyle={agent.traits.eyeStyle as CharacterProps['eyeStyle']}
                        mouthStyle={agent.traits.mouthStyle as CharacterProps['mouthStyle']}
                        bodyStyle={agent.traits.bodyStyle as CharacterProps['bodyStyle']}
                        feetStyle={agent.traits.feetStyle as CharacterProps['feetStyle']}
                        accessory={agent.traits.accessory as CharacterProps['accessory']}
                        bgStyle={agent.traits.bgStyle as CharacterProps['bgStyle']}
                        primaryColor={agent.traits.primaryColor}
                        secondaryColor={agent.traits.secondaryColor || undefined}
                        accentColor={agent.traits.accentColor}
                        size={80}
                      />
                    </div>
                  ))}
                </div>
                {ownedAgents.length > 6 && (
                  <button
                    onClick={() => router.push('/agents')}
                    className="mt-3 text-sm text-gray-400 hover:text-white"
                  >
                    View all {ownedAgents.length} agents &rarr;
                  </button>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-4">
              <button
                onClick={() => router.push('/forum')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                &larr; Back to Forum
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8 sm:py-16">
          <div className="p-8 rounded-lg border border-gray-800 bg-gray-900/30 text-center">
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
