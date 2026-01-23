'use client';

import { useEffect } from 'react';
import type { ParsedCommit } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import { UpdateComments } from '@/components/updates/UpdateComments';

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
    return `Distribution milestone reached: A total of $${commit.stats.distributed.toLocaleString()} USD1 stablecoins have been distributed to holders across ${commit.stats.distributions} distribution cycles. The autonomous bot continues to run every 2 minutes, collecting trading fees and distributing them proportionally to all $FED holders.`;
  }

  // Research
  if (commit.category === 'research') {
    return `The AI agent has completed a new research analysis examining market conditions, tokenomics, holder behavior, or potential strategy improvements for the $FED ecosystem. These research updates help inform decisions about distribution mechanics, pool optimization, and community growth strategies.`;
  }

  // Website
  if (commit.category === 'website') {
    if (title.includes('polish') || title.includes('cosmetic')) {
      return 'Visual refinements and UI polish to improve the overall look and feel of the website. These updates make the interface more intuitive and visually appealing for users checking their distributions and project updates.';
    }
    if (title.includes('seo') || title.includes('metadata')) {
      return 'Search engine optimization improvements to help more people discover $FED through Google and other search engines. Better metadata and structured content increases organic visibility and drives new holder acquisition.';
    }
    if (title.includes('background') || title.includes('effect')) {
      return 'Enhanced visual effects and animations to make the website more engaging and memorable. These aesthetic improvements reflect the innovative nature of the project while maintaining performance.';
    }
    return 'Updates to the fed.markets website improving functionality, user experience, or appearance. These changes help holders track their distributions and stay informed about project developments.';
  }

  // Ops
  if (commit.category === 'ops') {
    if (title.includes('buyback')) {
      return 'A buyback operation has been executed, using protocol revenue to purchase $FED from the open market. This reduces circulating supply, creates buy pressure, and directly benefits existing holders by increasing their proportional ownership.';
    }
    if (title.includes('burn')) {
      return 'A token burn has been executed, permanently removing $FED from circulation. Burned tokens can never be recovered, permanently reducing total supply and increasing scarcity for remaining holders.';
    }
    return 'An operational update affecting the distribution mechanics, pool parameters, or token economics. These changes optimize the system for better holder rewards and long-term sustainability.';
  }

  // Docs
  if (commit.category === 'docs') {
    return 'Documentation has been updated to help users better understand how the $FED system works. Clear documentation is essential for onboarding new holders and ensuring the community understands the distribution mechanics.';
  }

  // Twitter
  if (commit.category === 'twitter') {
    return 'Social media activity to grow community awareness and engagement around $FED. Building a strong community presence helps attract new holders and keeps existing holders informed about project developments.';
  }

  return 'A development update improving the $FED ecosystem. The AI agent continuously works to enhance the project, whether through code improvements, infrastructure updates, or community tooling.';
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
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gray-950 border border-gray-800 rounded-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <span className={`inline-block text-sm font-mono px-2 py-0.5 rounded border ${getCategoryColor(commit.category)}`}>
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
          <span>{formatRelativeDate(commit.date)}</span>
        </div>

        {/* View on GitHub */}
        <a
          href={commit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          View commit on GitHub
        </a>

        {/* Comments Section */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <UpdateComments commitSha={commit.sha} />
        </div>
      </div>
    </div>
  );
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    website: 'text-purple-300 bg-purple-500/20 border-purple-500/30',
    research: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
    ops: 'text-red-300 bg-red-500/20 border-red-500/30',
    stats: 'text-blue-300 bg-blue-500/20 border-blue-500/30',
    docs: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30',
    twitter: 'text-sky-300 bg-sky-500/20 border-sky-500/30',
    other: 'text-gray-300 bg-gray-500/20 border-gray-500/30',
  };
  return colors[category] || colors.other;
}

export function getCategoryBorder(category: string): string {
  const borders: Record<string, string> = {
    website: 'border-l-purple-500 border-l-2',
    research: 'border-l-amber-500 border-l-2',
    ops: 'border-l-red-500 border-l-2',
    stats: 'border-l-blue-500 border-l-2',
    docs: 'border-l-emerald-500 border-l-2',
    twitter: 'border-l-sky-500 border-l-2',
    other: 'border-l-gray-500 border-l-2',
  };
  return borders[category] || borders.other;
}

export function getOneLiner(commit: ParsedCommit): string {
  // Use first line of commit body if available
  if (commit.body) {
    const firstLine = commit.body.split('\n').find((line) => line.trim().length > 0);
    if (firstLine) {
      // Clean up and truncate if needed
      const cleaned = firstLine.trim().replace(/^[-*•]\s*/, '');
      if (cleaned.length > 80) {
        return cleaned.substring(0, 77) + '...';
      }
      return cleaned;
    }
  }

  // For stats, show the actual numbers
  if (commit.category === 'stats' && commit.stats) {
    return `${commit.stats.distributions} cycles, $${commit.stats.distributed.toLocaleString()} USD1`;
  }

  // Extract specifics from title by removing the prefix
  const titleWithoutPrefix = commit.title
    .replace(/^(website|economist|ops|docs|twitter):\s*/i, '')
    .trim();

  if (titleWithoutPrefix && titleWithoutPrefix !== commit.title) {
    // Capitalize first letter
    return titleWithoutPrefix.charAt(0).toUpperCase() + titleWithoutPrefix.slice(1);
  }

  // Fallback to title itself if short enough
  if (commit.title.length <= 60) {
    return commit.title;
  }

  return commit.title.substring(0, 57) + '...';
}
