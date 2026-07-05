import { initTRPC, TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { getSession } from "~/features/auth/utils/auth";

export interface TRPCContext {
  createCookie: (name: string, value: string, opts?: any) => void;
  getCookie: (name: string) => string | undefined;
  clearCookie: (name: string) => void;
  user: any;
  session: any;
  activeOrganizationId: string | null;
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
      maxAge: 365 * 24 * 60 * 60, // 1 year
      ...opts,
    });
  };
  const clearCookie = (name: string) => {
    cookieStore.delete(name);
  };

  const session = await getSession();

  const ctx: TRPCContext = {
    createCookie,
    getCookie,
    clearCookie,
    user: session?.user || null,
    session: session?.session || null,
    activeOrganizationId: session?.session?.activeOrganizationId || null,
  };

  return ctx;
}

const tRPCContext = initTRPC.context<TRPCContext>().create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

export const protectedProcedure = publicProcedure.use((opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
  }

  return opts.next({ ctx: { ...opts.ctx, user: opts.ctx.user } });
});
