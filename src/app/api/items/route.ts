import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SUPA_URL = process.env.USER_SUPABASE_URL || "https://hoirqrkdgbmvpwutwuwj.supabase.co";
const ANON_KEY = process.env.USER_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Cache manifest
let _manifestCache: any = null;

async function getManifest() {
  if (_manifestCache) return _manifestCache;
  try {
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

const TABLE_MAP: Record<string, { table: string; select: string; textCols: string[] }> = {
  template: {
    table: process.env.USER_SUPABASE_URL ? "templates" : "shared_code",
    select: "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,username,created_at",
    textCols: ["title", "description"],
  },
  component: {
    table: "components",
    select: "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,background,created_at",
    textCols: ["title", "description"],
  },
  asset: {
    table: "assets",
    select: "id,slug,title,description,keywords,image_1600w,image_800w,image_320w,views,media_type,resolution,colors,created_at",
    textCols: ["title", "description"],
  },
  skill: {
    table: "skills",
    select: "id,title,description,content,tags,views,created_at",
    textCols: ["title", "description"],
  },
};

function normalizeItem(raw: any, type: string): any {
  // Fix: replace -all subdomain with regular subdomain (aura.build storage bug)
  const fixImage = (url: string | null): string | null => {
    if (!url) return null;
    return url.replace("hoirqrkdgbmvpwutwuwj-all.supabase.co", "hoirqrkdgbmvpwutwuwj.supabase.co");
  };

  return {
    id: raw.id,
    type,
    slug: raw.slug,
    title: raw.title || "Untitled",
    desc: (raw.description || "").substring(0, 300),
    tags: raw.tags || raw.keywords || [],
    image: fixImage(raw.image_url || raw.image_1600w || raw.image_800w || raw.image_320w || null),
    views: raw.views || 0,
    forks: raw.forks || 0,
    premium: raw.premium || false,
    featured: raw.featured || false,
    username: raw.username || raw.created_by || null,
    created_at: raw.created_at,
    has_code: !!raw.code,
    code_chars: (raw.code || "").length,
    file: `${String(raw.id).padStart(type === "asset" ? 8 : 6, "0")}_${raw.slug || raw.id}`,
  };
}

/**
 * Build PostgREST `or` query for full-text search across multiple columns.
 * Pattern: `or=(title.ilike.*q*,description.ilike.*q*,tags.cs.{q})`
 *
 * IMPORTANT: PostgREST `*` must NOT be URL-encoded as %2A in the or= filter,
 * but the value q itself must be URL-encoded to escape special chars.
 */
function buildSearchOr(q: string, textCols: string[]): string {
  const safeQ = q.replace(/[%_]/g, (m) => "\\" + m); // escape SQL LIKE wildcards
  const parts = textCols.map(c => `${c}.ilike.*${encodeURIComponent(safeQ)}*`);
  // Also search inside tags JSON array
  parts.push(`tags.cs.{${encodeURIComponent(safeQ)}}`);
  return `or=(${parts.join(",")})`;
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const type = p.get("type") || "all";
  const sort = p.get("sort") || "views";
  const tag = p.get("tag") || undefined;
  const q = p.get("q") || p.get("search") || undefined;
  const premium = p.get("premium") === "true";
  const featured = p.get("featured") === "true";
  const page = Math.max(parseInt(p.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(p.get("limit") || "24", 10), 1), 500);

  try {
    // === Templates & Components ===
    if (type === "template" || type === "component") {
      const config = TABLE_MAP[type];

      let query = `${SUPA_URL}/rest/v1/${config.table}?select=${config.select}`;

      // Order
      let orderCol = "views";
      let ascending = false;
      if (sort === "forks") orderCol = "forks";
      else if (sort === "recent") orderCol = "created_at";
      else if (sort === "az") { orderCol = "title"; ascending = true; }
      query += `&order=${orderCol}.${ascending ? "asc" : "desc"}`;

      // Tag filter (JSONB array contains) — values must be JSON-quoted strings
      if (tag) {
        query += `&tags=cs.${encodeURIComponent(JSON.stringify([tag]))}`;
      }

      // Boolean filters
      if (premium) query += `&premium=is.true`;
      if (featured) query += `&featured=is.true`;

      // Search across text columns + tags
      if (q && q.trim()) {
        query += `&${buildSearchOr(q.trim(), config.textCols)}`;
      }

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
        return await getFromManifest(type, sort, tag, q, premium, featured, page, limit);
      }

      const data = await r.json();
      const cr = r.headers.get("content-range") || "";
      const total = cr.includes("/") ? parseInt(cr.split("/").pop() || "0", 10) : data.length;

      const items = data.map((item: any) => normalizeItem(item, type));

      return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit), limit });
    }

    // === Assets ===
    if (type === "asset") {
      const config = TABLE_MAP[type];
      let query = `${SUPA_URL}/rest/v1/${config.table}?select=${config.select}`;
      let orderCol = "views";
      let ascending = false;
      if (sort === "recent") orderCol = "created_at";
      else if (sort === "az") { orderCol = "title"; ascending = true; }
      query += `&order=${orderCol}.${ascending ? "asc" : "desc"}`;
      if (featured) query += `&featured=is.true`;
      if (premium) query += `&premium=is.true`;
      if (tag) query += `&keywords=cs.${encodeURIComponent(JSON.stringify([tag]))}`;
      if (q && q.trim()) {
        query += `&${buildSearchOr(q.trim(), config.textCols)}`;
      }
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

    // === Skills ===
    if (type === "skill") {
      try {
        const skillsPath = path.join(process.cwd(), "download", "aura_library", "skills-manifest.json");
        const raw = await fs.readFile(skillsPath, "utf-8");
        const skillsManifest = JSON.parse(raw);
        let skillItems = skillsManifest.items || [];

        // Apply search filter across title, desc, tags, content
        if (q && q.trim()) {
          const ql = q.toLowerCase();
          skillItems = skillItems.filter((i: any) =>
            (i.title || "").toLowerCase().includes(ql) ||
            (i.desc || "").toLowerCase().includes(ql) ||
            (Array.isArray(i.tags) && i.tags.some((t: string) => t.toLowerCase().includes(ql))) ||
            (i.content || "").toLowerCase().includes(ql)
          );
        }

        // Tag filter
        if (tag) {
          skillItems = skillItems.filter((i: any) =>
            Array.isArray(i.tags) && i.tags.some((t: string) => t.toLowerCase() === tag!.toLowerCase())
          );
        }

        // Sort
        switch (sort) {
          case "forks":
            skillItems = [...skillItems].sort((a: any, b: any) => (b.forks || 0) - (a.forks || 0));
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
            skillItems = [...skillItems].sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
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

    // Unknown type — fallback to manifest
    return await getFromManifest(type, sort, tag, q, premium, featured, page, limit);
  } catch {
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
        (i.title || "").toLowerCase().includes(ql) ||
        (i.desc || "").toLowerCase().includes(ql) ||
        (Array.isArray(i.tags) && i.tags.some((t: string) => t.toLowerCase().includes(ql)))
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
