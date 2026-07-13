"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { githubService } from "./utils/service";

export async function disconnectGithubApp() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await githubService.deleteInstallation(session.user.id);

  // Revalidate the dashboard page to fetch updated installation status
  revalidatePath("/dashboard/github");
}
