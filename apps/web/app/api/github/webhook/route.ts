import { NextRequest, NextResponse } from "next/server";
import { githubService } from "~/features/github/utils/service";
import { inngest } from "@repo/workflows/client";
import {
  parseIssueWebhook,
  parsePushWebhook,
  parsePrReviewWebhook,
  parseBranchWebhook,
} from "@repo/workflows/github/types";

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

  const event = JSON.parse(payload);

  // ── Pull Request ────────────────────────────────────────────────────
  if (eventName === "pull_request") {
    await inngest.send({
      name: "github/pr.event",
      data: {
        installationId: event.installation.id,
        repositoryFullName: event.repository.full_name,
        payload: event,
      },
    });

    return NextResponse.json({ received: true, event: "github/pr.event" });
  }

  // ── Issues ──────────────────────────────────────────────────────────
  if (eventName === "issues") {
    const data = parseIssueWebhook(event);

    await inngest.send({
      name: "github/issue.event",
      data,
    });

    return NextResponse.json({ received: true, event: "github/issue.event" });
  }

  // ── Push ────────────────────────────────────────────────────────────
  if (eventName === "push") {
    const data = parsePushWebhook(event);

    await inngest.send({
      name: "github/push.event",
      data,
    });

    return NextResponse.json({ received: true, event: "github/push.event" });
  }

  // ── Pull Request Review ─────────────────────────────────────────────
  if (eventName === "pull_request_review") {
    const data = parsePrReviewWebhook(event);

    await inngest.send({
      name: "github/pr-review.event",
      data,
    });

    return NextResponse.json({ received: true, event: "github/pr-review.event" });
  }

  // ── Branch/Tag Created ──────────────────────────────────────────────
  if (eventName === "create") {
    const data = parseBranchWebhook(event);

    await inngest.send({
      name: "github/branch.created",
      data,
    });

    return NextResponse.json({ received: true, event: "github/branch.created" });
  }

  // ── Branch/Tag Deleted ──────────────────────────────────────────────
  if (eventName === "delete") {
    const data = parseBranchWebhook(event);

    await inngest.send({
      name: "github/branch.deleted",
      data,
    });

    return NextResponse.json({ received: true, event: "github/branch.deleted" });
  }

  return NextResponse.json({ received: true });
}
