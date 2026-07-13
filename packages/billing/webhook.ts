import crypto from "crypto";

export function verifyWebhook(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string,
): boolean {
  if (!signature || !timestamp || !secret) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("base64");

  // Extract signature from "v1,signature" format
  const providedSig = signature.split(",")[1] || signature;

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSig));
  } catch (e) {
    // If buffers are not the same length, timingSafeEqual throws
    return false;
  }
}
