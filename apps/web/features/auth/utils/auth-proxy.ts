import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@repo/auth";

export function getSafeCallbackPath(callbackUrl: string | null | undefined): string {
  if (!callbackUrl) {
    return "/dashboard";
  }

  const trimmed = callbackUrl.trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes(" ")
  ) {
    return "/dashboard";
  }

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/dashboard";
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.host !== "localhost") {
      return "/dashboard";
    }
    return trimmed;
  } catch {
    return "/dashboard";
  }
}

export async function handleAuthProxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const start = performance.now();
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  const elapsed = Math.round(performance.now() - start);
  if (elapsed > 200) {
    console.warn(`[perf] middleware getSession took ${elapsed}ms for ${pathname}`);
  }

  const isAuthenticated = !!session;

  if (pathname === "/sign-in" || pathname === "/sign-up") {
    if (isAuthenticated) {
      const callbackUrl = searchParams.get("callbackUrl");
      const safeDest = getSafeCallbackPath(callbackUrl);
      return NextResponse.redirect(new URL(safeDest, req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const callbackUrl = pathname + req.nextUrl.search;
      const redirectUrl = new URL("/sign-in", req.url);
      redirectUrl.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
