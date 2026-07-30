import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kvkwiekfdlaeeabkwmhp.supabase.co";
  const supaKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const q = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "200", 10);
  
  let url = `${supaUrl}/rest/v1/prompt_ai?select=id,title,type,category,prompt_text,is_free,sort_order&is_free=eq.true&order=title.asc&limit=${limit}`;
  if (type && type !== "all") {
    url += `&type=eq.${type}`;
  }
  
  const res = await fetch(url, {
    headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` },
  });
  
  if (!res.ok) {
    return NextResponse.json({ items: [], total: 0 });
  }
  
  let items = await res.json();
  
  if (q) {
    const ql = q.toLowerCase();
    items = items.filter((i: any) => i.title?.toLowerCase().includes(ql));
  }
  
  return NextResponse.json({ items, total: items.length });
}
