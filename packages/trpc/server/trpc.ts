import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { AppError } from "@repo/services/auth/errors";

import type { Context } from "./context";

export const tRPCContext = initTRPC.meta<OpenApiMeta>().context<Context>().create({});

export const router = tRPCContext.router;

const errorMapper = tRPCContext.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof AppError) {
      throw new TRPCError({ code: error.code, message: error.message, cause: error });
    }
    throw error;
  }
});

export const publicProcedure = tRPCContext.procedure.use(errorMapper);

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});
