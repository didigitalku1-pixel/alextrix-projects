import { NextRequest, NextResponse } from "next/server";

const SUPA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const type = p.get("type");
  const file = p.get("file");
  const artifact = p.get("artifact");

  if (!type || !file || !artifact) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Extract numeric ID from file (e.g., "000073_rkB4w3" → 73)
  const idMatch = file.match(/^0*(\d+)_/);
  const itemId = idMatch ? parseInt(idMatch[1], 10) : null;

  try {
    if (artifact === "code") {
      // Fetch HTML code from Supabase
      const table = type === "component" ? "components" : "shared_code";
      const r = await fetch(
        `${SUPA_URL}/rest/v1/${table}?select=code&id=eq.${itemId}&limit=1`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
      );
      if (!r.ok) {
        return NextResponse.json({ error: "Failed to fetch", available: false }, { status: 502 });
      }
      const data = await r.json();
      if (!data || data.length === 0) {
        return NextResponse.json({ error: "Not found", available: false }, { status: 404 });
      }
      const code = data[0].code || "";
      return new NextResponse(code, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (artifact === "design_md" || artifact === "recreation_prompt") {
      // DESIGN.md and prompt are generated artifacts, stored locally only
      // On Vercel, they're not available (filesystem excluded)
      // Try local filesystem first, then return 404
      const path = await import("path");
      const fs = await import("fs/promises");
      const subdir = type === "component" ? "components" : "templates";
      const ext = artifact === "design_md" ? "design.md" : "prompt.md";
      const filePath = path.join(process.cwd(), "download", "aura_library", subdir, `${file}.${ext}`);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        return new NextResponse(content, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      } catch {
        return NextResponse.json(
          { error: "Artifact not generated yet", available: false },
          { status: 404 }
        );
      }
    }

    if (artifact === "content" && type === "skill") {
      // Fetch skill content from Supabase
      const r = await fetch(
        `${SUPA_URL}/rest/v1/skills?select=content&id=eq.${encodeURIComponent(file.split("_").pop() || "")}&limit=1`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
      );
      if (!r.ok) {
        return NextResponse.json({ error: "Failed", available: false }, { status: 502 });
      }
      const data = await r.json();
      if (!data || data.length === 0) {
        return NextResponse.json({ error: "Not found", available: false }, { status: 404 });
      }
      return new NextResponse(data[0].content || "", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return NextResponse.json({ error: "Invalid artifact" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, available: false }, { status: 500 });
  }
}
