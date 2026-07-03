import { NextResponse } from "next/server";
import { getStats } from "@/lib/aura-data";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const stats = await getStats();
    const tags = (stats.top_tags || []).map(([tag, count]) => ({ tag, count }));
    return NextResponse.json({ tags });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
