'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { CommitCategory } from '@/types';

const categories: { id: CommitCategory | 'all'; color: string }[] = [
  { id: 'all', color: 'text-white' },
  { id: 'website', color: 'text-purple-400' },
  { id: 'research', color: 'text-amber-400' },
  { id: 'ops', color: 'text-red-400' },
  { id: 'docs', color: 'text-emerald-400' },
  { id: 'other', color: 'text-gray-400' },
];

export function CommitFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = (searchParams.get('category') as CommitCategory | 'all') || 'all';
  const hideStats = searchParams.get('hideStats') !== 'false';

  const setFilter = (category: CommitCategory | 'all') => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`?${params.toString()}`);
  };

  const toggleStats = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (hideStats) {
      params.set('hideStats', 'false');
    } else {
      params.delete('hideStats');
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {categories.map((cat) => {
        const isActive = currentCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={cn(
              'text-sm font-mono transition-colors',
              isActive
                ? cat.color
                : 'text-gray-600 hover:text-gray-400'
            )}
          >
            {cat.id}
          </button>
        );
      })}

      <span className="text-gray-800">|</span>

      <button
        onClick={toggleStats}
        className={cn(
          'text-sm font-mono transition-colors',
          !hideStats
            ? 'text-blue-400'
            : 'text-gray-600 hover:text-gray-400'
        )}
      >
        stats
      </button>
    </div>
  );
}
