import { initTRPC, TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import UserService from "@repo/services/auth";
import { AppError } from "@repo/services/auth/errors";

const userService = new UserService();
const AUTHENTICATION_COOKIE_NAME = "authentication-cookie";

export interface TRPCContext {
  createCookie: (name: string, value: string, opts?: any) => void;
  getCookie: (name: string) => string | undefined;
  clearCookie: (name: string) => void;
  user: any;
}

export async function createContext(): Promise<TRPCContext> {
  const cookieStore = await cookies();

  const getCookie = (name: string) => cookieStore.get(name)?.value;
  const createCookie = (name: string, value: string, opts?: any) => {
    cookieStore.set(name, value, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 365 * 24 * 60 * 60, // 1 year (seconds in Next.js cookies API)
      ...opts,
    });
  };
  const clearCookie = (name: string) => {
    cookieStore.delete(name);
  };

  const ctx: TRPCContext = {
    createCookie,
    getCookie,
    clearCookie,
    user: null,
  };

  const token = getCookie(AUTHENTICATION_COOKIE_NAME);
  if (token) {
    try {
      ctx.user = await userService.verifyAndDecodeUserToken(token);
    } catch {
      ctx.user = null;
    }
  }

  return ctx;
}

const tRPCContext = initTRPC.context<TRPCContext>().create({});

export const router = tRPCContext.router;

const errorMapper = tRPCContext.middleware(async (opts) => {
  try {
    return await opts.next();
  } catch (error: any) {
    if (error instanceof AppError) {
      throw new TRPCError({ code: error.code, message: error.message, cause: error });
    }
    throw error;
  }
});

export const publicProcedure = tRPCContext.procedure.use(errorMapper);

export const protectedProcedure = publicProcedure.use((opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
  }

  return opts.next({ ctx: { ...opts.ctx, user: opts.ctx.user } });
});
