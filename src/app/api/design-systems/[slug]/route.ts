import { NextRequest, NextResponse } from "next/server";

const AURA_SUPA = "https://hoirqrkdgbmvpwutwuwj.supabase.co";
const AURA_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Fetch from aura.build Supabase (public access)
    const r = await fetch(
      `${AURA_SUPA}/rest/v1/design_systems?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { headers: { apikey: AURA_ANON, Authorization: `Bearer ${AURA_ANON}` } }
    );

    if (!r.ok) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
    }

    const data = await r.json();
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
      created_by: ds.created_by,
      created_at: ds.created_at,
      updated_at: ds.updated_at,
      has_design_md: !!ds.content,
      has_preview: !!ds.preview_html,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
