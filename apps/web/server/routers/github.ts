import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import GithubService from "@repo/services/github";

const githubService = new GithubService();

export const githubRouter = router({
  listRepositories: protectedProcedure.query(async ({ ctx }) => {
    return await githubService.listRepositories(ctx.session.user.id);
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
        ctx.session.user.id,
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
