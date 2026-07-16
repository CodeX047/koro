import { generateText } from "ai";
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
  securityIssues: boolean;
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
      buildContextSection(input.diff, "Code Diff (The changes to review)"),
    ].join("");

    let text = "";
    try {
      const result = await generateText({
        model: openrouter(process.env.REVIEW_MODEL || process.env.AI_MODEL || "openrouter/free"),
        system:
          REVIEW_SYSTEM_PROMPT +
          `\n\nCRITICAL INSTRUCTION: Respond ONLY with a valid JSON object matching exactly this schema:
{
  "verdict": "APPROVE" | "COMMENT" | "REQUEST_CHANGES",
  "score": number,
  "scoreBreakdown": { "correctness": number, "security": number, "performance": number, "maintainability": number, "requirements": number },
  "summary": "string",
  "findings": [
    {
      "file": "string",
      "severity": "Blocking" | "Major" | "Minor" | "Nit",
      "category": "Security" | "Performance" | "Correctness" | "Style" | "Architecture",
      "title": "string",
      "explanation": "string",
      "suggestion": "string"
    }
  ],
  "securityIssues": boolean
}
Do not include explanations or markdown.`,
        prompt: promptContext,
      });
      text = result.text;
    } catch (e) {
      console.error("ReviewAgent AI generation error:", e);
      return {
        verdict: "COMMENT",
        score: 0,
        scoreBreakdown: {
          correctness: 0,
          security: 0,
          performance: 0,
          maintainability: 0,
          requirements: 0,
        },
        summary: "Failed to generate review due to API error.",
        findings: [],
        securityIssues: false,
      };
    }

    try {
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
      return {
        verdict: parsed.verdict || "COMMENT",
        score: parsed.score || 0,
        scoreBreakdown: parsed.scoreBreakdown || {
          correctness: 0,
          security: 0,
          performance: 0,
          maintainability: 0,
          requirements: 0,
        },
        summary: parsed.summary || "",
        findings: Array.isArray(parsed.findings) ? parsed.findings : [],
        securityIssues: !!parsed.securityIssues,
      };
    } catch (e) {
      console.error("ReviewAgent JSON parse error:", e);
      return {
        verdict: "COMMENT",
        score: 0,
        scoreBreakdown: {
          correctness: 0,
          security: 0,
          performance: 0,
          maintainability: 0,
          requirements: 0,
        },
        summary: "Failed to parse review.",
        findings: [],
        securityIssues: false,
      };
    }
  }
}
