import { NextRequest, NextResponse } from "next/server";
import { getLearnPage } from "@/lib/aura-data";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get("page") || "introduction";
  try {
    const result = await getLearnPage(page);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
