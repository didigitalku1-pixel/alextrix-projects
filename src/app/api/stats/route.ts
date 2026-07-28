import { NextResponse } from "next/server";
import {
  SUPA_URL,
  SUPA_ANON_KEY,
  getTable,
  fetchWithTimeout,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Cache stats for 5 minutes
interface StatsCache {
  data: any;
  ts: number;
}
let _statsCache: StatsCache | null = null;
const STATS_TTL = 5 * 60 * 1000;

async function getCount(table: string, filter?: string): Promise<number> {
  try {
    let url = `${SUPA_URL}/rest/v1/${table}?select=id`;
    if (filter) url += `&${filter}`;
    const r = await fetchWithTimeout(
      url,
      {
        headers: {
          apikey: SUPA_ANON_KEY,
          Authorization: `Bearer ${SUPA_ANON_KEY}`,
          Prefer: "count=exact",
          Range: "0-0",
        },
      },
      8000,
    );
    const cr = r.headers.get("content-range") || "";
    if (cr.includes("/")) {
      return parseInt(cr.split("/").pop() || "0", 10);
    }
    return 0;
  } catch {
    return 0;
  }
}

// Skills table requires auth — use count from skills-manifest file
async function getSkillsCount(): Promise<number> {
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const skillsPath = path.join(
      process.cwd(),
      "download",
      "aura_library",
      "skills-manifest.json",
    );
    const raw = await fs.readFile(skillsPath, "utf-8");
    const manifest = JSON.parse(raw);
    return (manifest.items || []).length;
  } catch {
    return 0;
  }
}

// Count design_systems from manifest file (no Supabase table)
async function getDesignSystemsCount(): Promise<number> {
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const dsPath = path.join(
      process.cwd(),
      "download",
      "aura_library",
      "design-systems-manifest.json",
    );
    const raw = await fs.readFile(dsPath, "utf-8");
    const manifest = JSON.parse(raw);
    return (manifest.items || []).length;
  } catch {
    return 0;
  }
}

async function getTopTags(): Promise<[string, number][]> {
  try {
    // Fetch tags from templates table (shared_code in Aura, templates in user project)
    const templatesTable = getTable("template");
    const r = await fetchWithTimeout(
      `${SUPA_URL}/rest/v1/${templatesTable}?select=tags&tags=not.is.null&limit=5000`,
      {
        headers: {
          apikey: SUPA_ANON_KEY,
          Authorization: `Bearer ${SUPA_ANON_KEY}`,
        },
      },
      10000,
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
    if (_statsCache && now - _statsCache.ts < STATS_TTL) {
      return NextResponse.json(_statsCache.data, {
        headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
      });
    }

    // Fetch real counts from Supabase in parallel
    // Use getTable() so we hit the right table name (shared_code in Aura, templates in user project)
    const templatesTable = getTable("template");
    const componentsTable = getTable("component");
    const assetsTable = getTable("asset");

    const [
      templates,
      components,
      assets,
      skills,
      designSystems,
      featuredTemplates,
      premiumTemplates,
      topTags,
    ] = await Promise.all([
      getCount(templatesTable),
      getCount(componentsTable),
      getCount(assetsTable),
      getSkillsCount(),
      getDesignSystemsCount(),
      getCount(templatesTable, "featured=is.true"),
      getCount(templatesTable, "premium=is.true"),
      getTopTags(),
    ]);

    const featuredTotal =
      featuredTemplates +
      (await getCount(componentsTable, "featured=is.true")) +
      (await getCount(assetsTable, "featured=is.true"));

    const premiumTotal =
      premiumTemplates +
      (await getCount(componentsTable, "premium=is.true")) +
      (await getCount(assetsTable, "premium=is.true"));

    const stats = {
      total_items: templates + components + assets + skills + designSystems,
      templates,
      components,
      assets,
      skills,
      design_systems: designSystems,
      featured: featuredTotal,
      premium: premiumTotal,
      top_tags: topTags,
    };

    _statsCache = { data: stats, ts: now };

    return NextResponse.json(stats, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
    });
  } catch (e: any) {
    console.error("[stats API] Error:", e?.message);
    // Fallback to manifest if Supabase fails
    try {
      const { promises: fs } = await import("fs");
      const path = await import("path");
      const statsPath = path.join(
        process.cwd(),
        "download",
        "aura_library",
        "_meta",
        "stats.json",
      );
      const raw = await fs.readFile(statsPath, "utf-8");
      return NextResponse.json(JSON.parse(raw), {
        headers: { "Cache-Control": "public, max-age=60" },
      });
    } catch {
      return NextResponse.json({
        total_items: 0,
        templates: 0,
        components: 0,
        assets: 0,
        skills: 0,
        design_systems: 0,
        featured: 0,
        premium: 0,
        top_tags: [],
      });
    }
  }
}
