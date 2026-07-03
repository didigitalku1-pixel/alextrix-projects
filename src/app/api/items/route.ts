import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SUPA_URL = process.env.USER_SUPABASE_URL || "https://hoirqrkdgbmvpwutwuwj.supabase.co";
const ANON_KEY = process.env.USER_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Cache for access token (for skills auth)
let _accessToken: string | null = null;
let _tokenTime = 0;

async function getAccessTokenForSkills(): Promise<string | null> {
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

  // Try env var (Vercel)
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

// Cache manifest
let _manifestCache: any = null;

async function getManifest() {
  if (_manifestCache) return _manifestCache;
  try {
    // Try lite manifest first (faster)
    const litePath = path.join(process.cwd(), "download", "aura_library", "manifest-lite.json");
    const raw = await fs.readFile(litePath, "utf-8");
    _manifestCache = JSON.parse(raw);
  } catch {
    try {
      const fullPath = path.join(process.cwd(), "download", "aura_library", "manifest.json");
      const raw = await fs.readFile(fullPath, "utf-8");
      _manifestCache = JSON.parse(raw);
    } catch {
      _manifestCache = { items: [] };
    }
  }
  return _manifestCache;
}

const TABLE_MAP: Record<string, { table: string; select: string }> = {
  template: {
    table: "shared_code",
    select: "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,username,created_at",
  },
  component: {
    table: "components",
    select: "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,background,created_at",
  },
  asset: {
    table: "assets",
    select: "id,slug,title,description,keywords,image_1600w,image_800w,image_320w,views,media_type,resolution,colors,created_at",
  },
  skill: {
    table: "skills",
    select: "id,title,description,content,tags,views,created_at",
  },
};

function normalizeItem(raw: any, type: string): any {
  return {
    id: raw.id,
    type,
    slug: raw.slug,
    title: raw.title || "Untitled",
    desc: (raw.description || "").substring(0, 300),
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
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const type = p.get("type") || "all";
  const sort = p.get("sort") || "views";
  const tag = p.get("tag") || undefined;
  const q = p.get("q") || undefined;
  const premium = p.get("premium") === "true";
  const featured = p.get("featured") === "true";
  const page = Math.max(parseInt(p.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(p.get("limit") || "24", 10), 1), 100);

  try {
    // For templates and components: fetch directly from Supabase for full data
    if (type === "template" || type === "component") {
      const config = TABLE_MAP[type];

      // Build query
      let query = `${SUPA_URL}/rest/v1/${config.table}?select=${config.select}`;
      
      // Order by
      let orderCol = "views";
      let ascending = false;
      if (sort === "forks") orderCol = "forks";
      else if (sort === "recent") orderCol = "created_at";
      else if (sort === "az") { orderCol = "title"; ascending = true; }
      
      query += `&order=${orderCol}.${ascending ? "asc" : "desc"}`;

      // Tag filter
      if (tag) {
        query += `&tags=cs.{${encodeURIComponent(tag)}}`;
      }

      // Premium filter
      if (premium) {
        query += `&premium=is.true`;
      }
      if (featured) {
        query += `&featured=is.true`;
      }

      // Search
      if (q) {
        query += `&title=ilike.*${encodeURIComponent(q)}*`;
      }

      // Pagination via Range header
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const r = await fetch(query, {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          Range: `${start}-${end}`,
          Prefer: "count=exact",
        },
      });

      if (!r.ok) {
        // Fallback to manifest
        return await getFromManifest(type, sort, tag, q, premium, featured, page, limit);
      }

      const data = await r.json();
      const cr = r.headers.get("content-range") || "";
      const total = cr.includes("/") ? parseInt(cr.split("/").pop() || "0", 10) : data.length;

      const items = data.map((item: any) => normalizeItem(item, type));

      return NextResponse.json({
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      });
    }

    // For assets: fetch from Supabase too
    if (type === "asset") {
      const config = TABLE_MAP[type];
      let query = `${SUPA_URL}/rest/v1/${config.table}?select=${config.select}`;
      let orderCol = "views";
      let ascending = false;
      if (sort === "recent") orderCol = "created_at";
      else if (sort === "az") { orderCol = "title"; ascending = true; }
      query += `&order=${orderCol}.${ascending ? "asc" : "desc"}`;
      if (q) query += `&title=ilike.*${encodeURIComponent(q)}*`;
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      const r = await fetch(query, {
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, Range: `${start}-${end}`, Prefer: "count=exact" },
      });
      if (r.ok) {
        const data = await r.json();
        const cr = r.headers.get("content-range") || "";
        const total = cr.includes("/") ? parseInt(cr.split("/").pop() || "0", 10) : data.length;
        const items = data.map((item: any) => normalizeItem(item, type));
        return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit), limit });
      }
      return await getFromManifest(type, sort, tag, q, premium, featured, page, limit);
    }

    // For skills: use skills-manifest.json (has all 118 skills with content)
    if (type === "skill") {
      try {
        const skillsPath = path.join(process.cwd(), "download", "aura_library", "skills-manifest.json");
        const raw = await fs.readFile(skillsPath, "utf-8");
        const skillsManifest = JSON.parse(raw);
        let skillItems = skillsManifest.items || [];

        // Apply filters
        if (q) {
          const ql = q.toLowerCase();
          skillItems = skillItems.filter((i: any) =>
            i.title.toLowerCase().includes(ql) || (i.desc || "").toLowerCase().includes(ql)
          );
        }

        // Sort
        switch (sort) {
          case "forks":
            skillItems = [...skillItems].sort((a: any, b: any) => b.forks - a.forks);
            break;
          case "recent":
            skillItems = [...skillItems].sort((a: any, b: any) =>
              new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );
            break;
          case "az":
            skillItems = [...skillItems].sort((a: any, b: any) => a.title.localeCompare(b.title));
            break;
          default:
            skillItems = [...skillItems].sort((a: any, b: any) => b.views - a.views);
        }

        const total = skillItems.length;
        const start = (page - 1) * limit;
        const paged = skillItems.slice(start, start + limit);

        return NextResponse.json({
          items: paged,
          total,
          page,
          totalPages: Math.ceil(total / limit),
          limit,
        });
      } catch {
        return await getFromManifest(type, sort, tag, q, premium, featured, page, limit);
      }
    }

    // Fallback to manifest
  } catch (e: any) {
    // Fallback to manifest
    return await getFromManifest(type, sort, tag, q, premium, featured, page, limit);
  }
}

async function getFromManifest(
  type: string,
  sort: string,
  tag: string | undefined,
  q: string | undefined,
  premium: boolean,
  featured: boolean,
  page: number,
  limit: number
) {
  const manifest = await getManifest();
  let items = manifest.items || [];

  if (type !== "all") {
    items = items.filter((i: any) => i.type === type);
  }
  if (tag) {
    items = items.filter((i: any) =>
      (i.tags || []).some((t: string) => t.toLowerCase() === tag!.toLowerCase())
    );
  }
  if (q) {
    const ql = q.toLowerCase();
    items = items.filter(
      (i: any) =>
        i.title.toLowerCase().includes(ql) ||
        (i.desc || "").toLowerCase().includes(ql) ||
        (i.tags || []).some((t: string) => t.toLowerCase().includes(ql))
    );
  }
  if (premium) items = items.filter((i: any) => i.premium);
  if (featured) items = items.filter((i: any) => i.featured);

  switch (sort) {
    case "forks":
      items = [...items].sort((a: any, b: any) => b.forks - a.forks);
      break;
    case "recent":
      items = [...items].sort(
        (a: any, b: any) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      break;
    case "az":
      items = [...items].sort((a: any, b: any) => a.title.localeCompare(b.title));
      break;
    default:
      items = [...items].sort((a: any, b: any) => b.views - a.views);
  }

  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return NextResponse.json({
    items: paged,
    total,
    page,
    totalPages,
    limit,
  });
}
