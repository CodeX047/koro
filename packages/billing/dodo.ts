import DodoPayments from "dodopayments";

const apiKey = process.env.DODO_PAYMENTS_API_KEY;

export const dodo = new DodoPayments({
  bearerToken: apiKey || "test_key",
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT === "live" ? "live_mode" : "test_mode",
});
