import { cache } from "react";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";

export const getSession = cache(async () => {
  const { auth } = await import("@repo/auth");
  const headers = await getHeaders();

  const session = await auth.api.getSession({
    headers,
  });

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
