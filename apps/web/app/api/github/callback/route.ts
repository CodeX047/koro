import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@repo/auth";
import { githubService } from "~/features/github/utils/service";

function buildSignInCallbackUrl(installationId: string | null): string {
  if (installationId) {
    return `/api/github/callback?installation_id=${installationId}`;
  }
  return "/dashboard/github";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const installationId = searchParams.get("installation_id");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const baseUrl = process.env.FRONTEND_URL || process.env.BETTER_AUTH_URL || request.url;

  if (!session) {
    const callbackUrl = buildSignInCallbackUrl(installationId);
    return NextResponse.redirect(
      new URL(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`, baseUrl),
    );
  }

  if (installationId) {
    await githubService.saveInstallation(session.user.id, Number(installationId));
  }

  return NextResponse.redirect(new URL("/dashboard/github", baseUrl));
}
