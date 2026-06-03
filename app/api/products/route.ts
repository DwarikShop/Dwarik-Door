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
import { verifyTokenSafe, AUTH_COOKIE } from "@/lib/jwt";
import { cookies } from "next/headers";

async function requireOwner() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const caller = token ? await verifyTokenSafe(token) : null;
  return caller?.role === "owner" ? caller : null;
}

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ id: 1 }).lean();
    return NextResponse.json(products);
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await connectDB();
    const body = await request.json();
    const { name, category, image, price, stock, damaged } = body;
    let { id } = body;

    if (!name || !category || price === undefined || price === null) {
      return NextResponse.json(
        { error: "name, category and price are required" },
        { status: 400 },
      );
    }

    if (id) {
      // Custom ID provided — check for duplicates
      id = id.trim().toUpperCase();
      const existing = await Product.findOne({ id }).lean();
      if (existing) {
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
