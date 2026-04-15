// src/app/api/fonts/route.ts
import { NextResponse } from "next/server";
import { allFontsMeta } from "@/lib/figlet/fonts-meta";

export async function GET() {
  return NextResponse.json({
    fonts: allFontsMeta,
    total: allFontsMeta.length,
  });
}
