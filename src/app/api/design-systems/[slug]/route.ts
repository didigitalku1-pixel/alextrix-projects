import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  SUPA_URL,
  SUPA_ANON_KEY,
  fetchWithTimeout,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/design-systems/[slug]
 *
 * Fetches a single design system by slug from Supabase.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug || slug.length > 200) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    let r: Response | null = null;
    try {
      r = await fetchWithTimeout(
        `${SUPA_URL}/rest/v1/design_systems?select=id,slug,title,description,content,preview_html,thumbnail_url,source_name,views,forks,featured,created_by,created_at,updated_at,tags&slug=eq.${encodeURIComponent(slug)}&limit=1`,
        {
          headers: {
            apikey: SUPA_ANON_KEY,
            Authorization: `Bearer ${SUPA_ANON_KEY}`,
          },
        },
        10000,
      );
    } catch {
      // Network error — fall through to manifest fallback below
    }

    if (r && r.ok) {
      const data = await r.json();
      if (data && data.length > 0) {
        const ds = data[0];
        return NextResponse.json({
          id: ds.id,
          type: "design_system",
          slug: ds.slug,
          title: ds.title || "Untitled",
          desc: ds.description || "",
          content: ds.content || "",
          preview_html: ds.preview_html || "",
          thumbnail: ds.thumbnail_url || null,
          source_name: ds.source_name || "",
          views: ds.views || 0,
          forks: ds.forks || 0,
          featured: ds.featured || false,
          created_at: ds.created_at,
          updated_at: ds.updated_at,
          tags: ds.tags || [],
          has_design_md: !!ds.content,
          has_preview: !!ds.preview_html,
        });
      }
    }

    // Fallback: design-systems-manifest.json
    try {
      const p = path.join(
        process.cwd(),
        "download",
        "aura_library",
        "design-systems-manifest.json",
      );
      const raw = await fs.readFile(p, "utf-8");
      const manifest = JSON.parse(raw);
      const ds = (manifest.items || []).find(
        (i: any) =>
          i.slug === slug ||
          i.slug === decodeURIComponent(slug) ||
          encodeURIComponent(i.slug) === slug,
      );
      if (ds) {
        return NextResponse.json({
          id: ds.id,
          type: "design_system",
          slug: ds.slug,
          title: ds.title || "Untitled",
          desc: ds.desc || ds.description || "",
          content: ds.content || "",
          preview_html: ds.preview_html || "",
          thumbnail: ds.thumbnail || ds.image || null,
          source_name: ds.source_name || "",
          views: ds.views || 0,
          forks: ds.forks || 0,
          featured: ds.featured || false,
          created_at: ds.created_at,
          updated_at: ds.updated_at,
          tags: ds.tags || [],
          has_design_md: !!ds.content,
          has_preview: !!ds.preview_html,
        });
      }
    } catch {
      // manifest not found
    }

    if (r && !r.ok && r.status !== 404) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (e: any) {
    console.error("[design-systems/[slug] API] Error:", e?.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
