import { initTRPC, TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { getSession } from "~/features/auth/utils/auth";
import { z } from "zod";
import { checkAuthorization } from "@repo/services/security/authorize";
import { db, eq, and } from "@repo/database";
import { memberTable } from "@repo/database/schema";

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

export const organizationProcedure = protectedProcedure.use((opts) => {
  if (!opts.ctx.activeOrganizationId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization selected" });
  }
  return opts.next({
    ctx: { ...opts.ctx, activeOrganizationId: opts.ctx.activeOrganizationId },
  });
});

export const roleProcedure = (minRole: "owner" | "admin" | "member") => {
  return organizationProcedure.use(async (opts) => {
    const { activeOrganizationId, user } = opts.ctx;

    const [member] = await db
      .select({ role: memberTable.role })
      .from(memberTable)
      .where(
        and(
          eq(memberTable.organizationId, activeOrganizationId),
          eq(memberTable.userId, user.id)
        )
      )
      .limit(1);

    if (!member) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Not a member of this organization" });
    }

    const roles = ["viewer", "member", "admin", "owner"];
    const userRoleIndex = roles.indexOf(member.role);
    const minRoleIndex = roles.indexOf(minRole);

    if (userRoleIndex < minRoleIndex) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Requires ${minRole} role` });
    }

    return opts.next();
  });
};

const createResourceProcedure = (resource: "project" | "feature" | "task" | "prd" | "repository" | "pull-request", idKey: string) => {
  return organizationProcedure
    .input(z.object({}).passthrough())
    .use(async (opts) => {
      const { activeOrganizationId } = opts.ctx;
      
      const input = opts.input as any;
      const id = input?.[idKey] || input?.id || input?.[`${resource}Id`];
      
      if (typeof id !== "string") {
        console.error("TRPC Middleware - Missing ID! idKey:", idKey, "input:", input);
        throw new TRPCError({ code: "BAD_REQUEST", message: `Missing or invalid ${idKey}` });
      }
      
      const isAuthorized = await checkAuthorization({
        resource,
        id,
        organizationId: activeOrganizationId,
      });

      console.log(`[TRPC Auth Debug] resource: ${resource}, idKey: ${idKey}, id: ${id}, activeOrg: ${activeOrganizationId}, isAuthorized: ${isAuthorized}, input:`, input);

      if (!isAuthorized) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Resource not found" });
      }

      return opts.next();
    });
};

export const projectProcedure = createResourceProcedure("project", "id");
export const featureProcedure = createResourceProcedure("feature", "featureId");
export const taskProcedure = createResourceProcedure("task", "taskId");
export const prdProcedure = createResourceProcedure("prd", "prdId");
export const repositoryProcedure = createResourceProcedure("repository", "repositoryId");
export const pullRequestProcedure = createResourceProcedure("pull-request", "pullRequestId");
