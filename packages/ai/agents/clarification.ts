import { generateObject } from "ai";
import { z } from "zod";
import { openrouter } from "../index";
import { CLARIFICATION_SYSTEM_PROMPT } from "../prompts";

export class ClarificationAgent {
  async clarify(title: string, description: string): Promise<string[]> {
    console.log("Running ClarificationAgent for:", title);

    const { object } = await generateObject({
      model: openrouter(process.env.AI_MODEL || "anthropic/claude-3-haiku"),
      system: CLARIFICATION_SYSTEM_PROMPT,
      prompt: `Title: ${title}\nDescription: ${description}`,
      schema: z.object({
        questions: z.array(z.string()).describe("List of clarifying questions"),
      }),
    });

    return object.questions;
  }
}
