import { NextRequest, NextResponse } from "next/server";
import { githubService } from "~/features/github/utils/service";
import { savePullRequest, PullRequestWebhookPayload } from "@repo/services/github/webhook";
import { inngest } from "~/features/inngest/client";

const REVIEWABLE_ACTIONS = ["opened", "synchronize", "reopened"];

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

  if (eventName !== "pull_request") {
    return NextResponse.json({ received: true });
  }

  const event = JSON.parse(payload) as PullRequestWebhookPayload;

  console.log("GitHub Webhook Event:", event.action, event.repository.full_name);

  if (!REVIEWABLE_ACTIONS.includes(event.action)) {
    return NextResponse.json({ received: true });
  }

  const pullRequest = await savePullRequest(event);

  if (pullRequest) {
    await inngest.send({
      name: "github/pr.received",
      data: { pullRequestId: pullRequest.id },
    });
  }

  return NextResponse.json({ received: true, prId: pullRequest?.id });
}
