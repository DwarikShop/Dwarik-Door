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
import { employees as mockEmployees } from "@/app/data/mockData";
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

    let found: {
      id: string;
      name: string;
      phone: string;
      role: "owner" | "employee";
    } | null = null;

    // ── Try MongoDB first ─────────────────────────────────────────────────
    try {
      await connectDB();
      const doc = await Employee.findOne({ phone, password }).lean();
      if (doc) {
        found = {
          id: doc.id,
          name: doc.name,
          phone: doc.phone,
          role: doc.role,
        };
      }
    } catch {
      // DB connection failed — will fall through to mock data below
    }

    // ── Fall back to mock data if DB returned nothing ─────────────────────
    // This covers: DB empty (not seeded), DB unavailable, or wrong credentials
    if (!found) {
      const mock = mockEmployees.find(
        (e) => e.phone === phone && e.password === password,
      );
      if (mock) {
        found = {
          id: mock.id,
          name: mock.name,
          phone: mock.phone,
          role: mock.role,
        };
      }
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
