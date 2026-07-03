import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SUPA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Cache for access token
let _accessToken: string | null = null;
let _tokenTime = 0;

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (_accessToken && now - _tokenTime < 300000) return _accessToken;

  // Try filesystem session (local)
  try {
    const sessionPath = path.join(process.cwd(), "download", "aura_library", "_meta", "session.json");
    const raw = await fs.readFile(sessionPath, "utf-8");
    const session = JSON.parse(raw);
    _accessToken = session.access_token;
    _tokenTime = now;
    return _accessToken;
  } catch {}

  // Try env var (Vercel) - refresh token to get access token
  const refreshToken = process.env.AURA_REFRESH_TOKEN;
  if (!refreshToken) return null;

  try {
    const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    _accessToken = data.access_token;
    _tokenTime = now;
    return _accessToken;
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  const decodedId = decodeURIComponent(id);

  try {
    // For skills: use skills-manifest.json (has all 118 skills with content)
    if (type === "skill") {
      try {
        const skillsPath = path.join(process.cwd(), "download", "aura_library", "skills-manifest.json");
        const raw = await fs.readFile(skillsPath, "utf-8");
        const skillsManifest = JSON.parse(raw);
        const skill = skillsManifest.items?.find(
          (i: any) => i.file === decodedId || i.id === decodedId || String(i.id) === String(decodedId)
        );
        if (skill) {
          return NextResponse.json(skill);
        }
      } catch {}
    }

    // First try manifest
    const manifestPath = path.join(process.cwd(), "download", "aura_library", "manifest-lite.json");
    const manifestPath2 = path.join(process.cwd(), "download", "aura_library", "manifest.json");
    let manifest: any = null;
    try {
      const raw = await fs.readFile(manifestPath, "utf-8");
      manifest = JSON.parse(raw);
    } catch {
      try {
        const raw = await fs.readFile(manifestPath2, "utf-8");
        manifest = JSON.parse(raw);
      } catch {}
    }

    if (manifest) {
      const item = manifest.items.find(
        (i: any) => i.type === type && String(i.id) === String(decodedId)
      );
      if (item) {
        // For skills, also fetch content from Supabase
        if (type === "skill") {
          const accessToken = await getAccessToken();
          if (accessToken) {
            try {
              const skillId = decodedId.includes("_") ? decodedId.split("_").pop() : decodedId;
              const r = await fetch(
                `${SUPA_URL}/rest/v1/skills?select=content& id=eq.${encodeURIComponent(skillId)}&limit=1`,
                { headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` } }
              );
              if (r.ok) {
                const data = await r.json();
                if (data && data.length > 0) {
                  item.content = data[0].content || "";
                  item.has_content = !!data[0].content;
                }
              }
            } catch {}
          }
        }
        return NextResponse.json(item);
      }
    }

    // Fallback: fetch from Supabase
    let table: string;
    let filter: string;
    let needsAuth = false;

    if (type === "template") {
      table = "shared_code";
      filter = `id=eq.${decodedId}`;
    } else if (type === "component") {
      table = "components";
      filter = `id=eq.${decodedId}`;
    } else if (type === "asset") {
      table = "assets";
      filter = `id=eq.${decodedId}`;
    } else if (type === "skill") {
      table = "skills";
      filter = `id=eq.${encodeURIComponent(decodedId.includes("_") ? decodedId.split("_").pop() : decodedId)}`;
      needsAuth = true;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const select = type === "skill"
      ? "id,title,description,content,tags,views,forks,premium,featured,created_at"
      : type === "asset"
      ? "id,slug,title,description,keywords,image_1600w,image_800w,image_320w,views,media_type,resolution,colors,created_at"
      : "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,username,created_at";

    const headers: Record<string, string> = {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    };

    // Skills need auth token
    if (needsAuth) {
      const accessToken = await getAccessToken();
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    const r = await fetch(
      `${SUPA_URL}/rest/v1/${table}?select=${select}&${filter}&limit=1`,
      { headers }
    );

    if (!r.ok) {
      return NextResponse.json({ error: "Failed to fetch from Supabase" }, { status: 502 });
    }

    const data = await r.json();
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const raw = data[0];
    const item: any = {
      id: raw.id,
      type,
      slug: raw.slug,
      title: raw.title || "Untitled",
      desc: raw.description || "",
      tags: raw.tags || raw.keywords || [],
      image: raw.image_url || raw.image_1600w || raw.image_800w || raw.image_320w || null,
      views: raw.views || 0,
      forks: raw.forks || 0,
      premium: raw.premium || false,
      featured: raw.featured || false,
      username: raw.username,
      created_at: raw.created_at,
      has_code: !!raw.code,
      code_chars: (raw.code || "").length,
      file: `${String(raw.id).padStart(type === "asset" ? 8 : 6, "0")}_${raw.slug || raw.id}`,
    };

    // For skills, add content info
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
