/**
 * src/app/lib/seed.ts
 *
 * Database seed script — populates MongoDB Atlas with the existing mock data.
 * Safe to re-run — uses upsert so existing documents are not duplicated.
 *
 *   npm run seed
 */

import "dotenv/config";
import { products, orders } from "../data/mockData";
import { connectDB, disconnectDB } from "./mongodb";
import { Product, Employee, Order, OrderGroup, StatusHistory, InventoryLog } from "../models";

async function seed() {
  console.log("🌱  Starting seed...\n");

  await connectDB();

  console.log("🧹  Clearing existing database collections...");
  await Promise.all([
    Order.deleteMany({}),
    Product.deleteMany({}),
    Employee.deleteMany({}),
    OrderGroup.deleteMany({}),
    StatusHistory.deleteMany({}),
    InventoryLog.deleteMany({}),
  ]);
  console.log("   ✓ Database cleared\n");

  // ── Products ──────────────────────────────────────────────────────────────
  console.log("📦  Seeding products...");
  const productResults = await Product.insertMany(products);
  console.log(`   ✓ ${productResults.length} products seeded\n`);

  // ── Employees ─────────────────────────────────────────────────────────────
  console.log("👥  Seeding employees...");
  const owner = await Employee.create({
    id: "EMP-001",
    name: "Dhiraj",
    phone: "9776245349",
    role: "owner",
    password: "Dhiraj@123",
  });
  console.log("   ✓ Initial owner seeded (Dhiraj / 9776245349)\n");

  // ── Orders ────────────────────────────────────────────────────────────────
  console.log("🛒  Seeding orders...");
  const orderResults = await Order.insertMany(
    orders.map((o) => ({
      ...o,
      reservedQuantity: ["placed", "in_progress", "done"].includes(o.status) ? o.quantity : 0,
    }))
  );
  console.log(`   ✓ ${orderResults.length} orders seeded\n`);

  console.log("✅  Seed complete.");
}

seed()
  .catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  })
  .finally(() => disconnectDB());
