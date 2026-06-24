import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const getLoggedInUserInfoOutputModel = z.object({
  id: z.string().describe("Id of the user"),
  fullName: z.string().describe("Full name of the user"),
  email: z.string().email().describe("Email address of the user"),
  profileImageUrl: z.string().describe("Profile image of the user").optional().nullable(),
});

export const authRouter = router({
  getLoggedInUserInfo: protectedProcedure
    .output(getLoggedInUserInfoOutputModel)
    .query(async ({ ctx }) => {
      const { id, email } = ctx.user;
      const fullName = ctx.user.fullName ?? ctx.user.name ?? "";
      const profileImageUrl = ctx.user.profileImageUrl ?? ctx.user.image ?? null;

      return {
        id,
        email,
        fullName,
        profileImageUrl,
      };
    }),
});
