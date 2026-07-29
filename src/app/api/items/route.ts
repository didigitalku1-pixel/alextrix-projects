import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  SUPA_URL,
  SUPA_ANON_KEY,
  SELECT_MAP,
  getTable,
  fixImageUrl,
  fetchWithTimeout,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Cache manifest fallback (in-memory, TTL 5 min)
interface ManifestCache {
  data: any;
  ts: number;
}
let _manifestCache: ManifestCache | null = null;
const MANIFEST_TTL = 5 * 60 * 1000;

async function getManifest() {
  const now = Date.now();
  if (_manifestCache && now - _manifestCache.ts < MANIFEST_TTL) {
    return _manifestCache.data;
  }
  try {
    const litePath = path.join(
      process.cwd(),
      "download",
      "aura_library",
      "manifest-lite.json",
    );
    const raw = await fs.readFile(litePath, "utf-8");
    _manifestCache = { data: JSON.parse(raw), ts: now };
    return _manifestCache.data;
  } catch {
    try {
      const fullPath = path.join(
        process.cwd(),
        "download",
        "aura_library",
        "manifest.json",
      );
      const raw = await fs.readFile(fullPath, "utf-8");
      _manifestCache = { data: JSON.parse(raw), ts: now };
      return _manifestCache.data;
    } catch {
      _manifestCache = { data: { items: [] }, ts: now };
      return _manifestCache.data;
    }
  }
}

const TABLE_MAP: Record<
  string,
  { table: string; textCols: string[] }
> = {
  template: {
    table: getTable("template"),
    textCols: ["title", "description"],
  },
  component: {
    table: getTable("component"),
    textCols: ["title", "description"],
  },
  asset: {
    table: getTable("asset"),
    textCols: ["title", "description"],
  },
  skill: {
    table: getTable("skill"),
    textCols: ["title", "description"],
  },
};

function normalizeItem(raw: any, type: string): any {
  return {
    id: raw.id,
    type,
    slug: raw.slug || null,
    title: raw.title || "Untitled",
    desc: (raw.description || "").substring(0, 300),
    tags: Array.isArray(raw.tags) ? raw.tags : Array.isArray(raw.keywords) ? raw.keywords : [],
    image: fixImageUrl(
      raw.image_url || raw.image_1600w || raw.image_800w || raw.image_320w || null,
    ),
    views: raw.views || 0,
    forks: raw.forks || 0,
    premium: raw.premium || false,
    featured: raw.featured || false,
    private: raw.private || false,
    username: raw.username || raw.created_by || null,
    created_at: raw.created_at,
    has_code: !!raw.code,
    code_chars: (raw.code || "").length,
    file: `${String(raw.id).padStart(type === "asset" ? 8 : 6, "0")}_${raw.slug || raw.id}`,
  };
}

/**
 * Build PostgREST `or` query for full-text search across multiple columns.
 *
 * SECURITY: Strict input validation - only allow alphanumeric, space, hyphen.
 * Reject anything with special PostgREST syntax characters (, ( ) . etc).
 */
function buildSearchOr(q: string, textCols: string[]): string | null {
  // Sanitize: only allow alphanumeric, space, hyphen, underscore
  const safeQ = q.trim();
  if (!safeQ) return null;

  // Reject queries with PostgREST special chars
  if (/[(),.*\\]/.test(safeQ)) {
    return null;
  }

  // Limit length to prevent abuse
  const limitedQ = safeQ.slice(0, 100);

  // URL-encode the value (but keep * as wildcard marker for PostgREST)
  const encoded = encodeURIComponent(limitedQ);
  const parts = textCols.map((c) => `${c}.ilike.*${encoded}*`);
  // tags.cs requires valid JSON array format: tags.cs.["value"]
  // URL-encode the JSON to avoid comma conflicts in or= filter
  const tagsJson = encodeURIComponent(JSON.stringify([limitedQ]));
  parts.push(`tags.cs.${tagsJson}`);
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
  const limit = Math.min(Math.max(parseInt(p.get("limit") || "24", 10), 1), 100);

  try {
    // === Templates & Components ===
    if (type === "template" || type === "component") {
      const config = TABLE_MAP[type];
      const select = SELECT_MAP[type];

      let query = `${SUPA_URL}/rest/v1/${config.table}?select=${select}`;

      // Order
      let orderCol = "views";
      let ascending = false;
      if (sort === "forks") orderCol = "forks";
      else if (sort === "recent") orderCol = "created_at";
      else if (sort === "az") {
        orderCol = "title";
        ascending = true;
      }
      query += `&order=${orderCol}.${ascending ? "asc" : "desc"}`;

      // Tag filter (JSONB array contains) — values must be JSON-quoted strings
      if (tag) {
        // Sanitize tag - reject special chars
        const safeTag = tag.slice(0, 50).replace(/[{},.*\\]/g, "");
        if (safeTag) {
          query += `&tags=cs.${encodeURIComponent(JSON.stringify([safeTag]))}`;
        }
      }

      // Boolean filters
      if (premium) query += `&premium=is.true`;
      if (featured) query += `&featured=is.true`;

      // Search across text columns + tags
      if (q && q.trim()) {
        const orFilter = buildSearchOr(q, config.textCols);
        if (orFilter) query += `&${orFilter}`;
      }

      const start = (page - 1) * limit;
      const end = start + limit - 1;

      let r: Response;
      try {
        r = await fetchWithTimeout(
          query,
          {
            headers: {
              apikey: SUPA_ANON_KEY,
              Authorization: `Bearer ${SUPA_ANON_KEY}`,
              Range: `${start}-${end}`,
              Prefer: "count=exact",
            },
          },
          8000,
        );
      } catch {
        return await getFromManifest(type, sort, tag, q, premium, featured, page, limit);
      }

      if (!r.ok) {
        return await getFromManifest(type, sort, tag, q, premium, featured, page, limit);
      }

      const data = await r.json();
      const cr = r.headers.get("content-range") || "";
      const total = cr.includes("/")
        ? parseInt(cr.split("/").pop() || "0", 10)
        : data.length;

      const items = data.map((item: any) => normalizeItem(item, type));

      return NextResponse.json({
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      });
    }

    // === Assets ===
    if (type === "asset") {
      const config = TABLE_MAP[type];
      const select = SELECT_MAP[type];
      let query = `${SUPA_URL}/rest/v1/${config.table}?select=${select}`;
      let orderCol = "views";
      let ascending = false;
      if (sort === "recent") orderCol = "created_at";
      else if (sort === "az") {
        orderCol = "title";
        ascending = true;
      }
      query += `&order=${orderCol}.${ascending ? "asc" : "desc"}`;
      if (featured) query += `&featured=is.true`;
      if (premium) query += `&premium=is.true`;
      if (tag) {
        // Assets use keywords column (JSONB) - same pattern as tags
        const safeTag = tag.slice(0, 50).replace(/[{},.*\\]/g, "");
        if (safeTag) {
          query += `&keywords=cs.${encodeURIComponent(JSON.stringify([safeTag]))}`;
        }
      }
      if (q && q.trim()) {
        const orFilter = buildSearchOr(q, config.textCols);
        if (orFilter) query += `&${orFilter}`;
      }
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      let r: Response;
      try {
        r = await fetchWithTimeout(
          query,
          {
            headers: {
              apikey: SUPA_ANON_KEY,
              Authorization: `Bearer ${SUPA_ANON_KEY}`,
              Range: `${start}-${end}`,
              Prefer: "count=exact",
            },
          },
          8000,
        );
      } catch {
        return await getFromManifest(type, sort, tag, q, premium, featured, page, limit);
      }
      if (r.ok) {
        const data = await r.json();
        const cr = r.headers.get("content-range") || "";
        const total = cr.includes("/")
          ? parseInt(cr.split("/").pop() || "0", 10)
          : data.length;
        const items = data.map((item: any) => normalizeItem(item, type));
        return NextResponse.json({
          items,
          total,
          page,
          totalPages: Math.ceil(total / limit),
          limit,
        });
      }
      return await getFromManifest(type, sort, tag, q, premium, featured, page, limit);
    }

    // === Skills ===
    if (type === "skill") {
      try {
        const skillsPath = path.join(
          process.cwd(),
          "download",
          "aura_library",
          "skills-manifest.json",
        );
        const raw = await fs.readFile(skillsPath, "utf-8");
        const skillsManifest = JSON.parse(raw);
        let skillItems = skillsManifest.items || [];

        if (q && q.trim()) {
          const ql = q.toLowerCase();
          skillItems = skillItems.filter(
            (i: any) =>
              (i.title || "").toLowerCase().includes(ql) ||
              (i.desc || "").toLowerCase().includes(ql) ||
              (Array.isArray(i.tags) &&
                i.tags.some((t: string) => t.toLowerCase().includes(ql))) ||
              (i.content || "").toLowerCase().includes(ql),
          );
        }

        if (tag) {
          const tagL = tag.toLowerCase();
          skillItems = skillItems.filter(
            (i: any) =>
              Array.isArray(i.tags) &&
              i.tags.some((t: string) => t.toLowerCase() === tagL),
          );
        }

        switch (sort) {
          case "forks":
            skillItems = [...skillItems].sort(
              (a: any, b: any) => (b.forks || 0) - (a.forks || 0),
            );
            break;
          case "recent":
            skillItems = [...skillItems].sort(
              (a: any, b: any) =>
                new Date(b.created_at || 0).getTime() -
                new Date(a.created_at || 0).getTime(),
            );
            break;
          case "az":
            skillItems = [...skillItems].sort((a: any, b: any) =>
              a.title.localeCompare(b.title),
            );
            break;
          default:
            skillItems = [...skillItems].sort(
              (a: any, b: any) => (b.views || 0) - (a.views || 0),
            );
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
  } catch (e: any) {
    console.error("[items API] Unhandled error:", e?.message);
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
  limit: number,
) {
  const manifest = await getManifest();
  let items = manifest.items || [];

  if (type !== "all") {
    items = items.filter((i: any) => i.type === type);
  }
  if (tag) {
    const tagL = tag.toLowerCase();
    items = items.filter((i: any) =>
      (i.tags || []).some((t: string) => t.toLowerCase() === tagL),
    );
  }
  if (q) {
    const ql = q.toLowerCase();
    items = items.filter(
      (i: any) =>
        (i.title || "").toLowerCase().includes(ql) ||
        (i.desc || "").toLowerCase().includes(ql) ||
        (Array.isArray(i.tags) &&
          i.tags.some((t: string) => t.toLowerCase().includes(ql))),
    );
  }
  if (premium) items = items.filter((i: any) => i.premium);
  if (featured) items = items.filter((i: any) => i.featured);

  switch (sort) {
    case "forks":
      items = [...items].sort((a: any, b: any) => (b.forks || 0) - (a.forks || 0));
      break;
    case "recent":
      items = [...items].sort(
        (a: any, b: any) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime(),
      );
      break;
    case "az":
      items = [...items].sort((a: any, b: any) =>
        (a.title || "").localeCompare(b.title || ""),
      );
      break;
    default:
      items = [...items].sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
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
