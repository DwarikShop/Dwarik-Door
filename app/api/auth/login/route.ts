/**
 * POST /api/auth/login
 *
 * Body: { phone: string, password: string }
 *
 * 1. Validates credentials against the Employee collection
 *    (falls back to mockData when DB is empty or unavailable)
 * 2. Signs a JWT containing { sub, phone, role, name }
 * 3. Sets the token as an httpOnly cookie (7-day expiry)
 * 4. Returns the safe employee object (no password)
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/app/models";
import { signToken, AUTH_COOKIE } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required" },
        { status: 400 },
      );
    }

    const cleanedPhone = phone.replace(/\D/g, "");
    const finalPhone = cleanedPhone.length > 10 ? cleanedPhone.slice(-10) : cleanedPhone;

    let found: {
      id: string;
      name: string;
      phone: string;
      role: "owner" | "employee";
    } | null = null;

    // ── Database Verification ─────────────────────────────────────────────
    try {
      await connectDB();
      // Find by phone first — avoids timing attacks from findOne({ phone, password })
      const byPhone = await Employee.findOne({ phone: finalPhone }).lean();
      if (byPhone && byPhone.password === password) {
        found = {
          id: byPhone.id,
          name: byPhone.name,
          phone: byPhone.phone,
          role: byPhone.role,
        };
      }
    } catch (err) {
      console.error("[POST /api/auth/login] DB Connection error:", err);
      return NextResponse.json(
        { error: "Database error or connection failed" },
        { status: 500 },
      );
    }

    if (!found) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // ── Sign JWT ──────────────────────────────────────────────────────────
    const token = await signToken({
      sub: found.id,
      phone: found.phone,
      role: found.role,
      name: found.name,
    });

    // ── Set cookie + return user ──────────────────────────────────────────
    const response = NextResponse.json({
      user: found,
      message: "Login successful",
    });

    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
