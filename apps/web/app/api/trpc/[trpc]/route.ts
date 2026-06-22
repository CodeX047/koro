import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/root";
import { createContext } from "~/server/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    onError(opts) {
      if (process.env.NODE_ENV === "development") {
        console.error(`tRPC error on ${req.url}:`, opts.error);
      }
    },
  });

export { handler as GET, handler as POST };
