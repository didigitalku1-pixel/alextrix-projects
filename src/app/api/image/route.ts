import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_IMAGE_HOSTS, fetchWithTimeout } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Image proxy endpoint.
 *
 * SECURITY: Strict URL validation to prevent SSRF.
 *  - Must be HTTPS
 *  - Hostname must be in allowlist (only Supabase storage hosts)
 *  - Path must start with /storage/
 *  - Response size limited to 10MB
 *  - Timeout 5s
 */
export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  // Parse URL strictly - reject anything that doesn't parse cleanly
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // HTTPS only - no http, no file, no data, no javascript
  if (parsed.protocol !== "https:") {
    return NextResponse.json({ error: "HTTPS only" }, { status: 403 });
  }

  // Hostname must be in allowlist - exact match, no substring
  if (!ALLOWED_IMAGE_HOSTS.has(parsed.hostname)) {
    return NextResponse.json(
      { error: "Host not allowed" },
      { status: 403 },
    );
  }

  // Path must start with /storage/ - blocks access to other Supabase endpoints
  if (!parsed.pathname.startsWith("/storage/")) {
    return NextResponse.json(
      { error: "Path not allowed (only /storage/)" },
      { status: 403 },
    );
  }

  // Block suspicious query params that could be used for SSRF chaining
  const search = parsed.search.toLowerCase();
  if (search.includes("redirect=") || search.includes("url=")) {
    return NextResponse.json(
      { error: "Suspicious query param" },
      { status: 403 },
    );
  }

  try {
    const r = await fetchWithTimeout(
      parsed.toString(),
      { headers: { "User-Agent": "AuraLibraryImageProxy/1.0" } },
      5000,
    );

    if (!r.ok) {
      return placeholder();
    }

    // Validate content-type is actually an image
    const contentType = r.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return placeholder();
    }

    // Limit response size to 10MB to prevent memory exhaustion.
    // If too large, return SVG placeholder (NOT JSON) so <img> can render fallback.
    const contentLength = parseInt(r.headers.get("content-length") || "0", 10);
    if (contentLength > 10 * 1024 * 1024) {
      return placeholder("Too large");
    }

    const buffer = await r.arrayBuffer();

    // Double-check buffer size after fetch
    if (buffer.byteLength > 10 * 1024 * 1024) {
      return placeholder("Too large");
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
      },
    });
  } catch {
    return placeholder();
  }
}

function placeholder(label = "No preview"): NextResponse {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#f5f5f5"/><text x="200" y="150" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#999">${label}</text></svg>`;
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
