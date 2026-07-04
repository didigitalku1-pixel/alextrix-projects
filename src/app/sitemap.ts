import type { MetadataRoute } from "next";

const SUPA_URL = process.env.USER_SUPABASE_URL || "https://njgtmqwyabfknyktuwzc.supabase.co";
const SUPA_KEY = process.env.USER_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3RtcXd5YWJma255a3R1d3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDM3MDcsImV4cCI6MjA5ODY3OTcwN30.10WHq_NOsG0wLJfsgHNSp0j4CPCqqZ12_bY9Q1h5kOI";

const BASE_URL = "https://web-library-coral.vercel.app";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const revalidate = 86400; // 24h

async function fetchSlugs(table: string, limit = 5000): Promise<{ slug: string; updated_at?: string }[]> {
  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/${table}?select=slug,updated_at&order=views.desc&limit=${limit}`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
    );
    if (!r.ok) return [];
    const data = await r.json();
    return (data || [])
      .filter((i: any) => i.slug)
      .map((i: any) => ({ slug: String(i.slug), updated_at: i.updated_at || undefined }));
  } catch {
    return [];
  }
}

async function fetchSkillFiles(): Promise<{ file: string }[]> {
  // Skills live in skills-manifest.json committed to repo (server-side FS read)
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const skillsPath = path.join(process.cwd(), "download", "aura_library", "skills-manifest.json");
    const raw = await fs.readFile(skillsPath, "utf-8");
    const manifest = JSON.parse(raw);
    return (manifest.items || [])
      .filter((i: any) => i.file)
      .map((i: any) => ({ file: String(i.file) }));
  } catch {
    return [];
  }
}

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const [templates, components, assets, skills] = await Promise.all([
    fetchSlugs("templates", 5000),
    fetchSlugs("components", 3000),
    fetchSlugs("assets", 10000),
    fetchSkillFiles(),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // Homepage & top-level routes
  entries.push(
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/design-systems`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  );

  // Learn pages
  for (const p of LEARN_PAGES) {
    entries.push({ url: `${BASE_URL}/learn/${p}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
  }

  // Templates
  for (const t of templates) {
    entries.push({
      url: `${BASE_URL}/templates/${encodeURIComponent(t.slug)}`,
      lastModified: t.updated_at || now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Components
  for (const c of components) {
    entries.push({
      url: `${BASE_URL}/components/${encodeURIComponent(c.slug)}`,
      lastModified: c.updated_at || now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Assets
  for (const a of assets) {
    entries.push({
      url: `${BASE_URL}/assets/${encodeURIComponent(a.slug)}`,
      lastModified: a.updated_at || now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  // Skills (use file as route param)
  for (const s of skills) {
    entries.push({
      url: `${BASE_URL}/skills/${encodeURIComponent(s.file)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
