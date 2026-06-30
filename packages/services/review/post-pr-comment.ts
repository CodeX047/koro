import GithubService from "../github";
const githubService = new GithubService();

export async function postPrComment(
    installationId: number,
    repoFullName: string,
    prNumber: number,
    body: string
) {
    const app = githubService.getGithubApp();
    const octokit = await app.getInstallationOctokit(installationId);
    const [owner, repo] = repoFullName.split("/") as [string, string];

    await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
        owner,
        repo,
        issue_number: prNumber,
        body,
    });
}
