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
  async generate(title: string, description: string, clarifications: { question: string; answer: string }[]): Promise<GeneratedPRD> {
    console.log("Running PRDAgent for:", title);
    // In production, call the AI SDK using PRD_SYSTEM_PROMPT
    return {
      problemStatement: `Currently, users lack a clear method to handle: ${title}. ${description}`,
      goals: [
        `Enable seamless ${title} functionality.`,
        "Provide interactive user feedback."
      ],
      nonGoals: [
        "Support legacy third-party custom systems."
      ],
      userStories: [
        `As a user, I want to execute ${title} easily.`
      ],
      acceptanceCriteria: [
        "Feature works end-to-end.",
        "Response time is under 1 second."
      ],
      successMetrics: [
        "Adoption rate > 80% among users."
      ]
    };
  }
}
