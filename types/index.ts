export type CommitCategory =
  | 'stats'
  | 'website'
  | 'research'
  | 'ops'
  | 'twitter'
  | 'docs'
  | 'other';

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
  author?: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface ParsedCommit {
  sha: string;
  shortSha: string;
  message: string;
  title: string;
  body: string;
  category: CommitCategory;
  author: string;
  authorLogin?: string;
  authorAvatar?: string;
  date: Date;
  url: string;
  stats?: {
    distributed: number;
    distributions: number;
    holders?: number;
  };
}

export interface DocFile {
  name: string;
  path: string;
  slug: string;
  title: string;
  description: string;
}
