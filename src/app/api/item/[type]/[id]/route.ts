import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SUPA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  const decodedId = decodeURIComponent(id);

  try {
    // First try to get from manifest (fast, cached)
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
      // Find item in manifest
      const item = manifest.items.find(
        (i: any) => i.type === type && String(i.id) === String(decodedId)
      );
      if (item) {
        return NextResponse.json(item);
      }
    }

    // Fallback: fetch from Supabase
    let table: string;
    let filter: string;
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
      filter = `id=eq.${encodeURIComponent(decodedId.split("_").pop() || decodedId)}`;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const select = type === "skill"
      ? "id,title,description,content,tags,views,forks,premium,featured,created_at"
      : type === "asset"
      ? "id,slug,title,description,keywords,image_1600w,image_800w,image_320w,views,media_type,resolution,colors,created_at"
      : "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,username,created_at";

    const r = await fetch(
      `${SUPA_URL}/rest/v1/${table}?select=${select}&${filter}&limit=1`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
    );

    if (!r.ok) {
      return NextResponse.json({ error: "Failed to fetch from Supabase" }, { status: 502 });
    }

    const data = await r.json();
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const raw = data[0];
    // Normalize to manifest format
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

    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
