import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Use USER's Supabase (permanent, no aura.build dependency)
const SUPA_URL = process.env.USER_SUPABASE_URL || "https://njgtmqwyabfknyktuwzc.supabase.co";
const SUPA_KEY = process.env.USER_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3RtcXd5YWJma255a3R1d3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDM3MDcsImV4cCI6MjA5ODY3OTcwN30.10WHq_NOsG0wLJfsgHNSp0j4CPCqqZ12_bY9Q1h5kOI";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Fetch from USER's Supabase
    const r = await fetch(
      `${SUPA_URL}/rest/v1/design_systems?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
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
