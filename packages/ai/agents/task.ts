import { TASK_SYSTEM_PROMPT } from "../prompts";

export interface GeneratedTask {
  title: string;
  description: string;
  category: "frontend" | "backend" | "database" | "testing" | "devops";
}

export class TaskAgent {
  async plan(prdId: string, prdContent: string): Promise<GeneratedTask[]> {
    console.log("Running TaskAgent for PRD:", prdId);
    // In production, call the AI SDK using TASK_SYSTEM_PROMPT
    return [
      {
        title: "Database schema setup",
        description: "Add new columns or tables required by the feature.",
        category: "database"
      },
      {
        title: "API route implementation",
        description: "Create tRPC or REST API routes to handle the feature logic.",
        category: "backend"
      },
      {
        title: "Frontend UI components",
        description: "Develop Shadcn/React components mapping the user stories.",
        category: "frontend"
      },
      {
        title: "Add integration tests",
        description: "Write vitest or Playwright tests to verify acceptance criteria.",
        category: "testing"
      }
    ];
  }
}
