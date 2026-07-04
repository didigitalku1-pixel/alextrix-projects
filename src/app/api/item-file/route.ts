import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// USER's Supabase — 100% independent from aura.build
const SUPA_URL = process.env.USER_SUPABASE_URL || "https://njgtmqwyabfknyktuwzc.supabase.co";
const SUPA_KEY = process.env.USER_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3RtcXd5YWJma255a3R1d3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDM3MDcsImV4cCI6MjA5ODY3OTcwN30.10WHq_NOsG0wLJfsgHNSp0j4CPCqqZ12_bY9Q1h5kOI";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const type = p.get("type");
  const file = p.get("file");
  const artifact = p.get("artifact");

  if (!type || !file || !artifact) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Extract numeric ID from file
  const idMatch = file.match(/^0*(\d+)_/);
  const itemId = idMatch ? parseInt(idMatch[1], 10) : null;

  try {
    // === CODE: fetch HTML from user's Supabase ===
    if (artifact === "code") {
      const table = type === "component" ? "components" : "templates";
      const r = await fetch(
        `${SUPA_URL}/rest/v1/${table}?select=code&id=eq.${itemId}&limit=1`,
        { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
      );
      if (!r.ok) return NextResponse.json({ error: "Failed", available: false }, { status: 502 });
      const data = await r.json();
      if (!data || data.length === 0) return NextResponse.json({ error: "Not found", available: false }, { status: 404 });
      return new NextResponse(data[0].code || "", { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    // === DESIGN.md / Copy Prompt: try user's design_md table first ===
    if (artifact === "design_md" || artifact === "recreation_prompt") {
      // 1. Check user's Supabase design_md table
      const r = await fetch(
        `${SUPA_URL}/rest/v1/design_md?select=content&template_id=eq.${itemId}&artifact_type=eq.${artifact}&limit=1`,
        { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
      );
      if (r.ok) {
        const data = await r.json();
        if (data && data.length > 0 && data[0].content && data[0].content.length > 50) {
          return new NextResponse(data[0].content, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }
      }

      // 2. Not in database — return 404 (client will show "not generated yet")
      return NextResponse.json(
        { error: "Artifact not generated yet", available: false },
        { status: 404 }
      );
    }

    // === Skill content: fetch from user's Supabase ===
    if (artifact === "content" && type === "skill") {
      // Look up full UUID from skills-manifest.json
      let fullSkillId = file;
      try {
        const skillsPath = path.join(process.cwd(), "download", "aura_library", "skills-manifest.json");
        const raw = await fs.readFile(skillsPath, "utf-8");
        const skillsManifest = JSON.parse(raw);
        const skill = skillsManifest.items?.find((i: any) => i.file === file || i.id === file);
        if (skill) fullSkillId = skill.id;
      } catch {}

      const r = await fetch(
        `${SUPA_URL}/rest/v1/skills?select=content&id=eq.${encodeURIComponent(fullSkillId)}&limit=1`,
        { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
      );
      if (!r.ok) return NextResponse.json({ error: "Failed", available: false }, { status: 502 });
      const data = await r.json();
      if (!data || data.length === 0) return NextResponse.json({ error: "Not found", available: false }, { status: 404 });
      return new NextResponse(data[0].content || "", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    return NextResponse.json({ error: "Invalid artifact" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, available: false }, { status: 500 });
  }
}
