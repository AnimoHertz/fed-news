'use client';

import { useState, useEffect, Suspense } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WalletButton } from '@/components/chat/WalletButton';
import { AchievementCard } from '@/components/achievements/AchievementCard';

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

interface AchievementsResponse {
  achievements: Achievement[];
  stats: {
    total: number;
    unlocked: number;
    points: number;
  };
}

type CategoryFilter = 'all' | 'minting' | 'collection' | 'forum' | 'special';

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  minting: 'Minting',
  collection: 'Collection',
  forum: 'Forum',
  special: 'Special',
};

function AchievementsContent() {
  const { publicKey } = useWallet();
  const searchParams = useSearchParams();
  const [data, setData] = useState<AchievementsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryFilter>('all');

  const connectedWallet = publicKey?.toBase58() || null;
  const targetWallet = searchParams.get('wallet') || connectedWallet;

  useEffect(() => {
    if (!targetWallet) {
      setLoading(false);
      return;
    }

    const fetchAchievements = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/achievements?wallet=${targetWallet}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [targetWallet]);

  const filteredAchievements = data?.achievements.filter(
    a => category === 'all' || a.category === category
  ) || [];

  const unlockedFirst = [...filteredAchievements].sort((a, b) => {
    if (a.unlocked === b.unlocked) return 0;
    return a.unlocked ? -1 : 1;
  });

  const progressPercentage = data ? (data.stats.unlocked / data.stats.total) * 100 : 0;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <section className="mb-6">
          <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide mb-2">Progress</p>
          <h1 className="text-2xl sm:text-3xl font-medium mb-2">Achievements</h1>
        </section>

        {/* Not Connected State */}
        {!targetWallet && !loading && (
          <div className="p-8 rounded-lg border border-gray-800 bg-gray-900/30 text-center space-y-4">
            <p className="text-gray-400">Connect your wallet to view achievements.</p>
            <WalletButton />
          </div>
        )}

        {/* Loading State */}
        {loading && targetWallet && (
          <div className="p-8 rounded-lg border border-gray-800 bg-gray-900/30 text-center">
            <div className="flex items-center justify-center gap-3 text-gray-400">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading achievements...</span>
            </div>
          </div>
        )}

        {/* Achievements Content */}
        {data && !loading && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="p-4 sm:p-6 rounded-lg border border-gray-800 bg-gray-900/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {data.stats.unlocked} / {data.stats.total}
                  </p>
                  <p className="text-sm text-gray-500">Achievements Unlocked</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-400">
                    {data.stats.points}
                  </p>
                  <p className="text-sm text-gray-500">Total Points</p>
                </div>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {progressPercentage.toFixed(0)}% Complete
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    category === cat
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                  {cat !== 'all' && (
                    <span className="ml-1.5 text-xs opacity-60">
                      ({data.achievements.filter(a => a.category === cat && a.unlocked).length}/
                      {data.achievements.filter(a => a.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unlockedFirst.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No achievements in this category.
              </div>
            )}

            {/* Tier Legend */}
            <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Point Values</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-700"></span>
                  <span className="text-gray-400">Bronze: 10 pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                  <span className="text-gray-400">Silver: 25 pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="text-gray-400">Gold: 50 pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                  <span className="text-gray-400">Diamond: 100 pts</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="p-8 rounded-lg border border-gray-800 bg-gray-900/30 text-center">
            <p className="text-gray-400">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <AchievementsContent />
    </Suspense>
  );
}
