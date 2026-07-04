import { NextRequest, NextResponse } from "next/server";

const SUPA_URL = process.env.USER_SUPABASE_URL || "https://njgtmqwyabfknyktuwzc.supabase.co";
const SUPA_KEY = process.env.USER_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3RtcXd5YWJma255a3R1d3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDM3MDcsImV4cCI6MjA5ODY3OTcwN30.10WHq_NOsG0wLJfsgHNSp0j4CPCqqZ12_bY9Q1h5kOI";

const BASE_URL = "https://web-library-coral.vercel.app";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const revalidate = 86400;

const URLS_PER_FILE = 40000;
const LEARN_PAGES = [
  "introduction",
  "tips-for-prompting",
  "how-to-prompt",
  "how-to-design",
  "seo-settings",
  "faq",
  "custom-domain",
  "video-tutorials",
  "documentation",
];

interface Row { slug: string; updated_at?: string }

/**
 * Paginate Supabase REST API (hard cap 1000 rows per request) to fetch ALL rows.
 */
async function fetchAllSlugs(table: string): Promise<Row[]> {
  const PAGE_SIZE = 1000;
  const allRows: Row[] = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const end = offset + PAGE_SIZE - 1;
    try {
      const r = await fetch(
        `${SUPA_URL}/rest/v1/${table}?select=slug,updated_at&order=id.asc.nullslast`,
        {
          headers: {
            apikey: SUPA_KEY,
            Authorization: `Bearer ${SUPA_KEY}`,
            Range: `${offset}-${end}`,
            Prefer: "count=exact",
          },
        }
      );
      if (!r.ok) break;
      const data = await r.json();
      if (!Array.isArray(data) || data.length === 0) break;

      for (const row of data) {
        if (row.slug) allRows.push({ slug: String(row.slug), updated_at: row.updated_at || undefined });
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
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const skillsPath = path.join(process.cwd(), "download", "aura_library", "skills-manifest.json");
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
  const urls = entries.map(e => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    ${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join("\n");
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
  urls.push({ loc: `${BASE_URL}/learn`, lastmod: now, changefreq: "weekly", priority: "0.7" });
  urls.push({ loc: `${BASE_URL}/design-systems`, lastmod: now, changefreq: "weekly", priority: "0.7" });

  // Learn pages
  for (const p of LEARN_PAGES) {
    urls.push({ loc: `${BASE_URL}/learn/${p}`, lastmod: now, changefreq: "monthly", priority: "0.6" });
  }

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
  { params }: { params: Promise<{ n: string }> }
) {
  const { n } = await params;
  const fileNum = parseInt(n, 10);
  if (isNaN(fileNum) || fileNum < 0) {
    return new NextResponse("Invalid sitemap index", { status: 404 });
  }

  const allUrls = await buildAllUrls();
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
