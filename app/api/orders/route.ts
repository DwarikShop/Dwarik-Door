/**
 * GET  /api/orders
 *
 * Query params:
 *   ?role=owner|employee   — controls visibility rules
 *   ?search=text           — searches id, productName, customerName
 *   ?status=placed|...     — filter by status
 *   ?limit=20              — max results (default 20, max 100)
 *
 * Owner rules:
 *   - All statuses visible
 *   - Default: latest 20 by updatedAt
 *   - Search: real-time DB query, returns up to 20 matches
 *
 * Employee rules:
 *   - placed, in_progress, done — always visible
 *   - shipped — only last 10 days
 *   - cancelled, rejected — hidden
 *
 * POST /api/orders — create a new order + reserve stock
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import {
  Order,
  OrderGroup,
  Product,
  InventoryLog,
  StatusHistory,
} from "@/app/models";
import { orders as mockOrders } from "@/app/data/mockData";

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") ?? "owner";
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

  try {
    await connectDB();

    // ── Build filter ────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (role === "employee") {
      // Employees see active orders + shipped within last 10 days
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      filter.$or = [
        { status: { $in: ["placed", "in_progress", "done"] } },
        { status: "shipped", updatedAt: { $gte: tenDaysAgo } },
      ];
    }
    // Owners see everything — no status filter unless explicitly requested

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$and = [
        ...(filter.$and ?? []),
        {
          $or: [
            { id: { $regex: search, $options: "i" } },
            { productName: { $regex: search, $options: "i" } },
            { customerName: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    const orders = await Order.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    // Fall back to mock data if DB is empty
    if (orders.length === 0 && !search && !status) {
      const mock =
        role === "employee"
          ? applyEmployeeFilter(mockOrders)
          : mockOrders.slice(0, limit);
      return NextResponse.json(mock);
    }

    return NextResponse.json(orders);
  } catch {
    // DB unavailable — return filtered mock data
    const mock =
      role === "employee"
        ? applyEmployeeFilter(mockOrders)
        : mockOrders.slice(0, limit);
    return NextResponse.json(mock);
  }
}

/** Apply employee visibility rules to mock data */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyEmployeeFilter(orders: any[]) {
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  return orders.filter((o) => {
    if (["placed", "in_progress", "done"].includes(o.status)) return true;
    if (o.status === "shipped") {
      const updated =
        o.updatedAt instanceof Date ? o.updatedAt : new Date(o.updatedAt);
      return updated >= tenDaysAgo;
    }
    return false;
  });
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
      freeSize,
      customization,
      quantity,
      customerName,
      customerPhone,
      groupId,
      orderType,
      changedBy,
    } = body;

    // Phone validation — exactly 10 digits
    if (customerPhone && !/^\d{10}$/.test(customerPhone.replace(/\s/g, ""))) {
      return NextResponse.json(
        { error: "Customer phone must be exactly 10 digits" },
        { status: 400 },
      );
    }

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "productId and quantity are required" },
        { status: 400 },
      );
    }

    // Dimensions required unless freeSize is true
    if (!freeSize && (!height || !width)) {
      return NextResponse.json(
        { error: "Height and width are required (or enable Free Size)" },
        { status: 400 },
      );
    }

    const count = await Order.countDocuments();
    const orderId = `ORD-${String(count + 1).padStart(3, "0")}`;

    // ── Hard stock check — block if quantity exceeds available ────────────
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return NextResponse.json(
        { error: `Product "${productId}" not found in inventory` },
        { status: 404 },
      );
    }

    const availableStock = product.stock - product.reserved;
    if (quantity > availableStock) {
      return NextResponse.json(
        {
          error:
            availableStock <= 0
              ? `"${product.name}" is out of stock. No units available.`
              : `Insufficient stock for "${product.name}". Only ${availableStock} unit${availableStock !== 1 ? "s" : ""} available. Requested: ${quantity}.`,
        },
        { status: 422 },
      );
    }

    // Reserve stock
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

    const order = await Order.create({
      id: orderId,
      productId,
      productName,
      productImage,
      height: freeSize ? 0 : height,
      width: freeSize ? 0 : width,
      unit: unit || "inch",
      freeSize: !!freeSize,
      customization,
      quantity,
      status: "placed",
      customerName,
      customerPhone,
      groupId: groupId || undefined,
      orderType: orderType || "single",
    });

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
