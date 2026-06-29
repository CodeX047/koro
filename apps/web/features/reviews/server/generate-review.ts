import { generateText } from "ai";
import { openrouter, REVIEW_SYSTEM_PROMPT } from "@repo/ai";

const REVIEW_MODEL = "openrouter/free";

type ReviewInput = {
  repoFullName: string;
  title: string;
  diff: string;
};

function buildRepoContextSection(repoContextSnippets: string[]) {
  if (repoContextSnippets.length === 0) {
    return "";
  }

  const repoContext = repoContextSnippets.join("\n\n---\n\n");

  return `

Related code from the repository (for context only, not part of the change):

${repoContext}`;
}

export async function generateReview(input: ReviewInput) {
  const { text } = await generateText({
    model: openrouter(REVIEW_MODEL),
    system: REVIEW_SYSTEM_PROMPT,
    prompt: `Repository: ${input.repoFullName}
Pull request title: ${input.title}

## Changed files (unified diff)

${input.diff}${buildRepoContextSection([])}`,
  });

  return text;
}
