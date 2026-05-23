/**
 * POST /api/employees/[id]/change-password
 *
 * Self-change: requires { currentPassword, newPassword }
 * Owner reset: requires owner role token, only { newPassword } needed
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/app/models";
import { verifyTokenSafe, AUTH_COOKIE } from "@/lib/jwt";
import { cookies } from "next/headers";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    const caller = token ? await verifyTokenSafe(token) : null;

    if (!caller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { error: "New password must be at least 4 characters" },
        { status: 400 },
      );
    }

    await connectDB();
    // Use lean: false so we can read the password field (toJSON strips it)
    const employee = await Employee.findOne({ id });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const isSelf = caller.sub === id;
    const isOwner = caller.role === "owner";

    if (!isSelf && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Self-change requires current password verification
    if (isSelf && !isOwner) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 },
        );
      }
      if (employee.password !== currentPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 },
        );
      }
    }

    employee.password = newPassword;
    await employee.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/employees/[id]/change-password]", err);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}
