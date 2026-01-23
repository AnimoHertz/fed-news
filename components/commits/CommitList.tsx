'use client';

import { useState } from 'react';
import type { ParsedCommit } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import { CommitModal, getCategoryColor } from '@/components/ui/CommitModal';

interface CommitListProps {
  commits: ParsedCommit[];
}

export function CommitList({ commits }: CommitListProps) {
  const [selectedCommit, setSelectedCommit] = useState<ParsedCommit | null>(null);

  return (
    <>
      <div className="space-y-0">
        {commits.map((commit) => (
          <button
            key={commit.sha}
            onClick={() => setSelectedCommit(commit)}
            className="w-full text-left py-4 border-b border-gray-800/50 hover:bg-gray-900/50 -mx-4 px-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-mono ${getCategoryColor(commit.category)}`}>
                  {commit.category}
                </span>
                <p className="text-gray-200 mt-1 truncate">{commit.title}</p>
              </div>
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {formatRelativeDate(commit.date)}
              </span>
            </div>
          </button>
        ))}
      </div>

      <CommitModal
        commit={selectedCommit}
        onClose={() => setSelectedCommit(null)}
      />
    </>
  );
}
