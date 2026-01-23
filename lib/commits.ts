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

function removeDateFromTitle(title: string): string {
  // Remove common date and time patterns from title
  return title
    // ISO datetime: 2024-01-15 23:05 or 2024-01-15T23:05:00
    .replace(/\s*\d{4}-\d{2}-\d{2}[T\s]\d{1,2}:\d{2}(?::\d{2})?\s*/g, ' ')
    // ISO dates: 2024-01-15
    .replace(/\s*\d{4}-\d{2}-\d{2}\s*/g, ' ')
    // US dates: 01/15/2024 or 1/15/24
    .replace(/\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*/g, ' ')
    // Parenthetical dates: (2024-01-15) or (Jan 15, 2024)
    .replace(/\s*\([^)]*\d{4}[^)]*\)\s*/g, ' ')
    // Month day, year: Jan 15, 2024 or January 15, 2024
    .replace(/\s*(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\s*/gi, ' ')
    // Day month year: 15 Jan 2024
    .replace(/\s*\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\s*/gi, ' ')
    // Time with AM/PM: 10:30 AM, 10:30AM, 10:30 am
    .replace(/\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*/g, ' ')
    // Time with "at": at 10:30, at 10:30 AM
    .replace(/\s+at\s+\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*/gi, ' ')
    // Parenthetical time: (10:30 AM) or (14:00)
    .replace(/\s*\([^)]*\d{1,2}:\d{2}[^)]*\)\s*/g, ' ')
    .trim()
    // Clean up multiple spaces
    .replace(/\s+/g, ' ');
}

export function parseCommit(commit: GitHubCommit): ParsedCommit {
  const message = commit.commit.message;
  const lines = message.split('\n');
  const rawTitle = lines[0];
  const title = removeDateFromTitle(rawTitle);
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
