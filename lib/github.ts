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
