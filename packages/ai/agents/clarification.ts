import { generateObject } from "ai";
import { z } from "zod";
import { openrouter } from "../index";
import { CLARIFICATION_SYSTEM_PROMPT } from "../prompts";

export interface ClarificationResult {
  needsClarification: boolean;
  questions: string[];
}

export class ClarificationAgent {
  async clarify(title: string, description: string): Promise<ClarificationResult> {
    console.log("Running ClarificationAgent for:", title);

    const { object } = await generateObject({
      model: openrouter(process.env.AI_MODEL || "anthropic/claude-3-haiku"),
      system: CLARIFICATION_SYSTEM_PROMPT,
      prompt: `Title: ${title}\nDescription: ${description}`,
      schema: z.object({
        needsClarification: z
          .boolean()
          .describe(
            "true if the request lacks enough detail to generate a high-quality PRD; false if you have sufficient context",
          ),
        questions: z
          .array(z.string())
          .describe(
            "3-5 precise clarifying questions when needsClarification is true; empty array when false",
          ),
      }),
    });

    return object;
  }
}
