/**
 * GET  /api/employees  — list all employees (passwords excluded)
 * POST /api/employees  — create a new employee
 *
 * Falls back to mock data when MongoDB is unavailable.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/app/models";
import { verifyTokenSafe, AUTH_COOKIE } from "@/lib/jwt";
import { cookies } from "next/headers";

async function requireOwner() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const caller = token ? await verifyTokenSafe(token) : null;
  return caller?.role === "owner" ? caller : null;
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    await connectDB();
    const employees = await Employee.find()
      .select("-password")
      .sort({ id: 1 })
      .lean();

    return NextResponse.json(employees);
  } catch (err) {
    console.error("[GET /api/employees]", err);
    return NextResponse.json(
      { error: "Failed to fetch employees from database" },
      { status: 500 },
    );
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!await requireOwner()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await connectDB();
    const { name, phone, password, role } = await request.json();

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "name, phone and password are required" },
        { status: 400 },
      );
    }

    const cleanedPhone = phone.replace(/\D/g, "");
    const finalPhone = cleanedPhone.length > 10 ? cleanedPhone.slice(-10) : cleanedPhone;

    // Check phone uniqueness
    const existing = await Employee.findOne({ phone: finalPhone });
    if (existing) {
      return NextResponse.json(
        { error: "An employee with this phone number already exists" },
        { status: 409 },
      );
    }

    // Auto-generate employee ID
    const count = await Employee.countDocuments();
    const id = `EMP-${String(count + 1).padStart(3, "0")}`;

    // TODO: hash password with bcrypt before production
    const employee = await Employee.create({
      id,
      name: name.trim(),
      phone: finalPhone,
      password,
      role: role || "employee",
    });

    // Return without password
    const { password: _pw, ...safe } = employee.toObject();
    return NextResponse.json(safe, { status: 201 });
  } catch (err) {
    console.error("[POST /api/employees]", err);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 },
    );
  }
}
