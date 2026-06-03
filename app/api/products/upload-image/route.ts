import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTokenSafe, AUTH_COOKIE } from "@/lib/jwt";
import { cookies } from "next/headers";

export const maxDuration = 60; // Max execution time for edge / serverless
export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

async function requireOwner() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const caller = token ? await verifyTokenSafe(token) : null;
  return caller?.role === "owner" ? caller : null;
}

export async function POST(req: Request) {
  try {
    const caller = await requireOwner();
    if (!caller) {
      return NextResponse.json({ error: "Forbidden: only owners can upload product images" }, { status: 403 });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json(
        { error: "Supabase configuration is missing" },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ error: "No productId provided" }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = `products/${productId}.webp`;

    const { data, error } = await supabase.storage
      .from("products")
      .upload(filePath, buffer, {
        contentType: file.type || "image/webp",
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: `Failed to upload image: ${error.message}` },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
