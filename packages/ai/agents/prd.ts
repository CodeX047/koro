import { generateText } from "ai";
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

    let text = "";
    try {
      const result = await generateText({
        model: openrouter(process.env.AI_MODEL || "openrouter/free"),
        system: PRD_SYSTEM_PROMPT + `\n\nCRITICAL INSTRUCTION: Respond ONLY with a valid JSON object. Do not include any explanations or markdown. Use EXACTLY these properties:\n{
  "problemStatement": "string",
  "goals": ["string"],
  "nonGoals": ["string"],
  "userStories": ["string"],
  "acceptanceCriteria": ["string"],
  "edgeCases": ["string"],
  "successMetrics": ["string"]
}`,
        prompt: `Title: ${title}\nDescription: ${description}\n\nClarifications:\n${clarificationsText}`,
      });
      text = result.text;
    } catch (error: any) {
      console.error("PRDAgent API error:", error);
      return {
        problemStatement: "Failed to generate PRD due to API error.",
        goals: [],
        nonGoals: [],
        userStories: [],
        acceptanceCriteria: [],
        edgeCases: [],
        successMetrics: [],
      };
    }

    let parsed: any = {};
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    } catch (e) {
      console.error("PRDAgent JSON parse error:", e);
    }

    // Try to find the values regardless of case or spacing
    const getStr = (keys: string[]) => {
      for (const key of keys) {
        if (parsed[key] !== undefined) return String(parsed[key]);
        const lowerKey = Object.keys(parsed).find(k => k.toLowerCase().replace(/[^a-z]/g, '') === key.toLowerCase().replace(/[^a-z]/g, ''));
        if (lowerKey) return String(parsed[lowerKey]);
      }
      return "";
    };

    const getArr = (keys: string[]) => {
      for (const key of keys) {
        if (Array.isArray(parsed[key])) return parsed[key];
        const lowerKey = Object.keys(parsed).find(k => k.toLowerCase().replace(/[^a-z]/g, '') === key.toLowerCase().replace(/[^a-z]/g, ''));
        if (lowerKey && Array.isArray(parsed[lowerKey])) return parsed[lowerKey];
      }
      return [];
    };

    const problemStatement = getStr(["problemStatement", "problem", "statement"]);
    const goals = getArr(["goals"]);
    const nonGoals = getArr(["nonGoals", "nongoal"]);
    const userStories = getArr(["userStories", "stories"]);
    const acceptanceCriteria = getArr(["acceptanceCriteria", "criteria"]);
    const edgeCases = getArr(["edgeCases", "edge", "cases"]);
    const successMetrics = getArr(["successMetrics", "metrics"]);

    if (problemStatement || goals.length > 0 || userStories.length > 0) {
       return {
         problemStatement,
         goals,
         nonGoals,
         userStories,
         acceptanceCriteria,
         edgeCases,
         successMetrics,
       };
    }
    
    // Fallback
    return {
      problemStatement: `[Raw Output, failed to parse]\n\n${text}`,
      goals: [],
      nonGoals: [],
      userStories: [],
      acceptanceCriteria: [],
      edgeCases: [],
      successMetrics: [],
    };
  }
}
