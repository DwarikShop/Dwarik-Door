/**
 * src/app/models/index.ts
 *
 * Barrel export for all Mongoose models and shared types.
 *
 * Usage in API routes:
 *   import { Employee, Order, Product, InventoryLog, StatusHistory } from '@/app/models'
 *   import type { TOrder, OrderStatus } from '@/app/models'
 */

// ── Models ────────────────────────────────────────────────────────────────────
export { default as Employee } from "./Employee";
export { default as Order } from "./Order";
export { default as Product } from "./Product";
export { default as InventoryLog } from "./InventoryLog";
export { default as StatusHistory } from "./StatusHistory";

// ── Document interfaces (Mongoose) ────────────────────────────────────────────
export type { IEmployee } from "./Employee";
export type { IOrder } from "./Order";
export type { IProduct } from "./Product";
export type { IInventoryLog } from "./InventoryLog";
export type { IStatusHistory } from "./StatusHistory";

// ── Plain-object types (safe for client + server) ─────────────────────────────
export type {
  TEmployee,
  TOrder,
  TProduct,
  TInventoryLog,
  TStatusHistory,
  UserRole,
  OrderStatus,
  MeasurementUnit,
  InventoryChangeReason,
  StockField,
} from "./types";
