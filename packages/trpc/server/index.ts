import { router } from "./trpc";

import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { billingRouter } from "./routes/billing/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  billing: billingRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
