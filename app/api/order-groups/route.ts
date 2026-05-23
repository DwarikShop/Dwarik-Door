/**
 * GET  /api/order-groups  — list all order groups
 * POST /api/order-groups  — create a new order group
 *
 * An order group is a parent record linking multiple orders from one customer.
 * Individual orders are created separately via POST /api/orders with groupId set.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { OrderGroup, Order } from "@/app/models";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  try {
    await connectDB();
    const filter = phone ? { customerPhone: phone } : {};
    const groups = await OrderGroup.find(filter).sort({ updatedAt: -1 }).lean();
    return NextResponse.json(groups);
  } catch (err) {
    console.error("[GET /api/order-groups]", err);
    return NextResponse.json(
      { error: "Failed to fetch order groups" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { customerName, customerPhone } = await request.json();

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: "customerName and customerPhone are required" },
        { status: 400 },
      );
    }

    if (!/^\d{10}$/.test(customerPhone.replace(/\s/g, ""))) {
      return NextResponse.json(
        { error: "Customer phone must be exactly 10 digits" },
        { status: 400 },
      );
    }

    const count = await OrderGroup.countDocuments();
    const id = `GRP-${String(count + 1).padStart(3, "0")}`;

    const group = await OrderGroup.create({
      id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      status: "active",
    });

    return NextResponse.json(group, { status: 201 });
  } catch (err) {
    console.error("[POST /api/order-groups]", err);
    return NextResponse.json(
      { error: "Failed to create order group" },
      { status: 500 },
    );
  }
}
