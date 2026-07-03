import { NextRequest, NextResponse } from "next/server";
import { getItemFromManifest } from "@/lib/aura-data";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  try {
    const item = await getItemFromManifest(type, decodeURIComponent(id));
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
