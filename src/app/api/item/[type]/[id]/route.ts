import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SUPA_URL = process.env.USER_SUPABASE_URL || "https://njgtmqwyabfknyktuwzc.supabase.co";
const SUPA_KEY = process.env.USER_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3RtcXd5YWJma255a3R1d3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDM3MDcsImV4cCI6MjA5ODY3OTcwN30.10WHq_NOsG0wLJfsgHNSp0j4CPCqqZ12_bY9Q1h5kOI";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Per-table SELECT clauses — must match each table's actual columns
// (templates has username, components has background+created_by, assets has keywords+image_*, skills has no premium/featured/slug)
const SELECT_MAP: Record<string, string> = {
  template: "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,username,created_at",
  component: "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,background,created_by,created_at",
  asset: "id,slug,title,description,keywords,image_1600w,image_800w,image_320w,views,media_type,resolution,colors,created_at",
  skill: "id,title,description,content,tags,views,forks,created_at",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  const decodedId = decodeURIComponent(id);

  try {
    // For skills: ALWAYS use skills-manifest.json first
    if (type === "skill") {
      try {
        const skillsPath = path.join(process.cwd(), "download", "aura_library", "skills-manifest.json");
        const raw = await fs.readFile(skillsPath, "utf-8");
        const skillsManifest = JSON.parse(raw);
        const skill = skillsManifest.items?.find(
          (i: any) => i.file === decodedId || i.id === decodedId ||
          i.slug === decodedId || String(i.id) === String(decodedId) ||
          i.file?.endsWith("_" + decodedId) || i.file?.includes(decodedId)
        );
        if (skill) return NextResponse.json(skill);
      } catch {}
    }

    const table = type === "template" ? "templates" : type === "component" ? "components" :
                  type === "asset" ? "assets" : type === "skill" ? "skills" : null;
    if (!table) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    const select = SELECT_MAP[type];
    if (!select) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    const fixImage = (url: string | null): string | null => {
      if (!url) return null;
      return url.replace("hoirqrkdgbmvpwutwuwj-all.supabase.co", "hoirqrkdgbmvpwutwuwj.supabase.co");
    };

    // Try by slug first
    let r = await fetch(
      `${SUPA_URL}/rest/v1/${table}?select=${select}&slug=eq.${encodeURIComponent(decodedId)}&limit=1`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
    );

    let data = r.ok ? await r.json() : [];

    // Surface Supabase errors instead of silently treating as "not found"
    if (!r.ok && r.status !== 404) {
      console.error(`[item API] Supabase error for ${type}/${decodedId} (slug lookup): ${r.status}`, await r.text().catch(() => ""));
    }

    // If not found by slug, try by ID (numeric for template/component/asset, UUID for skill)
    if ((!data || data.length === 0) && r.ok) {
      r = await fetch(
        `${SUPA_URL}/rest/v1/${table}?select=${select}&id=eq.${encodeURIComponent(decodedId)}&limit=1`,
        { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
      );
      data = r.ok ? await r.json() : [];
      if (!r.ok && r.status !== 404) {
      const errBody = await r.text().catch(() => "");
      console.error(`[item API] Supabase error for ${type}/${decodedId} (id lookup): ${r.status}`, errBody);
      }
    }

    if (!data || data.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const raw = data[0];
    const item: any = {
      id: raw.id, type,
      slug: raw.slug,
      title: raw.title || "Untitled",
      desc: raw.description || "",
      tags: raw.tags || raw.keywords || [],
      image: fixImage(raw.image_url || raw.image_1600w || raw.image_800w || raw.image_320w || null),
      views: raw.views || 0, forks: raw.forks || 0,
      premium: raw.premium || false, featured: raw.featured || false,
      // Components don't have `username` — fall back to `created_by` if available
      username: raw.username || raw.created_by || null,
      created_at: raw.created_at,
      has_code: !!raw.code, code_chars: (raw.code || "").length,
      file: `${String(raw.id).padStart(type === "asset" ? 8 : 6, "0")}_${raw.slug || raw.id}`,
    };
    if (type === "skill") {
      item.content = raw.content || "";
      item.has_content = !!raw.content;
      item.content_chars = (raw.content || "").length;
    }
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
