import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import GithubService from "@repo/services/github";

const githubService = new GithubService();

import { db, eq } from "@repo/database";
import { repoSyncTable } from "@repo/database/schema";

export const githubRouter = router({
  listRepositories: protectedProcedure.query(async ({ ctx }) => {
    return await githubService.listRepositories(ctx.user.id);
  }),

  getSyncedRepositories: protectedProcedure.query(async ({ ctx }) => {
    const installationId = await githubService.getUserInstallationId(ctx.user.id);
    if (!installationId) return [];
    
    const syncedRepos = await db
      .select({ repoFullName: repoSyncTable.repoFullName })
      .from(repoSyncTable)
      .where(eq(repoSyncTable.installationId, installationId));
      
    return syncedRepos.map(r => r.repoFullName);
  }),

  getConnectedRepository: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await githubService.getConnectedRepository(input.projectId);
    }),

  connectRepository: protectedProcedure
    .input(z.object({ 
      organizationId: z.string(), 
      projectId: z.string(), 
      repoFullName: z.string() 
    }))
    .mutation(async ({ ctx, input }) => {
      return await githubService.connectRepository(
        input.organizationId,
        input.projectId,
        ctx.user.id,
        input.repoFullName
      );
    }),

  disconnectRepository: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input }) => {
      await githubService.disconnectRepository(input.projectId);
      return { success: true };
    }),
});
