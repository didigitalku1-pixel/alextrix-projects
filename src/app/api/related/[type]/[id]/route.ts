import { NextRequest, NextResponse } from "next/server";

const SUPA_URL = process.env.USER_SUPABASE_URL || "https://njgtmqwyabfknyktuwzc.supabase.co";
const SUPA_KEY = process.env.USER_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3RtcXd5YWJma255a3R1d3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDM3MDcsImV4cCI6MjA5ODY3OTcwN30.10WHq_NOsG0wLJfsgHNSp0j4CPCqqZ12_bY9Q1h5kOI";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

// Per-type config: which column holds the author, and the SELECT clause
const TYPE_CONFIG: Record<string, { table: string; authorCol: string; select: string }> = {
  template: {
    table: "templates",
    authorCol: "username",
    select: "id,slug,title,description,tags,image_url,views,forks,premium,featured,username,created_at",
  },
  component: {
    table: "components",
    authorCol: "created_by",
    select: "id,slug,title,description,tags,image_url,views,forks,premium,featured,background,created_by,created_at",
  },
  asset: {
    table: "assets",
    authorCol: "created_by",
    select: "id,slug,title,description,keywords,image_1600w,views,media_type,created_at",
  },
};

function normalizeItem(raw: any, type: string): any {
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
    image: fixImage(raw.image_url || raw.image_1600w || null),
    views: raw.views || 0,
    forks: raw.forks || 0,
    premium: raw.premium || false,
    featured: raw.featured || false,
    username: raw.username || raw.created_by || null,
    created_at: raw.created_at,
    file: `${String(raw.id).padStart(type === "asset" ? 8 : 6, "0")}_${raw.slug || raw.id}`,
  };
}

/**
 * GET /api/related/[type]/[id]
 * Returns related items in two groups:
 *   - moreFromAuthor: same author, excluding current item
 *   - related: same first tag, excluding current item and author items (dedupe)
 *
 * Query params:
 *   - author — the item's author (username for templates, created_by for components/assets)
 *   - tag    — the item's first tag (for related-by-tag)
 *
 * Route params:
 *   - type — plural form: "templates", "components", "assets"
 *   - id   — numeric item ID
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
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

  const { table, authorCol, select } = config;

  // Build queries — use the correct author column per type to avoid the
  // "column X.username does not exist" bug we hit before.
  // For JSONB array contains (tags=cs.{...}), values must be JSON-quoted strings:
  //   cs.{"hero"} (URL-encoded as cs.%7B%22hero%22%7D)
  const authorFilter = author ? `${authorCol}=eq.${encodeURIComponent(author)}` : null;
  const tagFilter = tag ? `tags=cs.${encodeURIComponent(JSON.stringify([tag]))}` : null;
  const excludeCurrent = `id=neq.${encodeURIComponent(id)}`;

  const [moreFromAuthor, related] = await Promise.all([
    authorFilter
      ? fetch(
          `${SUPA_URL}/rest/v1/${table}?select=${select}&${authorFilter}&${excludeCurrent}&order=views.desc&limit=6`,
          { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
        ).then(r => r.ok ? r.json() : [])
      : Promise.resolve([]),
    tagFilter
      ? fetch(
          `${SUPA_URL}/rest/v1/${table}?select=${select}&${tagFilter}&${excludeCurrent}&order=views.desc&limit=12`,
          { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
        ).then(r => r.ok ? r.json() : [])
      : Promise.resolve([]),
  ]);

  // Dedupe: remove items already in moreFromAuthor from related
  // (but only exact ID matches — keep other items even if same author)
  const authorIds = new Set((moreFromAuthor as any[]).map((i: any) => i.id));
  const filteredRelated = (related as any[]).filter((i: any) => !authorIds.has(i.id)).slice(0, 6);

  return NextResponse.json({
    moreFromAuthor: (moreFromAuthor as any[]).slice(0, 6).map((i: any) => normalizeItem(i, singularType)),
    related: filteredRelated.map((i: any) => normalizeItem(i, singularType)),
  });
}
