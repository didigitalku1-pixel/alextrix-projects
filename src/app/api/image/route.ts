import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  // Allow any supabase.co storage URL
  if (!url.includes("supabase.co/storage/")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 403 });
  }

  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!r.ok) return placeholder();
    const buffer = await r.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": r.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
      },
    });
  } catch {
    return placeholder();
  }
}

function placeholder(): NextResponse {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#f5f5f5"/><text x="200" y="150" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#999">No preview</text></svg>`;
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" } });
}
