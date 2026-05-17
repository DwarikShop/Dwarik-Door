/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user from the JWT cookie.
 * Used by AuthContext on mount to rehydrate session after a page refresh.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyTokenSafe, AUTH_COOKIE } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await verifyTokenSafe(token);

  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: payload.sub,
      name: payload.name,
      phone: payload.phone,
      role: payload.role,
    },
  });
}
