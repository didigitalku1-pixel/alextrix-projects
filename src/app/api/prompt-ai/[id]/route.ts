import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/prompt-ai/[id]
 * Returns full prompt_text for a single prompt (lazy-loaded when modal opens).
 * This keeps the list API lightweight (no prompt_text in list view).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kvkwiekfdlaeeabkwmhp.supabase.co";
  const supaKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  const res = await fetch(
    `${supaUrl}/rest/v1/prompt_ai?select=id,title,prompt_text&id=eq.${encodeURIComponent(id)}&limit=1`,
    { headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` } },
  );
  
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
  
  const data = await res.json();
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  
  return NextResponse.json({
    id: data[0].id,
    title: data[0].title,
    prompt_text: data[0].prompt_text,
  });
}
