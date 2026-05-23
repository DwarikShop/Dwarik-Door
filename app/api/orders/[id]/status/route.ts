/**
 * PATCH /api/orders/[id]/status
 *
 * Dedicated status transition endpoint.
 * Enforces valid transitions, applies inventory rules, and writes audit logs.
 *
 * Body: { toStatus, changedBy, note?, rejectReason? }
 *
 * ── Inventory rules ───────────────────────────────────────────────────────────
 *
 *  placed → cancelled
 *    product.reserved -= order.quantity          (release reservation)
 *
 *  placed / in_progress → rejected (reason: damaged)
 *    product.reserved -= order.quantity          (release reservation)
 *    product.damaged  += order.quantity          (mark as damaged)
 *
 *  placed / in_progress → rejected (reason: other)
 *    product.reserved -= order.quantity          (release reservation)
 *    product.stock    stays the same             (stock returned to available)
 *
 *  done → shipped
 *    product.reserved -= order.quantity          (fulfil reservation)
 *    product.stock    -= order.quantity          (decrement total stock)
 *
 * ── Valid transitions ─────────────────────────────────────────────────────────
 *  placed      → in_progress | cancelled | rejected
 *  in_progress → done        | rejected
 *  done        → shipped
 *  shipped / cancelled / rejected → (terminal — no further transitions)
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order, Product, InventoryLog, StatusHistory } from "@/app/models";
import type { OrderStatus } from "@/app/models/types";
import { verifyTokenSafe, AUTH_COOKIE } from "@/lib/jwt";
import { cookies } from "next/headers";

type RouteParams = { params: Promise<{ id: string }> };

// Transitions only owners can trigger
const OWNER_ONLY_TRANSITIONS: OrderStatus[] = ["cancelled"];

// Valid transitions map
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["in_progress", "cancelled", "rejected"],
  in_progress: ["done", "rejected"],
  done: ["shipped"],
  shipped: [],
  cancelled: [],
  rejected: [],
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  // Verify caller role from JWT
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const caller = token ? await verifyTokenSafe(token) : null;
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { toStatus, changedBy, note, rejectReason } =
      (await request.json()) as {
        toStatus: OrderStatus;
        changedBy: string;
        note?: string;
        rejectReason?: "damaged" | "other";
      };

    if (!toStatus || !changedBy) {
      return NextResponse.json(
        { error: "toStatus and changedBy are required" },
        { status: 400 },
      );
    }

    // Owner-only transitions
    if (OWNER_ONLY_TRANSITIONS.includes(toStatus) && caller.role !== "owner") {
      return NextResponse.json(
        { error: `Only owners can mark an order as '${toStatus}'` },
        { status: 403 },
      );
    }

    // Rejection requires both a reason category and a note
    if (toStatus === "rejected") {
      if (!rejectReason || !["damaged", "other"].includes(rejectReason)) {
        return NextResponse.json(
          { error: "rejectReason is required ('damaged' or 'other')" },
          { status: 400 },
        );
      }
      if (!note?.trim()) {
        return NextResponse.json(
          { error: "A rejection note is required" },
          { status: 400 },
        );
      }
    }

    // ── Load order ────────────────────────────────────────────────────────────
    const order = await Order.findOne({ id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const fromStatus = order.status as OrderStatus;

    // ── Validate transition ───────────────────────────────────────────────────
    if (!VALID_TRANSITIONS[fromStatus].includes(toStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from '${fromStatus}' to '${toStatus}'` },
        { status: 422 },
      );
    }

    // ── Apply inventory rules ─────────────────────────────────────────────────
    const product = await Product.findOne({ id: order.productId });

    if (product) {
      const qty = order.quantity;

      if (toStatus === "cancelled") {
        await Product.findOneAndUpdate(
          { id: product.id },
          { $inc: { reserved: -qty } },
        );
        await InventoryLog.create({
          productId: product.id,
          productName: product.name,
          field: "reserved",
          previousValue: product.reserved,
          newValue: Math.max(0, product.reserved - qty),
          delta: -qty,
          reason: "order_cancelled",
          orderId: id,
          changedBy,
        });
      }

      if (toStatus === "rejected") {
        await Product.findOneAndUpdate(
          { id: product.id },
          { $inc: { reserved: -qty, ...(rejectReason === "damaged" ? { damaged: qty } : {}) } },
        );
        await InventoryLog.create({
          productId: product.id,
          productName: product.name,
          field: "reserved",
          previousValue: product.reserved,
          newValue: Math.max(0, product.reserved - qty),
          delta: -qty,
          reason: "order_rejected",
          orderId: id,
          changedBy,
        });
        if (rejectReason === "damaged") {
          await InventoryLog.create({
            productId: product.id,
            productName: product.name,
            field: "damaged",
            previousValue: product.damaged,
            newValue: product.damaged + qty,
            delta: qty,
            reason: "damage_report",
            orderId: id,
            changedBy,
          });
        }
      }

      if (toStatus === "shipped") {
        await Product.findOneAndUpdate(
          { id: product.id },
          { $inc: { reserved: -qty, stock: -qty } },
        );
        await InventoryLog.create({
          productId: product.id,
          productName: product.name,
          field: "reserved",
          previousValue: product.reserved,
          newValue: Math.max(0, product.reserved - qty),
          delta: -qty,
          reason: "order_shipped",
          orderId: id,
          changedBy,
        });
        await InventoryLog.create({
          productId: product.id,
          productName: product.name,
          field: "stock",
          previousValue: product.stock,
          newValue: Math.max(0, product.stock - qty),
          delta: -qty,
          reason: "order_shipped",
          orderId: id,
          changedBy,
        });
      }
    }

    // ── Update order status ───────────────────────────────────────────────────
    order.status = toStatus;
    await order.save();

    // ── Write status history ──────────────────────────────────────────────────
    await StatusHistory.create({
      orderId: id,
      fromStatus,
      toStatus,
      changedBy,
      note: note || undefined,
    });

    return NextResponse.json(order.toObject());
  } catch (err) {
    console.error("[PATCH /api/orders/[id]/status]", err);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}
