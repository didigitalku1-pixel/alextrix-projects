import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Image proxy — fetches from source, caches on Vercel CDN
// Makes images work even if source is slow/down (after first cache)
// This is the key to 100% independence — Vercel CDN caches all images

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Only allow Supabase storage URLs (security)
  if (!url.startsWith("https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/") &&
      !url.startsWith("https://njgtmqwyabfknyktuwzc.supabase.co/storage/")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 403 });
  }

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!r.ok) {
      return placeholderResponse();
    }

    const contentType = r.headers.get("content-type") || "image/jpeg";
    const buffer = await r.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
      },
    });
  } catch {
    return placeholderResponse();
  }
}

function placeholderResponse(): NextResponse {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f5f5f5"/><text x="200" y="150" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#999">No preview</text></svg>`;
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
