export * from "./agents/clarification";
export * from "./agents/prd";
export * from "./agents/task";
export * from "./agents/review";
export * from "./prompts";
export * from "./utils";

import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});
