import { db } from "@repo/database";
import { billingEventTable, invoiceTable } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { createSubscription, updateSubscription, getSubscriptionByOrgId } from "./repositories/subscription";

// The event payload types would normally be typed accurately from dodopayments SDK, 
// using any here for brevity but assuming typical structures.

export async function handleWebhookEvent(event: any) {
  const { webhook_id, type, data } = event;

  // Idempotency check
  const existingEvent = await db.select().from(billingEventTable).where(eq(billingEventTable.eventId, webhook_id)).limit(1);
  
  if (existingEvent.length > 0) {
    if (existingEvent[0]?.status === "processed") {
      return { status: "already_processed" };
    }
    // could increment retryCount here
  } else {
    // Record the event initially
    await db.insert(billingEventTable).values({
      eventId: webhook_id,
      eventType: type,
      status: "processing",
      receivedAt: new Date(event.timestamp || Date.now()),
    });
  }

  try {
    switch (type) {
      case "subscription.active":
      case "subscription.renewed":
      case "subscription.updated":
      case "subscription.plan_changed":
        await handleSubscriptionUpdated(data);
        break;
      case "subscription.cancelled":
      case "subscription.expired":
      case "subscription.failed":
        await handleSubscriptionCancelled(data);
        break;
      case "payment.succeeded":
        await handlePaymentSucceeded(data);
        break;
      // Handle credits if needed, or rely on Dodo's internal tracking via usage API
    }

    // Mark as processed
    await db.update(billingEventTable).set({ status: "processed", processedAt: new Date() }).where(eq(billingEventTable.eventId, webhook_id));
    
  } catch (error: any) {
    // Mark as failed
    await db.update(billingEventTable).set({ status: "failed", error: error.message }).where(eq(billingEventTable.eventId, webhook_id));
    throw error;
  }
}

async function handleSubscriptionUpdated(data: any) {
  // Extract fields
  const subscriptionId = data.subscription_id;
  const customerId = data.customer?.customer_id || data.customer_id;
  const planId = data.metadata?.planId || "PRO"; // Derive from product mapping in reality
  const organizationId = data.metadata?.organizationId;
  const status = data.status || "active";
  const currentPeriodEnd = new Date(data.current_period_end || Date.now());

  if (!organizationId) {
    console.error("Missing organizationId in subscription metadata");
    return;
  }

  const existingSub = await getSubscriptionByOrgId(organizationId);

  if (existingSub) {
    await updateSubscription(existingSub.subscriptionId, {
      planId,
      status,
      currentPeriodEnd,
    });
  } else {
    await createSubscription({
      organizationId,
      subscriptionId,
      customerId,
      planId,
      status,
      currentPeriodEnd,
    });
  }
}

async function handleSubscriptionCancelled(data: any) {
  const subscriptionId = data.subscription_id;
  const cancelAt = data.cancel_at_next_billing_date ? new Date(data.current_period_end) : new Date();

  await updateSubscription(subscriptionId, {
    status: "cancelled",
    cancelAtPeriodEnd: cancelAt,
  });
}

async function handlePaymentSucceeded(data: any) {
  const organizationId = data.metadata?.organizationId;
  if (!organizationId) return;

  await db.insert(invoiceTable).values({
    organizationId,
    invoiceId: data.payment_id,
    currency: data.currency,
    subtotal: data.total_amount, // simplifed, usually subtotal differs from total
    total: data.total_amount,
    status: "paid",
    paidAt: new Date(),
  });
}
