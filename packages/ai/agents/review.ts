import { generateObject } from "ai";
import { z } from "zod";
import { openrouter } from "../index";
import { REVIEW_SYSTEM_PROMPT } from "../prompts";

export interface ReviewFinding {
  file?: string;
  severity: "Blocking" | "Major" | "Minor" | "Nit";
  category: string;
  title: string;
  explanation: string;
  suggestion: string;
}

export interface GeneratedReview {
  verdict: "APPROVE" | "COMMENT" | "REQUEST_CHANGES";
  score: number;
  scoreBreakdown: {
    correctness: number;
    security: number;
    performance: number;
    maintainability: number;
    requirements: number;
  };
  summary: string;
  findings: ReviewFinding[];
}

export type ReviewInput = {
  diff: string;
  changedFiles: string;
  prdContent?: string;
  engineeringTasks?: string;
  featureMetadata?: string;
  frameworkContext?: string;
  repoContextSnippets?: string[];
  contextSnippets?: string[];
};

function buildContextSection(content: string | string[] | undefined, title: string) {
  if (!content || (Array.isArray(content) && content.length === 0)) {
    return "";
  }
  const text = Array.isArray(content) ? content.join("\n\n---\n\n") : content;
  return `\n\n## ${title}:\n\n${text}`;
}

export class ReviewAgent {
  async review(input: ReviewInput): Promise<GeneratedReview> {
    console.log("Running ReviewAgent with full context");

    const promptContext = [
      buildContextSection(input.featureMetadata, "Feature Metadata"),
      buildContextSection(input.prdContent, "PRD (Product Requirements Document)"),
      buildContextSection(input.engineeringTasks, "Engineering Tasks"),
      buildContextSection(input.changedFiles, "Changed Files"),
      buildContextSection(input.repoContextSnippets, "Repository Context (Neighbor Files)"),
      buildContextSection(input.contextSnippets, "PR Context Snippets"),
      buildContextSection(input.frameworkContext, "Framework & Package Info"),
      buildContextSection(input.diff, "Code Diff (The changes to review)")
    ].join("");

    const { object } = await generateObject({
      model: openrouter(process.env.REVIEW_MODEL || process.env.AI_MODEL || "anthropic/claude-3-haiku"),
      system: REVIEW_SYSTEM_PROMPT,
      prompt: promptContext,
      schema: z.object({
        verdict: z.enum(["APPROVE", "COMMENT", "REQUEST_CHANGES"]),
        score: z.number().min(0).max(100),
        scoreBreakdown: z.object({
          correctness: z.number().min(0).max(100),
          security: z.number().min(0).max(100),
          performance: z.number().min(0).max(100),
          maintainability: z.number().min(0).max(100),
          requirements: z.number().min(0).max(100),
        }),
        summary: z.string(),
        findings: z.array(
          z.object({
            file: z.string().optional(),
            severity: z.enum(["Blocking", "Major", "Minor", "Nit"]),
            category: z.string(),
            title: z.string(),
            explanation: z.string(),
            suggestion: z.string(),
          })
        ),
      }),
    });

    return object;
  }
}
