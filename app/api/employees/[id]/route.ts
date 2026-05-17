/**
 * GET    /api/employees/[id]  — get a single employee (no password)
 * PATCH  /api/employees/[id]  — update name / phone / role
 * DELETE /api/employees/[id]  — remove an employee
 *
 * Falls back to mock data on GET when MongoDB is unavailable.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/app/models";
import { employees as mockEmployees } from "@/app/data/mockData";

type RouteParams = { params: Promise<{ id: string }> };

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    await connectDB();
    const employee = await Employee.findOne({ id }).select("-password").lean();

    if (employee) return NextResponse.json(employee);

    // Not in DB — check mock data
    const mock = mockEmployees.find((e) => e.id === id);
    if (mock) {
      const { password: _pw, ...safe } = mock;
      return NextResponse.json(safe);
    }

    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  } catch {
    const mock = mockEmployees.find((e) => e.id === id);
    if (mock) {
      const { password: _pw, ...safe } = mock;
      return NextResponse.json(safe);
    }
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    await connectDB();
    const body = await request.json();

    // Password changes must go through a dedicated endpoint (not built yet)
    delete body.password;
    delete body.id;

    // Validate role if provided
    if (body.role && !["owner", "employee"].includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check phone uniqueness if phone is being changed
    if (body.phone) {
      const conflict = await Employee.findOne({
        phone: body.phone,
        id: { $ne: id },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "Phone number already in use by another employee" },
          { status: 409 },
        );
      }
    }

    const employee = await Employee.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true, runValidators: true },
    )
      .select("-password")
      .lean();

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(employee);
  } catch (err) {
    console.error("[PATCH /api/employees/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 },
    );
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    await connectDB();
    const employee = await Employee.findOneAndDelete({ id }).lean();

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[DELETE /api/employees/[id]]", err);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 },
    );
  }
}
