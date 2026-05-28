/**
 * GET /api/employees/[id]/activity
 *
 * Returns order activity summary for an employee:
 * - Total orders assigned
 * - Counts by status
 * - Recent 5 orders
 *
 * Falls back to mock data when MongoDB is unavailable.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/app/models";
import type { OrderStatus } from "@/app/models/types";

type RouteParams = { params: Promise<{ id: string }> };

const ALL_STATUSES: OrderStatus[] = [
  "placed",
  "in_progress",
  "done",
  "shipped",
  "cancelled",
  "rejected",
];

// Shared summary builder — works with Mongoose lean docs
function buildSummary(
  employeeId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: any[],
) {
  const statusCounts = ALL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = source.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return {
    employeeId,
    totalAssigned: source.length,
    statusCounts,
    recentOrders: source.slice(0, 5).map((o) => ({
      id: o.id as string,
      productName: o.productName as string,
      status: o.status as OrderStatus,
      updatedAt: o.updatedAt ?? null,
    })),
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    await connectDB();
    const orders = await Order.find({ assignedTo: id })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(buildSummary(id, orders));
  } catch (err) {
    console.error(`[GET /api/employees/${id}/activity]`, err);
    return NextResponse.json(
      { error: "Failed to fetch employee activity from database" },
      { status: 500 },
    );
  }
}
