'use client';

import { useState } from 'react';
import type { ParsedCommit, CommitCategory } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import { CommitModal, getCategoryColor, getCategoryBorder, getOneLiner } from '@/components/ui/CommitModal';

interface CommitListProps {
  commits: ParsedCommit[];
  commentCounts?: Record<string, number>;
}

// Category icons
function getCategoryIcon(category: CommitCategory) {
  switch (category) {
    case 'research':
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      );
    case 'website':
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      );
    case 'ops':
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'docs':
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    default:
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
        </svg>
      );
  }
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
          className={`inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded border transition-all hover:scale-105 active:scale-95 ${
            filterCategory === null
              ? 'text-white bg-white/10 border-white/30'
              : 'text-gray-400 bg-transparent border-gray-700 hover:border-gray-500'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          all
        </button>
        {categoriesInCommits.map((category) => (
          <button
            key={category}
            onClick={() => setFilterCategory(filterCategory === category ? null : category)}
            className={`inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded border transition-all hover:scale-105 active:scale-95 ${
              filterCategory === category
                ? getCategoryColor(category)
                : 'text-gray-400 bg-transparent border-gray-700 hover:border-gray-500'
            }`}
          >
            {getCategoryIcon(category)}
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredCommits.map((commit, index) => (
          <button
            key={commit.sha}
            onClick={() => setSelectedCommit(commit)}
            className={`w-full text-left p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:bg-gray-900/70 hover:border-gray-700 transition-all hover:scale-[1.01] active:scale-[0.99] opacity-0 animate-fade-in-up ${getCategoryBorder(commit.category)}`}
            style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    onClick={(e) => handleTagClick(e, commit.category)}
                    className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-all hover:scale-105 ${getCategoryColor(commit.category)}`}
                  >
                    {getCategoryIcon(commit.category)}
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
