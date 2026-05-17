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

type RouteParams = { params: Promise<{ id: string }> };

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
        // Release reservation
        const prev = product.reserved;
        product.reserved = Math.max(0, product.reserved - qty);
        await product.save();
        await InventoryLog.create({
          productId: product.id,
          productName: product.name,
          field: "reserved",
          previousValue: prev,
          newValue: product.reserved,
          delta: -(prev - product.reserved),
          reason: "order_cancelled",
          orderId: id,
          changedBy,
        });
      }

      if (toStatus === "rejected") {
        // Always release reservation
        const prevReserved = product.reserved;
        product.reserved = Math.max(0, product.reserved - qty);
        await InventoryLog.create({
          productId: product.id,
          productName: product.name,
          field: "reserved",
          previousValue: prevReserved,
          newValue: product.reserved,
          delta: -(prevReserved - product.reserved),
          reason: "order_rejected",
          orderId: id,
          changedBy,
        });

        if (rejectReason === "damaged") {
          // Mark units as damaged
          const prevDamaged = product.damaged;
          product.damaged += qty;
          await InventoryLog.create({
            productId: product.id,
            productName: product.name,
            field: "damaged",
            previousValue: prevDamaged,
            newValue: product.damaged,
            delta: qty,
            reason: "damage_report",
            orderId: id,
            changedBy,
          });
        }
        // rejectReason === 'other': stock stays — units return to available automatically
        // (available = stock - reserved, and reserved was just decremented)

        await product.save();
      }

      if (toStatus === "shipped") {
        // Fulfil: decrement both reserved and total stock
        const prevReserved = product.reserved;
        const prevStock = product.stock;
        product.reserved = Math.max(0, product.reserved - qty);
        product.stock = Math.max(0, product.stock - qty);
        await product.save();

        await InventoryLog.create({
          productId: product.id,
          productName: product.name,
          field: "reserved",
          previousValue: prevReserved,
          newValue: product.reserved,
          delta: -(prevReserved - product.reserved),
          reason: "order_shipped",
          orderId: id,
          changedBy,
        });
        await InventoryLog.create({
          productId: product.id,
          productName: product.name,
          field: "stock",
          previousValue: prevStock,
          newValue: product.stock,
          delta: -(prevStock - product.stock),
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
