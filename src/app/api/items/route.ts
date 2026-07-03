import { NextRequest, NextResponse } from "next/server";
import { queryItems } from "@/lib/aura-data";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  try {
    const result = await queryItems({
      type: p.get("type") || "all",
      sort: p.get("sort") || "views",
      tag: p.get("tag") || undefined,
      q: p.get("q") || undefined,
      premium: p.get("premium") === "true",
      featured: p.get("featured") === "true",
      page: parseInt(p.get("page") || "1", 10),
      limit: parseInt(p.get("limit") || "24", 10),
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
