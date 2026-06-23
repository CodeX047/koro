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
    // In production, call the AI SDK using REVIEW_SYSTEM_PROMPT
    return {
      score: 85,
      verdict: "fix_required",
      summary: "The code matches the goals but contains some missing type safety and an unhandled edge case.",
      issues: [
        {
          severity: "blocking",
          title: "Missing input validation",
          description: "No validation is performed on the request payload, which could lead to DB crashes.",
          suggestion: "Integrate Zod schema validation inside the route handler."
        },
        {
          severity: "non-blocking",
          title: "Optimise loop performance",
          description: "Use Promise.all instead of sequential await in the map loop.",
          suggestion: "Refactor to use Promise.all(items.map(...))."
        }
      ]
    };
  }
}
