/**
 * StatusHistory Mongoose model.
 *
 * Records every order status transition as an immutable audit event.
 * Never update or delete these documents — append only.
 *
 * Example: when an employee starts work on ORD-001,
 * a history entry is written:
 *   { orderId: 'ORD-001', fromStatus: 'placed', toStatus: 'in_progress', changedBy: 'EMP-002' }
 */

import mongoose, { Schema, type Document } from "mongoose";
import type { TStatusHistory, OrderStatus } from "./types";

export interface IStatusHistory extends Omit<TStatusHistory, "id">, Document {}

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    orderId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    fromStatus: {
      type: String,
      enum: [
        null,
        "placed",
        "in_progress",
        "done",
        "shipped",
        "cancelled",
        "rejected",
      ] satisfies (OrderStatus | null)[],
      default: null,
    },
    toStatus: {
      type: String,
      enum: [
        "placed",
        "in_progress",
        "done",
        "shipped",
        "cancelled",
        "rejected",
      ] satisfies OrderStatus[],
      required: true,
    },
    changedBy: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    // createdAt only — these records are immutable
    timestamps: { createdAt: true, updatedAt: false },
    strict: true,
  },
);

// Fetch full timeline for an order, oldest first
StatusHistorySchema.index({ orderId: 1, createdAt: 1 });

const StatusHistory =
  (mongoose.models.StatusHistory as mongoose.Model<IStatusHistory>) ||
  mongoose.model<IStatusHistory>("StatusHistory", StatusHistorySchema);

export default StatusHistory;
