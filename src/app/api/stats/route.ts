import { NextResponse } from "next/server";

const SUPA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Cache stats for 5 minutes
let _statsCache: any = null;
let _statsCacheTime = 0;

async function getCount(table: string): Promise<number> {
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?select=id`, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        Prefer: "count=exact",
        Range: "0-0",
      },
    });
    const cr = r.headers.get("content-range") || "";
    if (cr.includes("/")) {
      return parseInt(cr.split("/").pop() || "0", 10);
    }
    return 0;
  } catch {
    return 0;
  }
}

async function getTopTags(): Promise<[string, number][]> {
  try {
    // Fetch tags from shared_code (templates) - sample to get tag counts
    const r = await fetch(
      `${SUPA_URL}/rest/v1/shared_code?select=tags&tags=not.is.null&limit=5000`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
    );
    if (!r.ok) return [];
    const data = await r.json();
    const tagCounts: Record<string, number> = {};
    for (const item of data) {
      const tags = item.tags || [];
      if (Array.isArray(tags)) {
        for (const t of tags) {
          if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
        }
      }
    }
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50) as [string, number][];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    // Return cached if fresh (5 min)
    const now = Date.now();
    if (_statsCache && now - _statsCacheTime < 300000) {
      return NextResponse.json(_statsCache);
    }

    // Fetch real counts from Supabase in parallel
    const [templates, components, assets, skills, topTags] = await Promise.all([
      getCount("shared_code"),
      getCount("components"),
      getCount("assets"),
      getCount("skills"),
      getTopTags(),
    ]);

    const stats = {
      total_items: templates + components + assets + skills,
      templates,
      components,
      assets,
      skills,
      featured: 0,
      premium: 0,
      top_tags: topTags,
    };

    _statsCache = stats;
    _statsCacheTime = now;

    return NextResponse.json(stats);
  } catch (e: any) {
    // Fallback to manifest if Supabase fails
    try {
      const { promises: fs } = await import("fs");
      const path = await import("path");
      const statsPath = path.join(process.cwd(), "download", "aura_library", "_meta", "stats.json");
      const raw = await fs.readFile(statsPath, "utf-8");
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json({
        total_items: 0,
        templates: 0,
        components: 0,
        assets: 0,
        skills: 0,
        featured: 0,
        premium: 0,
        top_tags: [],
      });
    }
  }
}
