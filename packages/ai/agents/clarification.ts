import { generateText } from "ai";
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
      const { text } = await generateText({
        model: openrouter(process.env.AI_MODEL || "openrouter/free"),
        system:
          CLARIFICATION_SYSTEM_PROMPT +
          '\n\nCRITICAL INSTRUCTION: Respond ONLY with a valid JSON object matching exactly this schema:\n{\n  "needsClarification": boolean,\n  "questions": ["string"]\n}\nDo not include any explanations, markdown formatting, or surrounding text.',
        prompt: `Title: ${title}\nDescription: ${description}`,
      });
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
      return {
        needsClarification: !!parsed.needsClarification,
        questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      };
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
