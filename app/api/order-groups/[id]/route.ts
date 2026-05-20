/**
 * GET /api/order-groups/[id]         — get group + all its child orders
 * PATCH /api/order-groups/[id]       — update group status / totalItems
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { OrderGroup, Order } from "@/app/models";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    await connectDB();
    const group = await OrderGroup.findOne({ id }).lean();
    if (!group)
      return NextResponse.json({ error: "Group not found" }, { status: 404 });

    // Fetch all child orders for this group
    const orders = await Order.find({ groupId: id })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ group, orders });
  } catch (err) {
    console.error("[GET /api/order-groups/[id]]", err);
    return NextResponse.json(
      { error: "Failed to fetch group" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    await connectDB();
    const body = await request.json();
    delete body.id;

    const group = await OrderGroup.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true, runValidators: true },
    ).lean();

    if (!group)
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    return NextResponse.json(group);
  } catch (err) {
    console.error("[PATCH /api/order-groups/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 },
    );
  }
}
