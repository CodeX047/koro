import { CLARIFICATION_SYSTEM_PROMPT } from "../prompts";

export class ClarificationAgent {
  async clarify(title: string, description: string): Promise<string[]> {
    console.log("Running ClarificationAgent for:", title);
    // In production, you would call the AI SDK here using CLARIFICATION_SYSTEM_PROMPT
    return [
      `What is the primary user flow for ${title}?`,
      `Are there any specific UI components or mockups for: ${description}?`,
      "What are the security or authorization constraints for this feature?",
    ];
  }
}
