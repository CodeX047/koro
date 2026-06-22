import { httpLink, httpBatchStreamLink } from "@trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    url: env.NEXT_PUBLIC_API_URL ?? "/api/trpc",
    fetch(url: any, options?: any) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
