import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";

/**
 * Ensures the user is authenticated. 
 * If unauthenticated, redirects to the sign-in page.
 * Otherwise, returns the active session.
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

/**
 * Ensures the user is unauthenticated.
 * If authenticated, redirects to the dashboard.
 * Otherwise, returns null.
 */
export async function requireUnAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return null;
}
