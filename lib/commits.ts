import type { GitHubCommit, ParsedCommit, CommitCategory } from '@/types';

export function categorizeCommit(message: string): CommitCategory {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.startsWith('website: update stats')) {
    return 'stats';
  }
  if (lowerMessage.startsWith('website:')) {
    return 'website';
  }
  if (lowerMessage.startsWith('economist:') || lowerMessage.includes('research')) {
    return 'research';
  }
  if (lowerMessage.startsWith('ops:') || lowerMessage.includes('buyback') || lowerMessage.includes('burn')) {
    return 'ops';
  }
  if (lowerMessage.startsWith('twitter:')) {
    return 'twitter';
  }
  if (lowerMessage.startsWith('docs:') || lowerMessage.includes('documentation')) {
    return 'docs';
  }

  return 'other';
}

export function extractStats(message: string): { distributed: number; distributions: number } | undefined {
  // Pattern: "website: update stats ($59,707 distributed, 579 distributions)"
  const match = message.match(/\$([0-9,]+)\s+distributed,\s+(\d+)\s+distributions/i);

  if (match) {
    return {
      distributed: parseFloat(match[1].replace(/,/g, '')),
      distributions: parseInt(match[2], 10),
    };
  }

  return undefined;
}

export function parseCommit(commit: GitHubCommit): ParsedCommit {
  const message = commit.commit.message;
  const lines = message.split('\n');
  const title = lines[0];
  const body = lines.slice(1).join('\n').trim();

  return {
    sha: commit.sha,
    shortSha: commit.sha.substring(0, 7),
    message,
    title,
    body,
    category: categorizeCommit(message),
    author: commit.commit.author.name,
    authorLogin: commit.author?.login,
    authorAvatar: commit.author?.avatar_url,
    date: new Date(commit.commit.author.date),
    url: commit.html_url,
    stats: extractStats(message),
  };
}

export function filterCommits(
  commits: ParsedCommit[],
  options: {
    category?: CommitCategory | 'all';
    hideStats?: boolean;
  } = {}
): ParsedCommit[] {
  const { category = 'all', hideStats = true } = options;

  return commits.filter((commit) => {
    // Filter by category
    if (category !== 'all' && commit.category !== category) {
      return false;
    }

    // Hide stats updates if requested
    if (hideStats && commit.category === 'stats') {
      return false;
    }

    return true;
  });
}

export function getLatestStats(commits: ParsedCommit[]): ParsedCommit['stats'] {
  const statsCommit = commits.find((c) => c.category === 'stats' && c.stats);
  return statsCommit?.stats;
}
