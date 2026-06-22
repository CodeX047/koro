import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import UserService from "@repo/services/auth";

const userService = new UserService();
const AUTHENTICATION_COOKIE_NAME = "authentication-cookie";

export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().describe("Full name of the user"),
  email: z.string().email().describe("Email address of the user"),
  password: z.string().describe("Password of the user"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("Id of the user created"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
  email: z.string().email().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
});

export const signInUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("Id of the user"),
});

export const getLoggedInUserInfoOutputModel = z.object({
  id: z.string().describe("Id of the user"),
  fullName: z.string().describe("Full name of the user"),
  email: z.string().email().describe("Email address of the user"),
  profileImageUrl: z.string().describe("Profile image of the user").optional().nullable(),
});

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { fullName, email, password } = input;

      const { id, token } = await userService.createUserWithEmailAndPassword({
        fullName,
        email,
        password,
      });

      ctx.createCookie(AUTHENTICATION_COOKIE_NAME, token);

      return {
        id,
      };
    }),

  signInUserWithEmailAndPassword: publicProcedure
    .input(signInUserWithEmailAndPasswordInputModel)
    .output(signInUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      const { id, token } = await userService.signInUserWithEmailAndPassword({ email, password });

      ctx.createCookie(AUTHENTICATION_COOKIE_NAME, token);

      return {
        id,
      };
    }),

  getLoggedInUserInfo: protectedProcedure
    .output(getLoggedInUserInfoOutputModel)
    .query(async ({ ctx }) => {
      const { id, email, fullName, profileImageUrl } = ctx.user;

      return {
        id,
        email,
        fullName,
        profileImageUrl,
      };
    }),
});
