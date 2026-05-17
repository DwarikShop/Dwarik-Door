/**
 * GET  /api/products  — list all products
 * POST /api/products  — create a new product
 *
 * POST body:
 *   id?        — custom product ID (e.g. "DW-009"). Auto-generated if omitted.
 *   name *     — product name
 *   category * — product category
 *   image      — image URL
 *   price *    — price in rupees
 *   stock      — initial stock count (default 0)
 *   damaged    — initial damaged count (default 0)
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/app/models";
import { products as mockProducts } from "@/app/data/mockData";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ id: 1 }).lean();
    if (products.length === 0) return NextResponse.json(mockProducts);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(mockProducts);
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, category, image, price, stock, damaged } = body;
    let { id } = body;

    if (!name || !category || !price) {
      return NextResponse.json(
        { error: "name, category and price are required" },
        { status: 400 },
      );
    }

    if (id) {
      // Custom ID provided — check for duplicates
      id = id.trim().toUpperCase();
      const existing = await Product.findOne({ id }).lean();
      const inMock = mockProducts.some((p) => p.id.toUpperCase() === id);
      if (existing || inMock) {
        return NextResponse.json(
          {
            error: `Product ID "${id}" already exists. Please use a different ID.`,
          },
          { status: 409 },
        );
      }
    } else {
      // Auto-generate: DW-009, DW-010, etc.
      const count = await Product.countDocuments();
      id = `DW-${String(count + 1).padStart(3, "0")}`;
    }

    const product = await Product.create({
      id,
      name: name.trim(),
      category: category.trim(),
      image: image?.trim() || "",
      price: Number(price),
      stock: Number(stock) || 0,
      reserved: 0,
      damaged: Number(damaged) || 0,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("[POST /api/products]", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
