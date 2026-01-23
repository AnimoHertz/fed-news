'use client';

import { useState } from 'react';
import type { ParsedCommit, CommitCategory } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import { CommitModal, getCategoryColor, getCategoryBorder, getOneLiner } from '@/components/ui/CommitModal';

interface CommitListProps {
  commits: ParsedCommit[];
  commentCounts?: Record<string, number>;
}

export function CommitList({ commits, commentCounts = {} }: CommitListProps) {
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
                  {commentCounts[commit.sha] > 0 && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {commentCounts[commit.sha]}
                    </span>
                  )}
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
