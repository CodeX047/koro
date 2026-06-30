import { generateObject } from "ai";
import { z } from "zod";
import { openrouter } from "../index";
import { TASK_SYSTEM_PROMPT } from "../prompts";

export interface GeneratedTask {
  title: string;
  description: string;
  category: "frontend" | "backend" | "database" | "testing" | "devops";
}

export class TaskAgent {
  async plan(prdId: string, prdContent: string): Promise<GeneratedTask[]> {
    console.log("Running TaskAgent for PRD:", prdId);

    const { object } = await generateObject({
      model: openrouter(process.env.AI_MODEL || "anthropic/claude-3-haiku"),
      system: TASK_SYSTEM_PROMPT,
      prompt: `PRD Content:\n${prdContent}`,
      schema: z.object({
        tasks: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            category: z.enum(["frontend", "backend", "database", "testing", "devops"]),
          }),
        ),
      }),
    });

    return object.tasks;
  }
}
