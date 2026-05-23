/**
 * GET /api/products/check-id?id=DW-001&excludeId=DW-001
 *
 * Returns { exists: boolean }
 * Used for real-time duplicate ID validation in the Add/Edit modals.
 * excludeId — pass the current product's own ID when editing so it
 *             doesn't flag itself as a duplicate.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/app/models";
import { products as mockProducts } from "@/app/data/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim().toUpperCase();
  const excludeId = searchParams.get("excludeId")?.trim().toUpperCase();

  if (!id) return NextResponse.json({ exists: false });

  try {
    await connectDB();

    // Build a filter that finds the ID but excludes the current product when editing
    const filter = excludeId
      ? { id, $expr: { $ne: ["$id", excludeId] } }
      : { id };

    const existing = await Product.findOne(filter).lean();

    // Also check mock data (fallback when DB is empty)
    const inMock = mockProducts.some(
      (p) => p.id.toUpperCase() === id && p.id.toUpperCase() !== excludeId,
    );

    return NextResponse.json({ exists: !!existing || inMock });
  } catch {
    const inMock = mockProducts.some(
      (p) => p.id.toUpperCase() === id && p.id.toUpperCase() !== excludeId,
    );
    return NextResponse.json({ exists: inMock });
  }
}
