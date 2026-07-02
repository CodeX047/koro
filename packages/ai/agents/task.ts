import { generateObject } from "ai";
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

    const { object } = await generateObject({
      model: openrouter(process.env.AI_MODEL || "openrouter/free"),
      system: TASK_SYSTEM_PROMPT,
      prompt: `PRD Content:\n${JSON.stringify(prdSections, null, 2)}`,
      schema: z.object({
        tasks: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            reason: z.string().describe("A short explanation of why this task is needed or prioritized as such"),
            category: z.enum([
              "frontend",
              "backend",
              "database",
              "testing",
              "devops",
              "documentation",
              "other",
            ]),
            priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
            complexity: z.enum(["LOW", "MEDIUM", "HIGH"]),
            estimateHours: z.number().min(1),
            epic: z.string().optional(),
            dependencies: z.array(z.string()).optional(),
          }),
        ),
      }),
    });

    return object.tasks;
  }
}
