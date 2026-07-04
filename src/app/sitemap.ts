import type { MetadataRoute } from "next";

const SUPA_URL = process.env.USER_SUPABASE_URL || "https://njgtmqwyabfknyktuwzc.supabase.co";
const SUPA_KEY = process.env.USER_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3RtcXd5YWJma255a3R1d3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDM3MDcsImV4cCI6MjA5ODY3OTcwN30.10WHq_NOsG0wLJfsgHNSp0j4CPCqqZ12_bY9Q1h5kOI";

const BASE_URL = "https://web-library-coral.vercel.app";

export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const revalidate = 86400;

/**
 * Sitemap index — returns a list of child sitemaps.
 * Each child sitemap (/sitemap-xml/<n>.xml) contains up to 40,000 URLs
 * to stay well under Google's 50,000-URL-per-file limit.
 *
 * Total URLs: ~55,000 (21K templates + 3K components + 30K assets + 118 skills + 12 misc)
 * → 2 child sitemap files (n=0, n=1).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get total counts from each table (one HEAD request each, cheap)
  const [t, c, a] = await Promise.all([
    countRows("templates"),
    countRows("components"),
    countRows("assets"),
  ]);
  const skillsCount = 118; // static from manifest

  const totalUrls = t + c + a + skillsCount + 12; // 12 = homepage + learn + design-systems
  const URLS_PER_FILE = 40000;
  const numFiles = Math.max(1, Math.ceil(totalUrls / URLS_PER_FILE));

  const now = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = [];
  for (let i = 0; i < numFiles; i++) {
    entries.push({
      url: `${BASE_URL}/sitemap-xml/${i}.xml`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });
  }
  return entries;
}

async function countRows(table: string): Promise<number> {
  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/${table}?select=id`,
      {
        method: "GET",
        headers: {
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          Range: "0-0",
          Prefer: "count=exact",
        },
      }
    );
    if (!r.ok) return 0;
    const cr = r.headers.get("content-range") || "";
    const m = cr.match(/\/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  } catch {
    return 0;
  }
}
