import { generateText } from "ai";
import { z } from "zod";
import { openrouter } from "../index";
import { TASK_SYSTEM_PROMPT } from "../prompts";

export interface GeneratedTask {
  title: string;
  description: string;
  category: "frontend" | "backend" | "database" | "testing" | "devops" | "documentation" | "other";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  complexity: "LOW" | "MEDIUM" | "HIGH";
  estimateHours: number;
  epic?: string; // Optional: Groups tasks under a parent epic
  dependencies?: string[]; // Titles of tasks this task depends on
}

export class TaskAgent {
  async plan(prdSections: {
    problemStatement?: string;
    goals?: string[];
    userStories?: string[];
    acceptanceCriteria?: string[];
    edgeCases?: string[];
  }): Promise<GeneratedTask[]> {
    console.log("Running TaskAgent with structured PRD content");

    let text = "";
    try {
      const result = await generateText({
        model: openrouter(process.env.AI_MODEL || "openrouter/free"),
        system:
          TASK_SYSTEM_PROMPT +
          `\n\nCRITICAL INSTRUCTION: Respond ONLY with a valid JSON object matching exactly this schema:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "category": "frontend" | "backend" | "database" | "testing" | "devops" | "documentation" | "other",
      "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      "complexity": "LOW" | "MEDIUM" | "HIGH",
      "estimateHours": number,
      "dependencies": ["string"]
    }
  ]
}
Do not include explanations or markdown.`,
        prompt: `PRD Content:\n${JSON.stringify(prdSections, null, 2)}`,
      });
      text = result.text;
    } catch (e) {
      console.error("TaskAgent API error:", e);
      return [];
    }

    try {
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
      return Array.isArray(parsed.tasks) ? parsed.tasks : [];
    } catch (e) {
      console.error("TaskAgent JSON parse error:", e);
      return [];
    }
  }
}
