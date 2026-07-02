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

    try {
      const { object } = await generateObject({
        model: openrouter(process.env.AI_MODEL || "openrouter/free"),
        system: CLARIFICATION_SYSTEM_PROMPT + "\n\nCRITICAL INSTRUCTION: Respond ONLY with a valid JSON object. Do not include any explanations, markdown formatting, or surrounding text.",
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
    } catch (error: any) {
      console.error("ClarificationAgent error:", error);
      
      // Attempt manual extraction if it's a JSON parse error containing the raw text
      if (error.text) {
        try {
          const match = error.text.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            return {
              needsClarification: Boolean(parsed.needsClarification),
              questions: Array.isArray(parsed.questions) ? parsed.questions : [],
            };
          }
        } catch (e) {
          // Ignore secondary parse errors
        }
      }
      
      // Fallback
      return { needsClarification: false, questions: [] };
    }
  }
}
