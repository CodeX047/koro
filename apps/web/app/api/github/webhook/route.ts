import { NextRequest, NextResponse } from "next/server";
import { githubService } from "~/features/github/utils/service";
import { inngest } from "@repo/workflows/client";

async function isSignatureValid(payload: string, signature: string | null) {
  if (!signature) {
    return false;
  }

  const app = githubService.getGithubApp();
  // Octokit wraps GitHub's webhook crypto — rejects forged payloads.
  return app.webhooks.verify(payload, signature);
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const eventName = request.headers.get("x-github-event");

  const isValid = await isSignatureValid(payload, signature);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (eventName === "pull_request") {
    const event = JSON.parse(payload);

    // We emit an event, then Inngest handles processing the PR metadata & changed files
    await inngest.send({
      name: "github/pr.event", // Let's use a unified event or split them. Let's use github/pr.event
      data: {
        installationId: event.installation.id,
        repositoryFullName: event.repository.full_name,
        payload: event,
      },
    });

    return NextResponse.json({ received: true, event: "github/pr.event" });
  }

  return NextResponse.json({ received: true });
}
