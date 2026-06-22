import type { AppRouter } from "~/server/root";
import { createTRPCProxyClient } from "@trpc/client";
import { createTRPCHttpBatchClientClient } from "~/trpc/create-client";

export const api = createTRPCProxyClient<AppRouter>({
  links: [createTRPCHttpBatchClientClient()],
});

export const apiStreaming = createTRPCProxyClient<AppRouter>({
  links: [createTRPCHttpBatchClientClient({ enableStreaming: true })],
});
