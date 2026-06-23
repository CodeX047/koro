import { PRDAgent } from "@repo/ai";

export async function runGeneratePRDWorkflow(input: {
  featureRequestId: string;
  title: string;
  description: string;
}): Promise<void> {
  console.log("Starting runGeneratePRDWorkflow for:", input.featureRequestId);
  
  const prdAgent = new PRDAgent();
  const prd = await prdAgent.generate(input.title, input.description, []);
  
  console.log("PRD generated successfully:", prd.problemStatement);
  // In production, save to DB using a database service (e.g. prdService.create)
}
