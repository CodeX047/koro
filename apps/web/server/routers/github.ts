import { z } from "zod";
import { organizationProcedure, roleProcedure, router } from "../trpc";
import { checkAuthorization } from "@repo/services/security/authorize";
import { TRPCError } from "@trpc/server";
import GithubService from "@repo/services/github";

const githubService = new GithubService();

import { db, eq } from "@repo/database";
import { repoSyncTable } from "@repo/database/schema";

export const githubRouter = router({
  listRepositories: organizationProcedure.query(async ({ ctx }) => {
    return await githubService.listRepositories(ctx.user.id);
  }),

  getSyncedRepositories: organizationProcedure.query(async ({ ctx }) => {
    const installationId = await githubService.getUserInstallationId(ctx.user.id);
    if (!installationId) return [];

    const syncedRepos = await db
      .select({ repoFullName: repoSyncTable.repoFullName })
      .from(repoSyncTable)
      .where(eq(repoSyncTable.installationId, installationId));

    return syncedRepos.map((r) => r.repoFullName);
  }),

  getConnectedRepository: organizationProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      const isAuthorized = await checkAuthorization({
        resource: "project",
        id: input.projectId,
        organizationId: ctx.activeOrganizationId!,
      });
      if (!isAuthorized) throw new TRPCError({ code: "NOT_FOUND" });

      return await githubService.getConnectedRepository(input.projectId);
    }),

  connectRepository: roleProcedure("admin")
    .input(
      z.object({
        organizationId: z.string(),
        projectId: z.string(),
        repoFullName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAuthorized = await checkAuthorization({
        resource: "project",
        id: input.projectId,
        organizationId: ctx.activeOrganizationId!,
      });
      if (!isAuthorized) throw new TRPCError({ code: "NOT_FOUND" });

      return await githubService.connectRepository(
        input.organizationId,
        input.projectId,
        ctx.user.id,
        input.repoFullName,
      );
    }),

  disconnectRepository: roleProcedure("admin")
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const isAuthorized = await checkAuthorization({
        resource: "project",
        id: input.projectId,
        organizationId: ctx.activeOrganizationId!,
      });
      if (!isAuthorized) throw new TRPCError({ code: "NOT_FOUND" });

      await githubService.disconnectRepository(input.projectId);
      return { success: true };
    }),
});
