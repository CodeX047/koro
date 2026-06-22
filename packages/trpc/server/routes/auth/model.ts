import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().describe("Full name of the user"),
  email: z.email().describe("Email address of the user"),
  password: z.string().describe("Password of the user"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("Id of the user created"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
  email: z.email().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
});

export const signInUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("Id of the user"),
});

export const getLoggedInUserInputModel = z.undefined();

export const getLoggedInUserInfoOutputModel = z.object({
  id: z.string().describe("Id of the user"),
  fullName: z.string().describe("Full name of the user"),
  email: z.email().describe("Email address of the user"),
  profileImageUrl: z.string().describe("Profile image of the user").optional().nullable(),
});
