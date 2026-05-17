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
import { orders as mockOrders } from "@/app/data/mockData";
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

// Shared summary builder — works with both Mongoose lean docs and mock data
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

    // Fall back to mock data if DB is empty (not seeded yet)
    const source =
      orders.length === 0
        ? mockOrders.filter((o) => o.assignedTo === id)
        : orders;

    return NextResponse.json(buildSummary(id, source));
  } catch {
    // DB unavailable — use mock data
    const source = mockOrders.filter((o) => o.assignedTo === id);
    return NextResponse.json(buildSummary(id, source));
  }
}
