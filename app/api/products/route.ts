/**
 * GET  /api/products  — list all products
 * POST /api/products  — create a new product
 *
 * Falls back to mock data when MongoDB is unavailable (local dev without Atlas).
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/app/models";
import { products as mockProducts } from "@/app/data/mockData";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ id: 1 }).lean();

    // If DB is empty (not seeded yet), return mock data so the UI works
    if (products.length === 0) {
      return NextResponse.json(mockProducts);
    }

    return NextResponse.json(products);
  } catch {
    // DB unavailable — return mock data so the app still works
    return NextResponse.json(mockProducts);
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("[POST /api/products]", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
