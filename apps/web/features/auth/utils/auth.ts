import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";

export const getSession = cache(async () => {
  const start = performance.now();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const elapsed = Math.round(performance.now() - start);
  if (elapsed > 100) {
    console.warn(`[perf] getSession took ${elapsed}ms`);
  }
  return session;
});

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireUnAuth() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return null;
}
