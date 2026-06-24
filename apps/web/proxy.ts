import type { NextRequest } from "next/server";
import { handleAuthProxy } from "./feature/auth/auth-proxy";

export async function proxy(req: NextRequest) {
  return handleAuthProxy(req);
}

export const config = {
  matcher: ["/sign-up", "/sign-in", "/dashboard/:path*"],
};
