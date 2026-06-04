import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order, Product, StatusHistory } from "@/app/models";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  
  try {
    await connectDB();
    const order = await Order.findOne({ id });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    
    if (order.status !== "draft") {
      return NextResponse.json({ error: "Only draft orders can be converted" }, { status: 400 });
    }

    const product = await Product.findOne({ id: order.productId });
    if (!product) {
      return NextResponse.json({ error: `Product "${order.productId}" not found` }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const changedBy = body.changedBy || "system";

    const availableBeforeReservation = product.stock - product.reserved;
    const orderQuantity = order.quantity;

    if (availableBeforeReservation >= orderQuantity) {
      order.status = "placed";
    } else {
      order.status = "backordered";
      order.isInventoryShortage = true;
      order.shortageQuantity = Math.max(0, orderQuantity - availableBeforeReservation);
    }

    order.availableAtOrderTime = availableBeforeReservation;
    order.reservedQuantity = orderQuantity;
    
    product.reserved += orderQuantity;
    await product.save();
    
    await order.save();

    await StatusHistory.create({
      orderId: order.id,
      fromStatus: "draft",
      toStatus: order.status,
      changedBy,
      note: "DRAFT_CONVERTED_TO_ORDER",
    });

    return NextResponse.json(order.toObject());
  } catch (err) {
    console.error("[POST /api/orders/[id]/convert]", err);
    return NextResponse.json({ error: "Failed to convert order" }, { status: 500 });
  }
}
