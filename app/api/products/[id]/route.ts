/**
 * GET    /api/products/[id]  — get a single product
 * PATCH  /api/products/[id]  — update stock / reserved / damaged counts
 * DELETE /api/products/[id]  — remove a product
 *
 * Falls back to mock data when MongoDB is unavailable.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/app/models";
import { products as mockProducts } from "@/app/data/mockData";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    await connectDB();
    const product = await Product.findOne({ id }).lean();

    if (product) return NextResponse.json(product);

    // Not in DB — check mock data (pre-seed fallback)
    const mock = mockProducts.find((p) => p.id === id);
    if (mock) return NextResponse.json(mock);

    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  } catch {
    // DB unavailable — fall back to mock data
    const mock = mockProducts.find((p) => p.id === id);
    if (mock) return NextResponse.json(mock);
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    await connectDB();
    const body = await request.json();

    // Prevent overwriting the product id
    delete body.id;

    const product = await Product.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true, runValidators: true },
    ).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error("[PATCH /api/products/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    await connectDB();
    const product = await Product.findOneAndDelete({ id }).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[DELETE /api/products/[id]]", err);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
