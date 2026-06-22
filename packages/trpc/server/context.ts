import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createCookieFactory, getCookieFactory, clearCookieFactory } from "./utils/cookie";
import { getContextUser, type ContextUser } from "./utils/user";

export interface TRPCContext {
  createCookie: ReturnType<typeof createCookieFactory>;
  getCookie: ReturnType<typeof getCookieFactory>;
  clearCookie: ReturnType<typeof clearCookieFactory>;
  user: ContextUser;
}

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<TRPCContext> {
  const ctx: TRPCContext = {
    createCookie: createCookieFactory(res),
    getCookie: getCookieFactory(req),
    clearCookie: clearCookieFactory(res),
    user: null,
  };
  ctx.user = await getContextUser(ctx);
  return ctx;
}
export type Context = Awaited<ReturnType<typeof createContext>>;
