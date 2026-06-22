import * as JWT from "jsonwebtoken";
import { env } from "../env";
import { generateUserTokenPayload, type GenerateUserTokenPayloadType } from "./model";
import { InvalidTokenError } from "./errors";

export const TOKEN_ISSUER = "koro";
export const TOKEN_AUDIENCE = "koro-web";
export const TOKEN_EXPIRES_IN = "7d";

export async function signUserToken(payload: GenerateUserTokenPayloadType): Promise<string> {
  const { id } = await generateUserTokenPayload.parseAsync(payload);

  return JWT.sign({ id, ver: 1 }, env.JWT_SECRET, {
    subject: id,
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

export async function verifyUserToken(token: string): Promise<GenerateUserTokenPayloadType> {
  try {
    const decoded = JWT.verify(token, env.JWT_SECRET, {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });

    return await generateUserTokenPayload.parseAsync(decoded);
  } catch {
    throw new InvalidTokenError();
  }
}
