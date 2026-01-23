'use client';

import { useEffect } from 'react';
import type { ParsedCommit } from '@/types';
import { formatDateTime } from '@/lib/utils';

interface CommitModalProps {
  commit: ParsedCommit | null;
  onClose: () => void;
}

const CATEGORY_INFO: Record<string, { why: string }> = {
  website: {
    why: 'Improves the user experience and interface of fed.markets',
  },
  research: {
    why: 'Informs strategy and optimization of the distribution system',
  },
  ops: {
    why: 'Directly affects token supply and holder rewards',
  },
  stats: {
    why: 'Tracks distribution progress toward QE milestones',
  },
  docs: {
    why: 'Helps the community understand how the system works',
  },
  twitter: {
    why: 'Grows awareness and community engagement',
  },
  other: {
    why: 'General improvements to the project',
  },
};

function generateTLDR(commit: ParsedCommit): string {
  const title = commit.title.toLowerCase();

  // Stats update
  if (commit.category === 'stats' && commit.stats) {
    return `Distribution milestone: $${commit.stats.distributed.toLocaleString()} USD1 has been distributed across ${commit.stats.distributions} distribution cycles.`;
  }

  // Research
  if (commit.category === 'research') {
    return `New research update analyzing market conditions, tokenomics, or strategy improvements for the $FED ecosystem.`;
  }

  // Website
  if (commit.category === 'website') {
    if (title.includes('polish') || title.includes('cosmetic')) {
      return 'Visual refinements to improve the look and feel of the website.';
    }
    if (title.includes('seo') || title.includes('metadata')) {
      return 'Improvements to help more people discover $FED through search engines.';
    }
    if (title.includes('background') || title.includes('effect')) {
      return 'Enhanced visual effects to make the website more engaging.';
    }
    return 'Updates to the fed.markets website improving functionality or appearance.';
  }

  // Ops
  if (commit.category === 'ops') {
    if (title.includes('buyback')) {
      return 'Buyback operation reducing circulating supply and supporting token price.';
    }
    if (title.includes('burn')) {
      return 'Token burn permanently removing supply from circulation.';
    }
    return 'Operational update affecting the distribution or token mechanics.';
  }

  // Docs
  if (commit.category === 'docs') {
    return 'Documentation update helping users understand the $FED system better.';
  }

  // Twitter
  if (commit.category === 'twitter') {
    return 'Social media activity to grow community awareness and engagement.';
  }

  return 'Development update improving the $FED ecosystem.';
}

export function CommitModal({ commit, onClose }: CommitModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!commit) return null;

  const categoryInfo = CATEGORY_INFO[commit.category] || CATEGORY_INFO.other;
  const tldr = generateTLDR(commit);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <span className={`text-sm font-mono ${getCategoryColor(commit.category)}`}>
            {commit.category}
          </span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h2 className="text-lg font-medium text-white mb-4">
          {commit.title}
        </h2>

        {/* TLDR */}
        <div className="mb-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">TL;DR</h3>
          <p className="text-gray-300">{tldr}</p>
        </div>

        {/* Why it matters */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">Why it matters</h3>
          <p className="text-gray-400">{categoryInfo.why}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-800">
          <span>{commit.author}</span>
          <span>{formatDateTime(commit.date)}</span>
        </div>

        {/* View on GitHub */}
        <a
          href={commit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-4 text-center py-2 text-sm text-gray-400 hover:text-white border border-gray-800 rounded transition-colors"
        >
          View on GitHub →
        </a>
      </div>
    </div>
  );
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    website: 'text-purple-400',
    research: 'text-amber-400',
    ops: 'text-red-400',
    stats: 'text-blue-400',
    docs: 'text-emerald-400',
    twitter: 'text-sky-400',
    other: 'text-gray-400',
  };
  return colors[category] || colors.other;
}
