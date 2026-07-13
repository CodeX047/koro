import { getSubscriptionByOrgId } from "./repositories/subscription";
import { BILLING_PLANS, PlanId } from "@repo/config";
import { db } from "@repo/database";
import { usageTable } from "@repo/database/schema";
import { eq, and } from "drizzle-orm";

export async function getActivePlan(
  organizationId: string,
): Promise<(typeof BILLING_PLANS)[PlanId]> {
  const sub = await getSubscriptionByOrgId(organizationId);
  const planId = (sub?.planId as PlanId) || "FREE";
  return BILLING_PLANS[planId] || BILLING_PLANS.FREE;
}

export async function canCreateRepository(organizationId: string): Promise<boolean> {
  const plan = await getActivePlan(organizationId);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const usageResult = await db
    .select()
    .from(usageTable)
    .where(and(eq(usageTable.organizationId, organizationId), eq(usageTable.month, currentMonth)))
    .limit(1);
  const usage = usageResult[0];
  const reposUsed = usage?.repositoriesUsed || 0;

  return reposUsed < plan.repositoriesAllowance;
}

export async function canRunAIReview(organizationId: string): Promise<boolean> {
  const plan = await getActivePlan(organizationId);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const usageResult = await db
    .select()
    .from(usageTable)
    .where(and(eq(usageTable.organizationId, organizationId), eq(usageTable.month, currentMonth)))
    .limit(1);
  const usage = usageResult[0];
  const aiReviewsUsed = usage?.aiReviewsUsed || 0;

  return aiReviewsUsed < plan.aiReviewsAllowance;
}

export async function canUsePremiumWorkflow(organizationId: string): Promise<boolean> {
  const plan = await getActivePlan(organizationId);
  return plan.id !== "FREE";
}

export async function canInviteMember(
  organizationId: string,
  currentMemberCount: number,
): Promise<boolean> {
  const plan = await getActivePlan(organizationId);
  return currentMemberCount < plan.membersAllowance;
}
