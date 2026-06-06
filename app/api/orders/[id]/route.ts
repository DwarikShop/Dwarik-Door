/**
 * GET   /api/orders/[id]  — get a single order (mock fallback)
 * PATCH /api/orders/[id]  — update non-status fields (assignedTo, customerName, etc.)
 *
 * For status transitions use PATCH /api/orders/[id]/status
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { Order, Product, StatusHistory, InventoryLog } from "@/app/models";
import { AUTH_COOKIE, verifyTokenSafe } from "@/lib/jwt";
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
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    const user = token ? await verifyTokenSafe(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    // Whitelist — what fields can be updated via this endpoint
    const allowed = [
      "assignedTo",
      "customerName",
      "customerPhone",
      "customization",
      "productId",
      "productName",
      "productImage",
      "quantity",
      "height",
      "width",
      "unit",
      "groupId",
      "orderType",
      "status",
      "packaging",
      "freeSize"
    ];
    const update: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    const order = await Order.findOne({ id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow editing placed/backordered orders if the user is an owner
    if (order.status !== "draft" && user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden: Only owners can edit placed orders" }, { status: 403 });
    }

    if (["in_progress", "done", "shipped", "cancelled", "rejected"].includes(order.status)) {
      // For processed or cancelled orders, ONLY allow customer details to be updated.
      const restrictedUpdate: any = {};
      if (update.customerName) restrictedUpdate.customerName = update.customerName;
      if (update.customerPhone) restrictedUpdate.customerPhone = update.customerPhone;
      
      if (Object.keys(restrictedUpdate).length === 0) {
        return NextResponse.json(order); // No allowed fields updated, silently return
      }

      await Order.updateOne({ id }, { $set: restrictedUpdate });
      return NextResponse.json({ ...order, ...restrictedUpdate });
    }

    const changedBy = body.changedBy || "system";
    let inventoryFreed = false;
    let oldProductId = order.productId;
    let draftConverted = false;

    // Handle status change from draft to placed/backordered
    if (order.status === "draft" && update.status && update.status !== "draft") {
      const finalProductId = update.productId || order.productId;
      const product = await Product.findOne({ id: finalProductId });
      if (!product) {
        return NextResponse.json({ error: `Product "${finalProductId}" not found` }, { status: 404 });
      }

      const finalQuantity = update.quantity !== undefined ? update.quantity : order.quantity;
      const availableBeforeReservation = product.stock - product.reserved;

      if (availableBeforeReservation >= finalQuantity) {
        order.status = "placed";
        order.isInventoryShortage = false;
        order.shortageQuantity = 0;
      } else {
        order.status = "backordered";
        order.isInventoryShortage = true;
        order.shortageQuantity = Math.max(0, finalQuantity - availableBeforeReservation);
      }

      order.availableAtOrderTime = availableBeforeReservation;
      order.reservedQuantity = finalQuantity;

      product.reserved += finalQuantity;
      await product.save();

      const { StatusHistory } = await import("@/app/models");
      await StatusHistory.create({
        orderId: order.id,
        fromStatus: "draft",
        toStatus: order.status,
        changedBy,
        note: "DRAFT_CONVERTED_TO_ORDER",
      });
      draftConverted = true;
    }

    // Handle Product Change
    if (update.productId && update.productId !== order.productId) {
      if (order.status !== "draft" && !draftConverted) {
        const oldProduct = await Product.findOne({ id: order.productId });
        const newProduct = await Product.findOne({ id: update.productId });
        
        if (!newProduct) {
          return NextResponse.json({ error: "New product not found" }, { status: 404 });
        }

        // Release from old product
        if (oldProduct) {
          oldProduct.reserved -= (order.reservedQuantity ?? 0);
          await oldProduct.save();
          inventoryFreed = true;
        }

        // Reserve on new product
        const newQty = update.quantity !== undefined ? update.quantity : order.quantity;
        const availableBeforeReservation = newProduct.stock - newProduct.reserved;
        
        newProduct.reserved += newQty;
        await newProduct.save();

        if (availableBeforeReservation >= newQty) {
          order.status = "placed";
          order.isInventoryShortage = false;
          order.shortageQuantity = 0;
        } else {
          order.status = "backordered";
          order.isInventoryShortage = true;
          order.shortageQuantity = Math.max(0, newQty - availableBeforeReservation);
        }
        order.availableAtOrderTime = availableBeforeReservation;
        order.reservedQuantity = newQty;
      }
      
      const { StatusHistory } = await import("@/app/models");
      await StatusHistory.create({
        orderId: order.id,
        fromStatus: order.status,
        toStatus: order.status, // might have changed to placed/backordered above
        changedBy,
        note: "ORDER_PRODUCT_CHANGED",
      });
    } 
    // Handle Quantity Change (if product didn't change)
    else if (update.quantity !== undefined && update.quantity !== order.quantity) {
      if (order.status !== "draft" && !draftConverted) {
        const product = await Product.findOne({ id: order.productId });
        if (product) {
          const delta = update.quantity - order.quantity;
          
          // Revert old reservation conceptually to find available before this update
          const availableBeforeUpdate = product.stock - (product.reserved - (order.reservedQuantity ?? 0));
          
          product.reserved += delta;
          await product.save();
          
          if (delta < 0) {
            inventoryFreed = true;
          }

          if (availableBeforeUpdate >= update.quantity) {
            order.status = "placed";
            order.isInventoryShortage = false;
            order.shortageQuantity = 0;
          } else {
            order.status = "backordered";
            order.isInventoryShortage = true;
            order.shortageQuantity = Math.max(0, update.quantity - availableBeforeUpdate);
          }
          order.availableAtOrderTime = availableBeforeUpdate;
          order.reservedQuantity = update.quantity;
        }
      }
      
      const { StatusHistory } = await import("@/app/models");
      await StatusHistory.create({
        orderId: order.id,
        fromStatus: order.status,
        toStatus: order.status,
        changedBy,
        note: "ORDER_EDITED",
      });
    }

    // Apply the rest of the updates
    for (const key in update) {
      if (
        key !== "productId" &&
        key !== "quantity" &&
        key !== "groupId" &&
        key !== "orderType" &&
        key !== "status"
      ) {
        (order as any)[key] = update[key];
      }
    }
    if (update.productId) order.productId = update.productId;
    if (update.productName) order.productName = update.productName;
    if (update.productImage) order.productImage = update.productImage;
    if (update.quantity !== undefined) order.quantity = update.quantity;

    if (update.orderType === "single") {
      order.groupId = undefined;
    } else if ("groupId" in update) {
      order.groupId = update.groupId;
    }
    if ("orderType" in update) {
      order.orderType = update.orderType;
    }

    await order.save();

    if (inventoryFreed && oldProductId) {
      const { resolveFIFOBackorders } = await import("@/lib/inventory");
      await resolveFIFOBackorders(oldProductId, changedBy);
    }

    return NextResponse.json(order.toObject());
  } catch (err) {
    console.error("[PATCH /api/orders/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    const user = token ? await verifyTokenSafe(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const order = await Order.findOne({ id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "draft" && order.status !== "cancelled") {
      return NextResponse.json(
        { error: "Only draft and cancelled orders can be deleted" },
        { status: 400 }
      );
    }

    // Delete the order
    await Order.deleteOne({ id });

    // Delete associated history and logs
    await StatusHistory.deleteMany({ orderId: id });
    await InventoryLog.deleteMany({ orderId: id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/orders/[id]]", err);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 },
    );
  }
}
