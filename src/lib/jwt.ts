/**
 * src/lib/jwt.ts
 * JWT sign / verify using jose (Edge-runtime compatible).
 */

import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import type { JWTPayload } from "jose";

export const AUTH_COOKIE = "dwarik_auth";
export const TOKEN_EXPIRY = "7d";

// Lazy secret — evaluated at call time, not module load time.
// This prevents Vercel build/cold-start crashes when env vars are missing.
function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set.");
  }
  return new TextEncoder().encode(secret);
}

export interface JwtUser extends JWTPayload {
  sub: string;
  phone: string;
  role: "owner" | "employee";
  name: string;
}

export async function signToken(
  payload: Omit<JwtUser, keyof JWTPayload>,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtUser> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as JwtUser;
}

export async function verifyTokenSafe(token: string): Promise<JwtUser | null> {
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
