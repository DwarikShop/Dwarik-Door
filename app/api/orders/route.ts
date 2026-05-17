/**
 * GET  /api/orders  — list ALL orders (visible to everyone — no assignment filter)
 * POST /api/orders  — create a new order + reserve stock
 *
 * Assignment is removed for now. All employees see all orders and can
 * pick them up as a progress ladder. Assignment can be added later.
 *
 * Falls back to mock data when MongoDB is unavailable.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order, Product, InventoryLog, StatusHistory } from "@/app/models";
import { orders as mockOrders } from "@/app/data/mockData";

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find().sort({ updatedAt: -1 }).lean();

    // Fall back to mock data if DB is empty (not seeded yet)
    if (orders.length === 0) {
      return NextResponse.json(mockOrders);
    }

    return NextResponse.json(orders);
  } catch {
    // DB unavailable — return mock data
    return NextResponse.json(mockOrders);
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      productId,
      productName,
      productImage,
      height,
      width,
      unit,
      customization,
      quantity,
      customerName,
      customerPhone,
      changedBy,
    } = body;

    if (!productId || !quantity || !height || !width) {
      return NextResponse.json(
        { error: "productId, quantity, height and width are required" },
        { status: 400 },
      );
    }

    // Generate order ID
    const count = await Order.countDocuments();
    const orderId = `ORD-${String(count + 1).padStart(3, "0")}`;

    // ── Reserve stock ─────────────────────────────────────────────────────────
    const product = await Product.findOne({ id: productId });

    if (product) {
      const previousReserved = product.reserved;
      product.reserved += quantity;
      await product.save();

      await InventoryLog.create({
        productId,
        productName: product.name,
        field: "reserved",
        previousValue: previousReserved,
        newValue: product.reserved,
        delta: quantity,
        reason: "order_placed",
        orderId,
        changedBy: changedBy || "system",
      });
    }

    // ── Create order (no assignedTo) ──────────────────────────────────────────
    const order = await Order.create({
      id: orderId,
      productId,
      productName,
      productImage,
      height,
      width,
      unit: unit || "inch",
      customization,
      quantity,
      status: "placed",
      customerName,
      customerPhone,
    });

    // ── Write initial status history ──────────────────────────────────────────
    await StatusHistory.create({
      orderId,
      fromStatus: null,
      toStatus: "placed",
      changedBy: changedBy || "system",
      note: "Order created",
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
