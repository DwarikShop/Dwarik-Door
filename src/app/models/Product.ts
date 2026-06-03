/**
 * Product Mongoose model.
 *
 * Represents a door product in the catalogue.
 * Stock fields (stock, reserved, damaged) are mutated via InventoryLog events —
 * never update them directly without writing a corresponding log entry.
 */

import mongoose, { Schema, type Document } from "mongoose";
import type { TProduct } from "./types";

export interface IProduct
  extends Omit<TProduct, "id" | "createdAt" | "updatedAt">, Document {
  id: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    image: {
      type: String,
      required: false,
      default: "",
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reserved: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    damaged: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual: available = stock - reserved (not persisted, computed on read)
ProductSchema.virtual("available").get(function () {
  return this.stock - this.reserved;
});

const Product =
  (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
