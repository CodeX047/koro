import { generateObject } from "ai";
import { z } from "zod";
import { openrouter } from "../index";
import { PRD_SYSTEM_PROMPT } from "../prompts";

export interface GeneratedPRD {
  problemStatement: string;
  goals: string[];
  nonGoals: string[];
  userStories: string[];
  acceptanceCriteria: string[];
  successMetrics: string[];
}

export class PRDAgent {
  async generate(
    title: string,
    description: string,
    clarifications: { question: string; answer: string }[],
  ): Promise<GeneratedPRD> {
    console.log("Running PRDAgent for:", title);

    const clarificationsText = clarifications
      .map((c) => `Q: ${c.question}\nA: ${c.answer}`)
      .join("\n\n");

    const { object } = await generateObject({
      model: openrouter(process.env.AI_MODEL || "anthropic/claude-3-haiku"),
      system: PRD_SYSTEM_PROMPT,
      prompt: `Title: ${title}\nDescription: ${description}\n\nClarifications:\n${clarificationsText}`,
      schema: z.object({
        problemStatement: z.string(),
        goals: z.array(z.string()),
        nonGoals: z.array(z.string()),
        userStories: z.array(z.string()),
        acceptanceCriteria: z.array(z.string()),
        successMetrics: z.array(z.string()),
      }),
    });

    return object;
  }
}
