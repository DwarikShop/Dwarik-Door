/**
 * PATCH /api/employees/[id]/role
 *
 * Dedicated role assignment endpoint.
 * Body: { role: 'owner' | 'employee' }
 *
 * Separated from the general PATCH so role changes are explicit and auditable.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/app/models";
import { verifyTokenSafe, AUTH_COOKIE } from "@/lib/jwt";
import { cookies } from "next/headers";
import type { UserRole } from "@/app/models/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  // Only owners can change roles
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const caller = token ? await verifyTokenSafe(token) : null;
  if (!caller || caller.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const { role } = (await request.json()) as { role: UserRole };

    if (!role || !["owner", "employee"].includes(role)) {
      return NextResponse.json(
        { error: "role must be 'owner' or 'employee'" },
        { status: 400 },
      );
    }

    const employee = await Employee.findOneAndUpdate(
      { id },
      { $set: { role } },
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
    console.error("[PATCH /api/employees/[id]/role]", err);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 },
    );
  }
}
