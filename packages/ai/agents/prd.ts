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
  edgeCases: string[];
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

    try {
      const { object } = await generateObject({
        model: openrouter(process.env.AI_MODEL || "openrouter/free"),
        system: PRD_SYSTEM_PROMPT + "\n\nCRITICAL INSTRUCTION: Respond ONLY with a valid JSON object matching the requested schema. Do not include any explanations, markdown formatting, or surrounding text.",
        prompt: `Title: ${title}\nDescription: ${description}\n\nClarifications:\n${clarificationsText}`,
        schema: z.object({
          problemStatement: z.string(),
          goals: z.array(z.string()),
          nonGoals: z.array(z.string()),
          userStories: z.array(z.string()),
          acceptanceCriteria: z.array(z.string()),
          edgeCases: z.array(z.string()),
          successMetrics: z.array(z.string()),
        }),
      });

      return object;
    } catch (error: any) {
      console.error("PRDAgent error:", error);
      
      // Attempt manual extraction if it's a JSON parse error containing the raw text
      if (error.text) {
        try {
          const match = error.text.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            return {
              problemStatement: parsed.problemStatement || "",
              goals: Array.isArray(parsed.goals) ? parsed.goals : [],
              nonGoals: Array.isArray(parsed.nonGoals) ? parsed.nonGoals : [],
              userStories: Array.isArray(parsed.userStories) ? parsed.userStories : [],
              acceptanceCriteria: Array.isArray(parsed.acceptanceCriteria) ? parsed.acceptanceCriteria : [],
              edgeCases: Array.isArray(parsed.edgeCases) ? parsed.edgeCases : [],
              successMetrics: Array.isArray(parsed.successMetrics) ? parsed.successMetrics : [],
            };
          }
        } catch (e) {
          // Ignore secondary parse errors
        }
      }
      
      // Fallback
      return {
        problemStatement: error.text ? `[Raw Output, failed to parse]\n\n${error.text}` : "Failed to generate PRD.",
        goals: [],
        nonGoals: [],
        userStories: [],
        acceptanceCriteria: [],
        edgeCases: [],
        successMetrics: [],
      };
    }
  }
}
