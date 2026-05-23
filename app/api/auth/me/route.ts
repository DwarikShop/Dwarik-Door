/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user from the JWT cookie.
 * Used by AuthContext on mount to rehydrate session after a page refresh.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyTokenSafe, AUTH_COOKIE } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/app/models";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await verifyTokenSafe(token);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Verify the employee still exists in DB and get their current role
  // This ensures a demoted/deleted employee can't keep using a stale JWT
  try {
    await connectDB();
    const employee = await Employee.findOne({ id: payload.sub })
      .select("-password")
      .lean();

    if (!employee) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: employee.id,
        name: employee.name,
        phone: employee.phone,
        role: employee.role,
      },
    });
  } catch {
    // DB unavailable — fall back to JWT payload so app stays usable offline
    return NextResponse.json({
      user: {
        id: payload.sub,
        name: payload.name,
        phone: payload.phone,
        role: payload.role,
      },
    });
  }
}
