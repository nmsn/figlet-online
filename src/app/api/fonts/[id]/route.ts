// src/app/api/fonts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Prevent path traversal
  const safeId = id.replace(/[^a-zA-Z0-9._-]/g, "");
  const fontPath = path.join(process.cwd(), "public", "fonts", safeId);

  // Ensure it's within public/fonts directory
  const fontsDir = path.join(process.cwd(), "public", "fonts");
  if (!fontPath.startsWith(fontsDir)) {
    return NextResponse.json({ error: "Invalid font id" }, { status: 400 });
  }

  if (!fs.existsSync(fontPath)) {
    return NextResponse.json({ error: "Font not found" }, { status: 404 });
  }

  const content = fs.readFileSync(fontPath, "utf8");
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
