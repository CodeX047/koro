import { githubService } from "../github";
import type { GeneratedReview } from "@repo/ai/agents/review";

export async function submitPrReview(
    installationId: number,
    repoFullName: string,
    prNumber: number,
    review: GeneratedReview
) {
    const app = githubService.getGithubApp();
    const octokit = await app.getInstallationOctokit(installationId);
    const [owner, repo] = repoFullName.split("/") as [string, string];

    // Format the review body
    let body = `## AI Code Review (Score: ${review.score}/100)\n\n`;
    body += `${review.summary}\n\n`;
    
    body += `### Score Breakdown\n`;
    body += `- **Correctness:** ${review.scoreBreakdown.correctness}/100\n`;
    body += `- **Requirements:** ${review.scoreBreakdown.requirements}/100\n`;
    body += `- **Security:** ${review.scoreBreakdown.security}/100\n`;
    body += `- **Performance:** ${review.scoreBreakdown.performance}/100\n`;
    body += `- **Maintainability:** ${review.scoreBreakdown.maintainability}/100\n\n`;

    if (review.findings.length > 0) {
        body += `### Findings\n\n`;
        const grouped = review.findings.reduce((acc, finding) => {
            const severity = finding.severity;
            if (!acc[severity]) acc[severity] = [];
            acc[severity].push(finding);
            return acc;
        }, {} as Record<string, typeof review.findings>);

        const order = ["Blocking", "Major", "Minor", "Nit"];
        for (const severity of order) {
            if (grouped[severity]) {
                body += `#### ${severity}\n`;
                for (const finding of grouped[severity]) {
                    body += `- **${finding.title}** (${finding.category})`;
                    if (finding.file) body += ` in \`${finding.file}\``;
                    body += `\n  - ${finding.explanation}\n  - *Suggestion:* ${finding.suggestion}\n`;
                }
                body += "\n";
            }
        }
    } else {
        body += `### Findings\n\nNo issues found! Great job. 🎉\n`;
    }

    const event = review.verdict;

    await octokit.request("POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews", {
        owner,
        repo,
        pull_number: prNumber,
        body,
        event
    });
}
