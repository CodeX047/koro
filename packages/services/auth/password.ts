import { createHmac, timingSafeEqual } from "node:crypto";
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";

const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(password: string): Promise<string> {
  return argon2Hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  salt?: string | null,
): Promise<boolean> {
  if (storedHash.startsWith("$argon2")) {
    try {
      return await argon2Verify(storedHash, password);
    } catch {
      return false;
    }
  }

  if (!salt) return false;
  const computed = createHmac("sha256", salt).update(password).digest("hex");
  const a = Buffer.from(computed);
  const b = Buffer.from(storedHash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function needsRehash(storedHash: string): boolean {
  return !storedHash.startsWith("$argon2");
}
