import { generateObject } from "ai";
import { z } from "zod";
import { openrouter } from "../index";
import { REVIEW_SYSTEM_PROMPT } from "../prompts";

export interface ReviewIssue {
  severity: "blocking" | "non-blocking";
  title: string;
  description: string;
  suggestion: string;
}

export interface GeneratedReview {
  score: number;
  verdict: "pass" | "fix_required";
  summary: string;
  issues: ReviewIssue[];
}

export class ReviewAgent {
  async review(diff: string, prdContent: string): Promise<GeneratedReview> {
    console.log("Running ReviewAgent on PR diff");

    const { object } = await generateObject({
      model: openrouter(process.env.AI_MODEL || "anthropic/claude-3-haiku"),
      system: REVIEW_SYSTEM_PROMPT,
      prompt: `PRD Content:\n${prdContent}\n\nDiff:\n${diff}`,
      schema: z.object({
        score: z.number().min(0).max(100),
        verdict: z.enum(["pass", "fix_required"]),
        summary: z.string(),
        issues: z.array(
          z.object({
            severity: z.enum(["blocking", "non-blocking"]),
            title: z.string(),
            description: z.string(),
            suggestion: z.string(),
          }),
        ),
      }),
    });

    return object;
  }
}
