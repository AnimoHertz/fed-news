import Link from 'next/link';
import { Suspense } from 'react';
import { fetchAllRecentCommits } from '@/lib/github';
import { parseCommit, filterCommits } from '@/lib/commits';
import { CommitFilters } from '@/components/commits/CommitFilters';
import { CommitList } from '@/components/commits/CommitList';
import type { CommitCategory } from '@/types';

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{
    category?: string;
    hideStats?: string;
  }>;
}

export default async function CommitsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawCommits = await fetchAllRecentCommits(200);
  const allCommits = rawCommits.map(parseCommit);

  const category = (params.category as CommitCategory | 'all') || 'all';
  const hideStats = params.hideStats !== 'false';

  const filteredCommits = filterCommits(allCommits, { category, hideStats });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-medium hover:text-gray-300 transition-colors">
              Fed News
            </Link>
            <div className="flex gap-4 text-sm text-gray-400">
              <Link href="/manifesto" className="hover:text-white transition-colors">
                Manifesto
              </Link>
              <Link href="/docs" className="hover:text-white transition-colors">
                Docs
              </Link>
              <a
                href="https://github.com/snark-tank/ralph"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-sm text-gray-500 uppercase tracking-wide mb-6">
          All Updates
        </h1>

        {/* Filters */}
        <div className="mb-8">
          <Suspense fallback={null}>
            <CommitFilters />
          </Suspense>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-600 mb-6">
          {filteredCommits.length} commits
        </p>

        {/* List */}
        <CommitList commits={filteredCommits} />
      </main>
    </div>
  );
}
