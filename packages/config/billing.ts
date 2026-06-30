export const BILLING_PLANS = {
  FREE: {
    id: "FREE",
    aiReviewsAllowance: 20,
    repositoriesAllowance: 1,
    membersAllowance: 1,
    price: 0,
  },
  PRO: {
    id: "PRO",
    aiReviewsAllowance: 500,
    repositoriesAllowance: 1000, // virtually unlimited
    membersAllowance: 5,
    price: 2900, // 29.00
  },
  TEAM: {
    id: "TEAM",
    aiReviewsAllowance: 2000,
    repositoriesAllowance: 1000,
    membersAllowance: 20,
    price: 9900,
  },
} as const;

export type PlanId = keyof typeof BILLING_PLANS;
