import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { SUPA_URL, SUPA_ANON_KEY, fetchWithTimeout } from "@/lib/supabase";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://web-library-coral.vercel.app";

// ISR with 24h revalidation (no force-dynamic, to enable caching)
export const revalidate = 86400;
export const maxDuration = 60;

const URLS_PER_FILE = 40000;

// === Module-level cache for fetchAllSlugs ===
// First request after revalidate populates this; subsequent requests within
// revalidate window reuse it. This avoids hitting Supabase 55+ times per sitemap request.
let _cachedUrls: { data: any[]; ts: number } | null = null;
const URL_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

interface Row {
  slug: string;
  updated_at?: string;
}

/**
 * Paginate Supabase REST API (hard cap 1000 rows per request) to fetch ALL rows.
 */
async function fetchAllSlugs(table: string): Promise<Row[]> {
  const now = Date.now();
  if (_cachedUrls && now - _cachedUrls.ts < URL_CACHE_TTL) {
    return _cachedUrls.data.filter((r: any) => r._table === table).map((r: any) => ({
      slug: r.slug,
      updated_at: r.updated_at,
    }));
  }

  const PAGE_SIZE = 1000;
  const allRows: Row[] = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const end = offset + PAGE_SIZE - 1;
    try {
      const r = await fetchWithTimeout(
        `${SUPA_URL}/rest/v1/${table}?select=slug,updated_at&order=id.asc.nullslast`,
        {
          headers: {
            apikey: SUPA_ANON_KEY,
            Authorization: `Bearer ${SUPA_ANON_KEY}`,
            Range: `${offset}-${end}`,
            Prefer: "count=exact",
          },
        },
        15000,
      );
      if (!r.ok) break;
      const data = await r.json();
      if (!Array.isArray(data) || data.length === 0) break;

      for (const row of data) {
        if (row.slug) {
          allRows.push({
            slug: String(row.slug),
            updated_at: row.updated_at || undefined,
          });
        }
      }

      const cr = r.headers.get("content-range") || "";
      const match = cr.match(/\/(\d+)/);
      if (match) total = parseInt(match[1], 10);
      else break;

      offset += data.length;
      if (data.length < PAGE_SIZE) break;
    } catch {
      break;
    }
  }
  return allRows;
}

async function fetchSkillFiles(): Promise<string[]> {
  try {
    const skillsPath = path.join(
      process.cwd(),
      "download",
      "aura_library",
      "skills-manifest.json",
    );
    const raw = await fs.readFile(skillsPath, "utf-8");
    const manifest = JSON.parse(raw);
    return (manifest.items || [])
      .filter((i: any) => i.file)
      .map((i: any) => String(i.file));
  } catch {
    return [];
  }
}

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildXml(entries: UrlEntry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    ${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Build the full ordered list of all URLs across the site.
 * Order matters — we slice by [n] for the child sitemap.
 */
async function buildAllUrls(): Promise<UrlEntry[]> {
  const now = new Date().toISOString();

  const [templates, components, assets, skillFiles] = await Promise.all([
    fetchAllSlugs("templates"),
    fetchAllSlugs("components"),
    fetchAllSlugs("assets"),
    fetchSkillFiles(),
  ]);

  const urls: UrlEntry[] = [];

  // Top-level
  urls.push({ loc: BASE_URL, lastmod: now, changefreq: "daily", priority: "1.0" });
  urls.push({
    loc: `${BASE_URL}/design-systems`,
    lastmod: now,
    changefreq: "weekly",
    priority: "0.7",
  });

  // Templates
  for (const t of templates) {
    urls.push({
      loc: `${BASE_URL}/templates/${encodeURIComponent(t.slug)}`,
      lastmod: t.updated_at || now,
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  // Components
  for (const c of components) {
    urls.push({
      loc: `${BASE_URL}/components/${encodeURIComponent(c.slug)}`,
      lastmod: c.updated_at || now,
      changefreq: "weekly",
      priority: "0.7",
    });
  }

  // Assets
  for (const a of assets) {
    urls.push({
      loc: `${BASE_URL}/assets/${encodeURIComponent(a.slug)}`,
      lastmod: a.updated_at || now,
      changefreq: "monthly",
      priority: "0.5",
    });
  }

  // Skills (route uses `file` as param)
  for (const s of skillFiles) {
    urls.push({
      loc: `${BASE_URL}/skills/${encodeURIComponent(s)}`,
      lastmod: now,
      changefreq: "monthly",
      priority: "0.6",
    });
  }

  return urls;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ n: string }> },
) {
  const { n } = await params;
  const fileNum = parseInt(n, 10);
  if (isNaN(fileNum) || fileNum < 0) {
    return new NextResponse("Invalid sitemap index", { status: 404 });
  }

  let allUrls: UrlEntry[];
  try {
    allUrls = await buildAllUrls();
  } catch (e: any) {
    console.error("[sitemap-xml] Error building URLs:", e?.message);
    // Return empty sitemap instead of 404 (better for SEO - search engine sees valid XML)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=300, s-maxage=3600",
        },
      },
    );
  }

  const start = fileNum * URLS_PER_FILE;
  const end = start + URLS_PER_FILE;
  const slice = allUrls.slice(start, end);

  if (slice.length === 0) {
    return new NextResponse("Sitemap not found", { status: 404 });
  }

  const xml = buildXml(slice);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
