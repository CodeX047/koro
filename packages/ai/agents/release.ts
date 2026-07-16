import { generateText } from "ai";
import { openrouter } from "../index";
import { RELEASE_SYSTEM_PROMPT } from "../prompts";

export interface ReleaseEvaluationInput {
  featureMetadata: string;
  clarifications: string;
  prdContent: string;
  tasks: string;
  releaseNotesRaw: string;
  reviewRuns: string;
  deterministicChecks: string;
  computedScore: string;
}

export interface ReleaseEvaluationOutput {
  summary: string;
  missingRequirements: string[];
  risks: string[];
  releaseNotes: string[];
  recommendations: string[];
}

export class ReleaseAgent {
  async evaluate(input: ReleaseEvaluationInput): Promise<ReleaseEvaluationOutput> {
    const promptContext = `
## Deterministic Checks
${input.deterministicChecks}

## Computed Score Breakdown
${input.computedScore}

## Feature Metadata
${input.featureMetadata}

## Clarifications
${input.clarifications}

## Product Requirements (PRD)
${input.prdContent}

## Engineering Tasks
${input.tasks}

## PR Reviews
${input.reviewRuns}

## Raw Release Notes (Commits & PR Titles)
${input.releaseNotesRaw}
`;

    try {
      const result = await generateText({
        model: openrouter(process.env.RELEASE_MODEL || process.env.AI_MODEL || "openrouter/free"),
        system: RELEASE_SYSTEM_PROMPT,
        prompt: promptContext,
      });

      const text = result.text;
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");

      return {
        summary: parsed.summary || "Release analysis completed.",
        missingRequirements: Array.isArray(parsed.missingRequirements)
          ? parsed.missingRequirements
          : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks : [],
        releaseNotes: Array.isArray(parsed.releaseNotes) ? parsed.releaseNotes : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      };
    } catch (e) {
      console.error("ReleaseAgent AI generation error:", e);
      return {
        summary: "Failed to generate release analysis due to API error.",
        missingRequirements: [],
        risks: ["Analysis failed."],
        releaseNotes: [],
        recommendations: ["Check logs for API error details."],
      };
    }
  }
}
