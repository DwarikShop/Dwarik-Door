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
import { verifyTokenSafe, AUTH_COOKIE } from "@/lib/jwt";
import { cookies } from "next/headers";

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

  // Read role from JWT — never trust the client-supplied ?role= param
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const caller = token ? await verifyTokenSafe(token) : null;
  const role = caller?.role ?? "employee"; // default to most restrictive

  try {
    await connectDB();

    // ── Build filter ────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    const groupId = searchParams.get("groupId") ?? "";
    if (groupId) {
      filter.groupId = groupId;
    }

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
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(orders);
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
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
      packaging,
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

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        { error: "quantity must be a positive integer" },
        { status: 400 },
      );
    }

    if (!customerName?.trim()) {
      return NextResponse.json(
        { error: "customerName is required" },
        { status: 400 },
      );
    }

    if (!customerPhone?.trim()) {
      return NextResponse.json(
        { error: "customerPhone is required" },
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
      packaging: packaging || "plastic",
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
