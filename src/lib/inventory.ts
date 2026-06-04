import { Order, Product, StatusHistory } from "@/app/models";

/**
 * Resolves backorders using FIFO logic.
 * Iterates over all active orders chronologically.
 * If physical stock covers the accumulated consumption, the order is PLACED.
 * If not, the order is BACKORDERED and its shortage is calculated.
 */
export async function resolveFIFOBackorders(productId: string, changedBy: string = "system") {
  const product = await Product.findOne({ id: productId });
  if (!product) return;

  // Find all active orders that consume reserved inventory
  const activeOrders = await Order.find({
    productId,
    status: { $in: ["placed", "backordered"] }
  }).sort({ createdAt: 1 });

  let consumedStock = 0;

  for (const order of activeOrders) {
    consumedStock += order.quantity;
    
    // Can this order be fully satisfied by the physical stock?
    if (product.stock >= consumedStock) {
      if (order.status === "backordered") {
        order.status = "placed";
        order.isInventoryShortage = false;
        order.shortageQuantity = 0;
        await order.save();
        
        await StatusHistory.create({
          orderId: order.id,
          fromStatus: "backordered",
          toStatus: "placed",
          changedBy,
          note: "BACKORDER_RESOLVED",
        });
      }
    } else {
      // Shortage exists for this order
      const shortage = consumedStock - product.stock;
      const orderShortage = Math.min(order.quantity, shortage);
      
      if (order.status === "placed") {
        order.status = "backordered";
        order.isInventoryShortage = true;
        order.shortageQuantity = orderShortage;
        await order.save();
        
        await StatusHistory.create({
          orderId: order.id,
          fromStatus: "placed",
          toStatus: "backordered",
          changedBy,
          note: "BACKORDER_CREATED",
        });
      } else if (order.status === "backordered" && order.shortageQuantity !== orderShortage) {
        // Just update the shortage quantity silently (or if it wasn't marked properly)
        order.isInventoryShortage = true;
        order.shortageQuantity = orderShortage;
        await order.save();
      }
    }
  }
}
