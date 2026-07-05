import { githubService } from "~/features/github/utils/service";

export type GithubRepo = {
  id: string;
  name: string;
  fullName: string;
  visibility: "public" | "private";
  defaultBranch: string;
  updatedAt: string;
  language: string | null;
  stars: number;
};

function getRepoVisibility(isPrivate?: boolean): GithubRepo["visibility"] {
  if (isPrivate) {
    return "private";
  }
  return "public";
}

export type InstallationReposPage = {
  repos: GithubRepo[];
  totalCount: number;
  page: number;
  hasMore: boolean;
};

function mapRepo(repo: {
  id: number;
  name: string;
  full_name: string;
  private?: boolean;
  default_branch?: string;
  updated_at?: string | null;
  language?: string | null;
  stargazers_count?: number | null;
}): GithubRepo {
  return {
    id: String(repo.id),
    name: repo.name,
    fullName: repo.full_name,
    visibility: getRepoVisibility(repo.private),
    defaultBranch: repo.default_branch ?? "main",
    updatedAt: repo.updated_at ?? new Date().toISOString(),
    language: repo.language ?? null,
    stars: repo.stargazers_count ?? 0,
  };
}

const REPOS_PER_PAGE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: InstallationReposPage;
  timestamp: number;
}

const reposCache = new Map<string, CacheEntry>();

export async function getInstallationReposPage(
  installationId: number,
  page = 1
): Promise<InstallationReposPage> {
  const cacheKey = `${installationId}-${page}`;
  const cached = reposCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const app = githubService.getGithubApp();
  const octokit = await app.getInstallationOctokit(installationId);
  const { data } = await octokit.request("GET /installation/repositories", {
    per_page: REPOS_PER_PAGE,
    page,
  });

  const totalCount = data.total_count;
  const repos = data.repositories.map(mapRepo);

  const result: InstallationReposPage = {
    repos,
    totalCount,
    page,
    hasMore: page * REPOS_PER_PAGE < totalCount,
  };

  reposCache.set(cacheKey, { data: result, timestamp: now });
  return result;
}
