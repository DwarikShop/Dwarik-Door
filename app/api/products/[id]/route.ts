/**
 * GET    /api/products/[id]  — get a single product
 * PATCH  /api/products/[id]  — update product fields including ID
 * DELETE /api/products/[id]  — remove a product
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
    const mock = mockProducts.find((p) => p.id === id);
    if (mock) return NextResponse.json(mock);
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  } catch {
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

    // If a new ID is being set, check it's not already taken by another product
    if (body.id && body.id !== id) {
      const newId = body.id.trim().toUpperCase();
      body.id = newId;
      const conflict = await Product.findOne({ id: newId }).lean();
      const inMock = mockProducts.some(
        (p) => p.id.toUpperCase() === newId && p.id !== id,
      );
      if (conflict || inMock) {
        return NextResponse.json(
          { error: `Product ID "${newId}" is already in use.` },
          { status: 409 },
        );
      }
    }

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
