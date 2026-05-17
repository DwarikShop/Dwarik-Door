/**
 * POST /api/auth/logout
 *
 * Clears the auth cookie. No body required.
 */

import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/jwt";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // expire immediately
  });

  return response;
}
