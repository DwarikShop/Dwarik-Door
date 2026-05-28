/**
 * src/app/lib/seed.ts
 *
 * Database seed script — populates MongoDB Atlas with the existing mock data.
 * Safe to re-run — uses upsert so existing documents are not duplicated.
 *
 *   npm run seed
 */

import "dotenv/config";
import { products, employees, orders } from "../data/mockData";
import { connectDB, disconnectDB } from "./mongodb";
import { Product, Employee, Order } from "../models";

async function seed() {
  console.log("🌱  Starting seed...\n");

  await connectDB();

  // ── Products ──────────────────────────────────────────────────────────────
  console.log("📦  Seeding products...");
  const productResults = await Promise.all(
    products.map((p) =>
      Product.findOneAndUpdate(
        { id: p.id },
        {
          $setOnInsert: {
            id: p.id,
            name: p.name,
            category: p.category,
            image: p.image,
            stock: p.stock,
            reserved: p.reserved,
            damaged: p.damaged,
            price: p.price,
          },
        },
        { upsert: true, new: true },
      ),
    ),
  );
  console.log(`   ✓ ${productResults.length} products seeded\n`);

  // ── Employees ─────────────────────────────────────────────────────────────
  console.log("👥  Seeding employees...");
  // Seed the owner "Dhiraj" only if no owner exists in the database
  const ownerExists = await Employee.findOne({ role: "owner" });
  if (!ownerExists) {
    await Employee.create({
      id: "EMP-001",
      name: "Dhiraj",
      phone: "9776245349",
      role: "owner",
      password: "change-me-immediately", // Placeholder to change immediately
    });
    console.log("   ✓ Initial owner seeded (Dhiraj / 9776245349)\n");
  } else {
    console.log("   ✓ Owner already exists, skipping initial owner seed\n");
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  // Use $set (not $setOnInsert) to avoid conflict with timestamps: true
  console.log("🛒  Seeding orders...");
  const orderResults = await Promise.all(
    orders.map((o) =>
      Order.findOneAndUpdate(
        { id: o.id },
        {
          $set: {
            id: o.id,
            productId: o.productId,
            productName: o.productName,
            productImage: o.productImage,
            height: o.height,
            width: o.width,
            unit: o.unit,
            packaging: o.packaging || "plastic",
            customization: o.customization,
            quantity: o.quantity,
            status: o.status,
            assignedTo: o.assignedTo,
            customerName: o.customerName,
            customerPhone: o.customerPhone,
          },
        },
        { upsert: true, new: true },
      ),
    ),
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
