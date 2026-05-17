/**
 * GET   /api/orders/[id]  — get a single order (mock fallback)
 * PATCH /api/orders/[id]  — update non-status fields (assignedTo, customerName, etc.)
 *
 * For status transitions use PATCH /api/orders/[id]/status
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/app/models";
import { orders as mockOrders } from "@/app/data/mockData";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    await connectDB();
    const order = await Order.findOne({ id }).lean();

    if (order) return NextResponse.json(order);

    // Not in DB — check mock data
    const mock = mockOrders.find((o) => o.id === id);
    if (mock) return NextResponse.json(mock);

    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  } catch {
    const mock = mockOrders.find((o) => o.id === id);
    if (mock) return NextResponse.json(mock);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    await connectDB();
    const body = await request.json();

    // Prevent status changes through this endpoint — use /status instead
    delete body.status;
    delete body.id;

    const order = await Order.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true, runValidators: true },
    ).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error("[PATCH /api/orders/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
