import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { verifyTokenSafe, AUTH_COOKIE } from "@/lib/jwt";
import { cookies } from "next/headers";

async function requireOwner() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const caller = token ? await verifyTokenSafe(token) : null;
  return caller?.role === "owner" ? caller : null;
}

export async function POST(request: Request) {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate it's an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save image to public/uploads
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique name for the file to prevent overwrite
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = file.name || "image.png";
    const extension = originalName.substring(originalName.lastIndexOf("."));
    const filename = `${uniqueSuffix}${extension}`;
    const filePath = join(uploadDir, filename);

    await writeFile(filePath, buffer);
    console.log(`Uploaded file saved to: ${filePath}`);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Error during image upload:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
