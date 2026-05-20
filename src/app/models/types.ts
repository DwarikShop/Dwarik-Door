/**
 * src/app/models/types.ts
 *
 * Shared TypeScript interfaces for all domain models.
 * These are plain-object types (no Mongoose Document) — safe to use in both
 * server code (API routes) and client code (screens, contexts).
 *
 * Mongoose Document interfaces (IProduct, IOrder, etc.) live in each model
 * file and extend these base types.
 */

// ── Enums / Literals ──────────────────────────────────────────────────────────

export type UserRole = "owner" | "employee";

export type OrderStatus =
  | "placed"
  | "in_progress"
  | "done"
  | "shipped"
  | "cancelled"
  | "rejected";

export type MeasurementUnit = "inch" | "mm";

export type InventoryChangeReason =
  | "order_placed" // stock reserved when order is placed
  | "order_cancelled" // reservation released
  | "order_shipped" // stock decremented on shipment
  | "order_rejected" // stock returned or marked damaged
  | "manual_adjustment" // owner manually corrects stock
  | "damage_report"; // units marked as damaged

export type StockField = "stock" | "reserved" | "damaged";

// ── Domain types ──────────────────────────────────────────────────────────────

/** Matches the Employee collection and the existing mockData.Employee */
export interface TEmployee {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  /** Never expose this to the client — always strip before returning */
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Matches the Product collection and the existing mockData.Product */
export interface TProduct {
  id: string;
  name: string;
  category: string;
  image: string;
  stock: number;
  reserved: number;
  damaged: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Matches the Order collection and the existing mockData.Order */
export interface TOrder {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  height: number;
  width: number;
  unit: MeasurementUnit;
  freeSize?: boolean; // true = standard size, no custom dimensions
  customization?: string;
  quantity: number;
  status: OrderStatus;
  assignedTo?: string;
  customerName?: string;
  customerPhone?: string;
  groupId?: string; // set when this order belongs to a group
  orderType?: "single" | "group"; // defaults to 'single'
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * OrderGroup — parent record for multi-item orders from one customer.
 * Individual orders within the group each have groupId pointing here.
 */
export interface TOrderGroup {
  id: string;
  customerName: string;
  customerPhone: string;
  status: "active" | "completed" | "cancelled";
  totalItems: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * InventoryLog — one document per stock change event.
 * Provides a full audit trail of every inventory mutation.
 */
export interface TInventoryLog {
  id?: string;
  productId: string;
  productName: string;
  /** Which field changed: stock, reserved, or damaged */
  field: StockField;
  /** Value before the change */
  previousValue: number;
  /** Value after the change */
  newValue: number;
  /** Net delta (newValue - previousValue) */
  delta: number;
  reason: InventoryChangeReason;
  /** The order that triggered this change, if applicable */
  orderId?: string;
  /** The employee who triggered this change */
  changedBy: string;
  createdAt?: Date;
}

/**
 * StatusHistory — one document per order status transition.
 * Provides a full audit trail of every order status change.
 */
export interface TStatusHistory {
  id?: string;
  orderId: string;
  /** Status before the transition */
  fromStatus: OrderStatus | null;
  /** Status after the transition */
  toStatus: OrderStatus;
  /** The employee who made the change */
  changedBy: string;
  /** Optional note (e.g. rejection reason) */
  note?: string;
  createdAt?: Date;
}
