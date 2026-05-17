/**
 * InventoryLog Mongoose model.
 *
 * Records every stock mutation as an immutable audit event.
 * Never update or delete these documents — append only.
 *
 * Example: when an order is placed for 2 units of DW-001,
 * a log entry is written:
 *   { productId: 'DW-001', field: 'reserved', delta: +2, reason: 'order_placed' }
 */

import mongoose, { Schema, type Document } from "mongoose";
import type { TInventoryLog, StockField, InventoryChangeReason } from "./types";

export interface IInventoryLog extends Omit<TInventoryLog, "id">, Document {}

const InventoryLogSchema = new Schema<IInventoryLog>(
  {
    productId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    field: {
      type: String,
      enum: ["stock", "reserved", "damaged"] satisfies StockField[],
      required: true,
    },
    previousValue: {
      type: Number,
      required: true,
    },
    newValue: {
      type: Number,
      required: true,
    },
    delta: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "order_placed",
        "order_cancelled",
        "order_shipped",
        "order_rejected",
        "manual_adjustment",
        "damage_report",
      ] satisfies InventoryChangeReason[],
      required: true,
    },
    orderId: {
      type: String,
      trim: true,
      index: true,
    },
    changedBy: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  {
    // createdAt only — these records are immutable, no updatedAt needed
    timestamps: { createdAt: true, updatedAt: false },
    // Prevent accidental updates to audit records
    strict: true,
  },
);

// Compound index for the most common query: all logs for a product, newest first
InventoryLogSchema.index({ productId: 1, createdAt: -1 });

// Index for fetching all logs triggered by a specific order
InventoryLogSchema.index({ orderId: 1, createdAt: -1 });

const InventoryLog =
  (mongoose.models.InventoryLog as mongoose.Model<IInventoryLog>) ||
  mongoose.model<IInventoryLog>("InventoryLog", InventoryLogSchema);

export default InventoryLog;
