import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db, eq } from "@repo/database";
import { prdsTable } from "@repo/database/schema";

export const prdRouter = router({
  get: protectedProcedure
    .input(z.object({ featureRequestId: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log(`Getting PRD for feature request: ${input.featureRequestId}`);
      const [prd] = await db.select().from(prdsTable).where(eq(prdsTable.featureId, input.featureRequestId));
      return prd || null;
    }),

  generate: protectedProcedure
    .input(z.object({ featureRequestId: z.string(), title: z.string(), description: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log(`Triggering PRD generation for feature: ${input.featureRequestId}`);
      // In production, invoke workflows/generate-prd.ts
      const [prd] = await db.insert(prdsTable).values({
        title: input.title,
        content: `Generating PRD for ${input.title}...`,
        featureId: input.featureRequestId,
      }).returning();
      
      if (!prd) throw new Error("Failed to insert PRD");
      
      return { status: "pending", featureRequestId: input.featureRequestId, prdId: prd.id };
    }),
});
