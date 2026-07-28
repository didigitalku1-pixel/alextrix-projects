import { NextRequest, NextResponse } from "next/server";
import {
  SUPA_URL,
  SUPA_ANON_KEY,
  SELECT_MAP,
  getTable,
  fixImageUrl,
  fetchWithTimeout,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

// Per-type config: which column holds the author
const TYPE_CONFIG: Record<string, { table: string; authorCol: string }> = {
  template: { table: getTable("template"), authorCol: "username" },
  component: { table: getTable("component"), authorCol: "created_by" },
  asset: { table: getTable("asset"), authorCol: "created_by" },
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
    file: `${String(raw.id).padStart(type === "asset" ? 8 : 6, "0")}_${raw.slug || raw.id}`,
  };
}

/**
 * GET /api/related/[type]/[id]
 *
 * Returns related items in two groups:
 *   - moreFromAuthor: same author, excluding current item
 *   - related: same first tag, excluding current item and author items (dedupe)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await params;
  const url = new URL(_req.url);
  const author = url.searchParams.get("author");
  const tag = url.searchParams.get("tag");

  // Normalize type: plural → singular
  const singularType = type.endsWith("s") ? type.slice(0, -1) : type;
  const config = TYPE_CONFIG[singularType];
  if (!config) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Validate id is numeric (prevent injection)
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { table, authorCol } = config;
  const select = SELECT_MAP[singularType];

  // Build filters with sanitization
  const excludeCurrent = `id=neq.${encodeURIComponent(id)}`;
  const authorFilter = author
    ? `${authorCol}=eq.${encodeURIComponent(author.slice(0, 100))}`
    : null;
  const tagFilter = tag
    ? `tags=cs.${encodeURIComponent(JSON.stringify([tag.slice(0, 50)]))}`
    : null;

  const fetchRelated = async (filter: string | null, limit: number) => {
    if (!filter) return [];
    try {
      const r = await fetchWithTimeout(
        `${SUPA_URL}/rest/v1/${table}?select=${select}&${filter}&${excludeCurrent}&order=views.desc&limit=${limit}`,
        {
          headers: {
            apikey: SUPA_ANON_KEY,
            Authorization: `Bearer ${SUPA_ANON_KEY}`,
          },
        },
        8000,
      );
      return r.ok ? await r.json() : [];
    } catch {
      return [];
    }
  };

  const [moreFromAuthorRaw, relatedRaw] = await Promise.all([
    fetchRelated(authorFilter, 6),
    fetchRelated(tagFilter, 12),
  ]);

  // Dedupe: remove items already in moreFromAuthor from related
  const authorIds = new Set((moreFromAuthorRaw as any[]).map((i: any) => i.id));
  const filteredRelated = (relatedRaw as any[])
    .filter((i: any) => !authorIds.has(i.id))
    .slice(0, 6);

  return NextResponse.json({
    moreFromAuthor: (moreFromAuthorRaw as any[])
      .slice(0, 6)
      .map((i: any) => normalizeItem(i, singularType)),
    related: filteredRelated.map((i: any) => normalizeItem(i, singularType)),
  });
}
