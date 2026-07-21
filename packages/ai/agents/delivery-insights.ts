import { generateText } from "ai";
import { z } from "zod";
import { openrouter } from "../index";

export interface DeliveryInsightsInput {
  averageLeadTimeMs: number;
  averageCycleTimeMs: number;
  featuresReleased: number;
  featuresInProgress: number;
  averageAiReviewTimeMs: number;
  reviewSuccessRate: number | null;
  openPrs: number;
  blockedFeatures: number;
  velocity: Record<string, any>;
  throughput: Record<string, any>;
  health: {
    status: "healthy" | "warning" | "critical";
    issues: string[];
  };
}

export interface DeliveryInsightsOutput {
  summary: string;
  strengths: string[];
  risks: string[];
  bottlenecks: string[];
  recommendations: string[];
  predictions: string[];
}

export class DeliveryInsightsAgent {
  async evaluate(input: DeliveryInsightsInput): Promise<DeliveryInsightsOutput> {
    const promptContext = `
## Current Delivery Metrics
- Average Lead Time: ${Math.round(input.averageLeadTimeMs / (1000 * 60 * 60 * 24))} days
- Average Cycle Time: ${Math.round(input.averageCycleTimeMs / (1000 * 60 * 60 * 24))} days
- Average AI Review Time: ${Math.round(input.averageAiReviewTimeMs / (1000 * 60))} minutes
- Review Success Rate: ${input.reviewSuccessRate ?? 0}%
- Features Released: ${input.featuresReleased}
- Features In Progress: ${input.featuresInProgress}
- Open PRs: ${input.openPrs}
- Blocked Features: ${input.blockedFeatures}

## Velocity (Completed Features per month)
${JSON.stringify(input.velocity, null, 2)}

## Throughput (Completed Tasks per month)
${JSON.stringify(input.throughput, null, 2)}

## Health Indicators
Status: ${input.health.status}
Issues:
${input.health.issues.map((i) => `- ${i}`).join("\n")}
`;

    try {
      const result = await generateText({
        model: openrouter(process.env.RELEASE_MODEL || process.env.AI_MODEL || "openrouter/free"),
        system: `You are an expert Engineering Manager and Agile Coach analyzing a software team's delivery metrics.
Your goal is to provide highly actionable insights, identify bottlenecks in the delivery pipeline (e.g. slow reviews, stale PRs, large cycle times), and predict future velocity.
Never invent metrics that aren't provided.

CRITICAL INSTRUCTION: You MUST output ONLY raw, valid JSON without any markdown code blocks (no \`\`\`json), backticks, or other text.
The JSON must strictly adhere to the following structure:
{
  "summary": "A 2-3 sentence executive summary of the team's current delivery performance.",
  "strengths": ["List of 2-3 areas where the team is performing exceptionally well."],
  "risks": ["List of 1-3 risks to delivery (e.g., high WIP, blocked features)."],
  "bottlenecks": ["List of 1-3 specific bottlenecks slowing down delivery."],
  "recommendations": ["List of 2-4 actionable recommendations for the engineering team to improve velocity or quality."],
  "predictions": ["1-2 predictions about future delivery based on current trends."]
}`,
        prompt: promptContext,
      });

      // Clean potential markdown blocks or conversational text if the model ignored instructions
      let cleanJson = result.text.trim();
      const firstBrace = cleanJson.indexOf("{");
      const lastBrace = cleanJson.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
        cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(cleanJson) as DeliveryInsightsOutput;
      return parsed;
    } catch (e) {
      console.error("DeliveryInsightsAgent AI generation error:", e);
      return {
        summary: "Failed to generate delivery insights due to an API error.",
        strengths: [],
        risks: ["Insight generation failed."],
        bottlenecks: [],
        recommendations: ["Check logs for API error details."],
        predictions: [],
      };
    }
  }
}
