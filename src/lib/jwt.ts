/**
 * src/lib/jwt.ts
 *
 * JWT sign / verify utilities using `jose`.
 *
 * Why jose instead of jsonwebtoken:
 *   jose is Edge-runtime compatible — required for Next.js middleware.
 *
 * Why subpath imports (jose/jwt/sign, jose/jwt/verify):
 *   Importing from 'jose' pulls in the JWE (encryption) module which uses
 *   CompressionStream — a Node.js API unavailable in the Edge runtime.
 *   Subpath imports load only what we need (JWS signing/verifying) and
 *   eliminate the build warning entirely.
 *
 * Token payload: { sub: employeeId, phone, role, name, iat, exp }
 */

import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import type { JWTPayload } from "jose";

// ── Config ────────────────────────────────────────────────────────────────────

const RAW_SECRET = process.env.AUTH_SECRET;

if (!RAW_SECRET) {
  throw new Error(
    "❌  AUTH_SECRET is not defined.\n" +
      "Add a random 32-byte hex string to .env.local:\n" +
      "  AUTH_SECRET=<run: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\">",
  );
}

// jose requires a Uint8Array key
const SECRET = new TextEncoder().encode(RAW_SECRET);

/** Cookie name used throughout the app */
export const AUTH_COOKIE = "dwarik_auth";

/** Token lifetime */
export const TOKEN_EXPIRY = "7d";

// ── Payload type ──────────────────────────────────────────────────────────────

export interface JwtUser extends JWTPayload {
  /** Employee document id (e.g. "EMP-001") */
  sub: string;
  phone: string;
  role: "owner" | "employee";
  name: string;
}

// ── Sign ──────────────────────────────────────────────────────────────────────

/**
 * Create a signed JWT for the given employee.
 */
export async function signToken(
  payload: Omit<JwtUser, keyof JWTPayload>,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET);
}

// ── Verify ────────────────────────────────────────────────────────────────────

/**
 * Verify a JWT and return the typed payload.
 * Throws if the token is invalid or expired.
 */
export async function verifyToken(token: string): Promise<JwtUser> {
  const { payload } = await jwtVerify(token, SECRET);
  return payload as JwtUser;
}

/**
 * Verify a JWT and return the payload, or null if invalid/expired.
 * Safe to use in middleware — never throws.
 */
export async function verifyTokenSafe(token: string): Promise<JwtUser | null> {
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
