import mongoose from 'mongoose';
import Order from './src/app/models/Order';
import StatusHistory from './src/app/models/StatusHistory';
import connectDB from './src/lib/mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  try {
    await connectDB();
    console.log("Connected to DB");

    // Mock API logic
    const orderId = `ORD-TEST-${Date.now()}`;
    const order = await Order.create({
      id: orderId,
      productId: "UNSELECTED",
      productName: "Draft Unspecified Product",
      productImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop",
      height: 0,
      width: 0,
      unit: "inch",
      packaging: "plastic",
      freeSize: false,
      customization: undefined,
      quantity: 1,
      status: "draft",
      customerName: "",
      customerPhone: "",
      groupId: undefined,
      orderType: "single",
      isInventoryShortage: false,
      shortageQuantity: 0,
      availableAtOrderTime: 0,
      reservedQuantity: 0,
    });
    console.log("Order created:", order.id);

    await StatusHistory.create({
      orderId,
      fromStatus: null,
      toStatus: "draft",
      changedBy: "system",
      note: "DRAFT_CREATED",
    });
    console.log("StatusHistory created");

    // Cleanup
    await Order.deleteOne({ id: orderId });
    await StatusHistory.deleteOne({ orderId });
    process.exit(0);
  } catch (err) {
    console.error("ERROR CAUGHT:", err);
    process.exit(1);
  }
}

test();
