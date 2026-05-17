/**
 * GET  /api/employees  — list all employees (passwords excluded)
 * POST /api/employees  — create a new employee
 *
 * Falls back to mock data when MongoDB is unavailable.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/app/models";
import { employees as mockEmployees } from "@/app/data/mockData";

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    await connectDB();
    const employees = await Employee.find()
      .select("-password")
      .sort({ id: 1 })
      .lean();

    // Fall back to mock data if DB is empty (not seeded yet)
    if (employees.length === 0) {
      return NextResponse.json(
        mockEmployees.map(({ password: _pw, ...e }) => e),
      );
    }

    return NextResponse.json(employees);
  } catch {
    // DB unavailable — return mock data without passwords
    return NextResponse.json(mockEmployees.map(({ password: _pw, ...e }) => e));
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, phone, password, role } = await request.json();

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "name, phone and password are required" },
        { status: 400 },
      );
    }

    // Check phone uniqueness
    const existing = await Employee.findOne({ phone });
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
      phone: phone.trim(),
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
