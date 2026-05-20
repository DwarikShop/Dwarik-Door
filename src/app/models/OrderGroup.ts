/**
 * OrderGroup Mongoose model.
 *
 * Parent record for multi-item (group) orders from one customer.
 * Individual orders within the group each have groupId pointing here.
 * Group status is derived from child orders — active until all are shipped.
 */

import mongoose, { Schema, type Document } from "mongoose";
import type { TOrderGroup } from "./types";

export interface IOrderGroup
  extends Omit<TOrderGroup, "id" | "createdAt" | "updatedAt">, Document {
  id: string;
}

const OrderGroupSchema = new Schema<IOrderGroup>(
  {
    id: { type: String, required: true, unique: true, trim: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true, index: true },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    totalItems: { type: Number, required: true, min: 0, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const OrderGroup =
  (mongoose.models.OrderGroup as mongoose.Model<IOrderGroup>) ||
  mongoose.model<IOrderGroup>("OrderGroup", OrderGroupSchema);

export default OrderGroup;
