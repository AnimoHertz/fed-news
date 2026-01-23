import { Suspense } from 'react';
import { fetchAllRecentCommits } from '@/lib/github';
import { parseCommit, filterCommits } from '@/lib/commits';
import { getCommentCounts } from '@/lib/update-comments';
import { CommitFilters } from '@/components/commits/CommitFilters';
import { CommitList } from '@/components/commits/CommitList';
import { Header } from '@/components/layout/Header';
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

  // Fetch comment counts for displayed commits
  const commentCounts = await getCommentCounts(filteredCommits.map(c => c.sha));

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-12">
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
        <CommitList commits={filteredCommits} commentCounts={commentCounts} />
      </main>
    </div>
  );
}
