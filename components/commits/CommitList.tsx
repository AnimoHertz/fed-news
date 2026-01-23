'use client';

import { useState } from 'react';
import type { ParsedCommit, CommitCategory } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import { CommitModal, getCategoryColor, getCategoryBorder, getOneLiner } from '@/components/ui/CommitModal';

interface CommitListProps {
  commits: ParsedCommit[];
}

export function CommitList({ commits }: CommitListProps) {
  const [selectedCommit, setSelectedCommit] = useState<ParsedCommit | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const allCategories: CommitCategory[] = ['research', 'website', 'ops', 'docs', 'twitter', 'other'];

  const categoriesInCommits = allCategories.filter((cat) =>
    commits.some((c) => c.category === cat)
  );

  const filteredCommits = filterCategory
    ? commits.filter((c) => c.category === filterCategory)
    : commits;

  const handleTagClick = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    setFilterCategory(filterCategory === category ? null : category);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterCategory(null)}
          className={`text-xs font-mono px-3 py-1 rounded border transition-all ${
            filterCategory === null
              ? 'text-white bg-white/10 border-white/30'
              : 'text-gray-400 bg-transparent border-gray-700 hover:border-gray-500'
          }`}
        >
          all
        </button>
        {categoriesInCommits.map((category) => (
          <button
            key={category}
            onClick={() => setFilterCategory(filterCategory === category ? null : category)}
            className={`text-xs font-mono px-3 py-1 rounded border transition-all ${
              filterCategory === category
                ? getCategoryColor(category)
                : 'text-gray-400 bg-transparent border-gray-700 hover:border-gray-500'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredCommits.map((commit) => (
          <button
            key={commit.sha}
            onClick={() => setSelectedCommit(commit)}
            className={`w-full text-left p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:bg-gray-900/70 hover:border-gray-700 transition-all ${getCategoryBorder(commit.category)}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    onClick={(e) => handleTagClick(e, commit.category)}
                    className={`inline-block text-xs font-mono px-2 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity ${getCategoryColor(commit.category)}`}
                  >
                    {commit.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatRelativeDate(commit.date)}
                  </span>
                </div>
                <p className="text-gray-200 mt-2">{commit.title}</p>
                <p className="text-sm text-gray-500 mt-1">{getOneLiner(commit)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredCommits.length === 0 && (
        <p className="text-gray-500 text-center py-8">No updates in this category.</p>
      )}

      <CommitModal
        commit={selectedCommit}
        onClose={() => setSelectedCommit(null)}
      />
    </>
  );
}
