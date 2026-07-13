import GithubService from "../github";
import { PrFile } from "./types";

const githubService = new GithubService();

const FILES_PER_PAGE = 100;

/** Formats PR file patches into a markdown diff section for the review prompt. */
export function formatPrFilesForReview(files: PrFile[]): string {
  return files
    .map((file) => `### ${file.filePath}\n\`\`\`diff\n${file.patch}\n\`\`\``)
    .join("\n\n");
}

export async function getPullRequestFiles(
  installationId: number,
  repoFullName: string,
  prNumber: number,
): Promise<PrFile[]> {
  const app = githubService.getGithubApp();
  const octokit = await app.getInstallationOctokit(installationId);
  const [owner, repo] = repoFullName.split("/") as [string, string];

  const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/files", {
    owner,
    repo,
    pull_number: prNumber,
    per_page: FILES_PER_PAGE,
  });

  const files: PrFile[] = [];

  for (const file of data) {
    if (!file.patch) {
      continue;
    }

    // Ignore lockfiles and dependencies for AI review
    const isIgnored =
      file.filename.includes("node_modules/") ||
      file.filename.endsWith("-lock.yaml") ||
      file.filename.endsWith("-lock.json") ||
      file.filename.endsWith(".lock");

    if (isIgnored) {
      continue;
    }

    files.push({ filePath: file.filename, patch: file.patch });
  }

  return files;
}
