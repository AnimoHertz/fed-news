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

function ProfileContent() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
        const response = await fetch(`/api/chat/profile?wallet=${targetWallet}`);
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetWallet]);

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
            {/* Identity Card */}
            <div className="p-4 sm:p-6 rounded-lg border border-gray-800 bg-gray-900/30">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {profile.username}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 font-mono mt-1">
                    {formatAddress(profile.walletAddress)}
                  </p>
                </div>
                <div className="shrink-0">
                  <TierBadge tier={profile.tier} balance={profile.balance} showBalance={false} />
                </div>
              </div>
            </div>

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
