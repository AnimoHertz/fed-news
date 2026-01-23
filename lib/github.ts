import type { GitHubCommit, DocFile } from '@/types';

const REPO_OWNER = 'snark-tank';
const REPO_NAME = 'ralph';
const BASE_URL = 'https://api.github.com';

async function fetchGitHub<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  // Add token if available (for higher rate limits)
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchCommits(
  page: number = 1,
  perPage: number = 100
): Promise<GitHubCommit[]> {
  return fetchGitHub<GitHubCommit[]>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/commits?page=${page}&per_page=${perPage}`
  );
}

export async function fetchAllRecentCommits(limit: number = 200): Promise<GitHubCommit[]> {
  const commits: GitHubCommit[] = [];
  let page = 1;
  const perPage = 100;

  while (commits.length < limit) {
    const batch = await fetchCommits(page, perPage);
    if (batch.length === 0) break;

    commits.push(...batch);
    page++;

    if (batch.length < perPage) break;
  }

  return commits.slice(0, limit);
}

interface GitHubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
}

export async function fetchDocsList(): Promise<DocFile[]> {
  const contents = await fetchGitHub<GitHubContent[]>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/contents/docs`
  );

  const docDescriptions: Record<string, string> = {
    'OVERVIEW.md': 'High-level overview of the $FED project and its mechanics',
    'ROADMAP.md': 'Development roadmap and upcoming features',
    'TOKENOMICS-RESEARCH.md': 'Research on token economics and distribution',
    'DECISIONS.md': 'Key decisions made during development',
    'IDEAS.md': 'Future ideas and potential features',
    'PROPOSALS.md': 'Community proposals and discussions',
    'RESEARCH.md': 'General research and findings',
    'PHASE2.md': 'Phase 2 development plans',
    'SETUP.md': 'Setup and configuration guide',
  };

  return contents
    .filter((item) => item.type === 'file' && item.name.endsWith('.md'))
    .map((item) => {
      const slug = item.name.replace('.md', '').toLowerCase();
      const title = item.name
        .replace('.md', '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      return {
        name: item.name,
        path: item.path,
        slug,
        title,
        description: docDescriptions[item.name] || `Documentation: ${title}`,
      };
    });
}

export async function fetchDocContent(filename: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/docs/${filename}`;

  const response = await fetch(url, {
    next: { revalidate: 300 }, // Revalidate docs every 5 minutes
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch doc: ${response.status}`);
  }

  return response.text();
}

export async function fetchReadme(): Promise<string> {
  const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/README.md`;

  const response = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.status}`);
  }

  return response.text();
}

export function getRepoUrl(): string {
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
}

// $FED token address on Solana
const FED_TOKEN_ADDRESS = '132STreShuLRNgkyF1QECv37yP9Cdp8JBAgnKBgKafed';

export interface TierDistribution {
  chairman: number;
  governor: number;
  director: number;
  member: number;
  citizen: number;
  total: number;
}

// Tier thresholds (in raw token units, assuming 6 decimals)
const TIER_THRESHOLDS = {
  chairman: 50_000_000 * 1e6,  // 50M
  governor: 10_000_000 * 1e6,  // 10M
  director: 1_000_000 * 1e6,   // 1M
  member: 100_000 * 1e6,       // 100K
};

export async function fetchTierDistribution(): Promise<TierDistribution | null> {
  try {
    const heliusKey = process.env.HELIUS_API;
    if (!heliusKey) {
      console.error('HELIUS_API not set');
      return null;
    }

    const distribution: TierDistribution = {
      chairman: 0,
      governor: 0,
      director: 0,
      member: 0,
      citizen: 0,
      total: 0,
    };

    let cursor: string | undefined;
    const limit = 1000;

    do {
      const params: Record<string, unknown> = {
        mint: FED_TOKEN_ADDRESS,
        limit,
        options: { showZeroBalance: false },
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await fetch(
        `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccounts',
            params,
          }),
          next: { revalidate: 300 },
        }
      );

      if (!response.ok) {
        console.error('Helius API error:', response.status);
        break;
      }

      const data = await response.json();
      const accounts = data?.result?.token_accounts || [];

      for (const account of accounts) {
        const amount = parseInt(account.amount || '0', 10);
        distribution.total++;

        if (amount >= TIER_THRESHOLDS.chairman) {
          distribution.chairman++;
        } else if (amount >= TIER_THRESHOLDS.governor) {
          distribution.governor++;
        } else if (amount >= TIER_THRESHOLDS.director) {
          distribution.director++;
        } else if (amount >= TIER_THRESHOLDS.member) {
          distribution.member++;
        } else {
          distribution.citizen++;
        }
      }

      cursor = data?.result?.cursor;
      if (accounts.length < limit) break;
    } while (cursor);

    return distribution.total > 0 ? distribution : null;
  } catch (error) {
    console.error('Failed to fetch tier distribution:', error);
    return null;
  }
}

export async function fetchHolderCount(): Promise<number | null> {
  try {
    const heliusKey = process.env.HELIUS_API;
    if (!heliusKey) {
      console.error('HELIUS_API not set');
      return null;
    }

    // Paginate through all token accounts to count holders
    let totalHolders = 0;
    let cursor: string | undefined;
    const limit = 1000;

    do {
      const params: Record<string, unknown> = {
        mint: FED_TOKEN_ADDRESS,
        limit,
        options: { showZeroBalance: false },
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await fetch(
        `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccounts',
            params,
          }),
          next: { revalidate: 300 },
        }
      );

      if (!response.ok) {
        console.error('Helius API error:', response.status);
        break;
      }

      const data = await response.json();
      const accounts = data?.result?.token_accounts || [];
      totalHolders += accounts.length;
      cursor = data?.result?.cursor;

      // Stop if we got fewer results than the limit (last page)
      if (accounts.length < limit) {
        break;
      }
    } while (cursor);

    return totalHolders > 0 ? totalHolders : null;
  } catch (error) {
    console.error('Failed to fetch holder count:', error);
    return null;
  }
}
