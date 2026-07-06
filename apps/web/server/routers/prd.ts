import { z } from "zod";
import { featureProcedure, router } from "../trpc";
import { getPrdByFeatureId } from "@repo/services/prd";
import { getClarificationsByFeatureId } from "@repo/services/clarification";

export const prdRouter = router({
  /** Get the PRD for a feature, along with its clarification Q&A */
  getByFeatureId: featureProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .query(async ({ input }) => {
      const [prd, clarifications] = await Promise.all([
        getPrdByFeatureId(input.featureId),
        getClarificationsByFeatureId(input.featureId),
      ]);

      return {
        prd: prd ?? null,
        clarifications,
      };
    }),
});
