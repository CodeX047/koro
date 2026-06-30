import { generateText } from "ai";
import { openrouter, REVIEW_SYSTEM_PROMPT } from "@repo/ai";

const REVIEW_MODEL = "openrouter/free";

type ReviewInput = {
  repoFullName: string;
  title: string;
  diff: string;
  contextSnippets?: string[];
  repoContextSnippets?: string[];
};

function buildContextSection(snippets: string[] | undefined, title: string) {
  if (!snippets || snippets.length === 0) {
    return "";
  }
  const context = snippets.join("\n\n---\n\n");
  return `\n\n${title}:\n\n${context}`;
}

export async function generateReview(input: ReviewInput) {
  const repoContext = buildContextSection(input.repoContextSnippets, "Related code from the repository (for context only, not part of the change)");
  const prContext = buildContextSection(input.contextSnippets, "Specific PR chunks related to title");

  const { text } = await generateText({
    model: openrouter(REVIEW_MODEL),
    system: REVIEW_SYSTEM_PROMPT,
    prompt: `Repository: ${input.repoFullName}
Pull request title: ${input.title}

## Changed files (unified diff)

${input.diff}${repoContext}${prContext}`,
  });

  return text;
}
