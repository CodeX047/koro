import DodoPayments from "dodopayments";

const apiKey = process.env.DODO_PAYMENTS_API_KEY;

// Throw error if API key is not present and we're not in test mode/build environment
if (!apiKey && process.env.NODE_ENV !== "test") {
  console.warn("DODO_PAYMENTS_API_KEY is not set. Billing functions may fail.");
}

export const dodo = new DodoPayments({
  bearerToken: apiKey || "test_key",
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT === "live" ? "live_mode" : "test_mode",
});
