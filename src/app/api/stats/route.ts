import { NextResponse } from "next/server";
import { getStats } from "@/lib/aura-data";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return NextResponse.json(await getStats());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
