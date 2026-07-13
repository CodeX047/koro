import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@repo/billing";
import { inngest } from "@repo/workflows/client";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("webhook-signature") || "";
  const timestamp = req.headers.get("webhook-timestamp") || "";

  const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Verify signature
  if (!verifyWebhook(body, signature, timestamp, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Check timestamp to prevent replay attacks (5 minute tolerance)
  const eventTime = parseInt(timestamp) * 1000;
  if (Math.abs(Date.now() - eventTime) > 300000) {
    return NextResponse.json({ error: "Timestamp too old" }, { status: 401 });
  }

  const event = JSON.parse(body);

  // Emit Inngest event for background processing
  await inngest.send({
    name: "billing.dodo.webhook.received",
    data: event,
  });

  return NextResponse.json({ received: true });
}
