import { router } from "./trpc";
import { healthRouter } from "./routers/health";
import { authRouter } from "./routers/auth";
import { projectRouter } from "./routers/project";
import { featureRouter } from "./routers/feature";
import { clarificationRouter } from "./routers/clarification";
import { prdRouter } from "./routers/prd";
import { taskRouter } from "./routers/task";
import { reviewRouter } from "./routers/review";
import { billingRouter } from "./routers/billing";

export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  project: projectRouter,
  feature: featureRouter,
  clarification: clarificationRouter,
  prd: prdRouter,
  task: taskRouter,
  review: reviewRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
