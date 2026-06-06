/**
 * Order Mongoose model.
 *
 * Represents a customer door order from placement through shipment.
 * Every status change should also write a StatusHistory document.
 */

import mongoose, { Schema, type Document } from "mongoose";
import type { TOrder, OrderStatus, MeasurementUnit } from "./types";

export interface IOrder
  extends Omit<TOrder, "id" | "createdAt" | "updatedAt">, Document {
  id: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    productId: {
      type: String,
      required: function(this: any) { return this.status !== "draft"; },
      trim: true,
      index: true,
    },
    productName: {
      type: String,
      required: function(this: any) { return this.status !== "draft"; },
      trim: true,
    },
    productImage: {
      type: String,
      required: function(this: any) { return this.status !== "draft"; },
    },
    height: {
      type: Number,
      required: function(this: any) { return this.status !== "draft"; },
      min: 0,
    },
    width: {
      type: Number,
      required: function(this: any) { return this.status !== "draft"; },
      min: 0,
    },
    unit: {
      type: String,
      enum: ["inch", "mm"] satisfies MeasurementUnit[],
      required: true,
      default: "inch",
    },
    packaging: {
      type: String,
      enum: ["plastic", "carton"],
      required: true,
      default: "plastic",
    },
    customization: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "placed",
        "backordered",
        "in_progress",
        "done",
        "shipped",
        "cancelled",
        "rejected",
      ] satisfies OrderStatus[],
      required: true,
      default: "placed",
      index: true,
    },
    assignedTo: {
      type: String,
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    freeSize: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: String,
      trim: true,
      index: true,
    },
    orderType: {
      type: String,
      enum: ["single", "group"],
      default: "single",
    },
    isInventoryShortage: {
      type: Boolean,
      default: false,
    },
    shortageQuantity: {
      type: Number,
      default: 0,
    },
    availableAtOrderTime: {
      type: Number,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index: fetch all orders for an employee, newest first
OrderSchema.index({ assignedTo: 1, updatedAt: -1 });

// Compound index: filter by status, newest first
OrderSchema.index({ status: 1, updatedAt: -1 });

if (mongoose.models && mongoose.models.Order) {
  delete mongoose.models.Order;
}

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
