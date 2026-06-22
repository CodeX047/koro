import { userService } from "../services";
import { getAuthenticationCookie } from "./cookie";

import type { TRPCContext } from "../context";

export type ContextUser =
  | Awaited<ReturnType<typeof userService.verifyAndDecodeUserToken>>
  | null;

export async function getContextUser(ctx: TRPCContext): Promise<ContextUser> {
  const userToken = getAuthenticationCookie(ctx);

  if (!userToken) return null;

  try {
    return await userService.verifyAndDecodeUserToken(userToken);
  } catch {
    return null;
  }
}
