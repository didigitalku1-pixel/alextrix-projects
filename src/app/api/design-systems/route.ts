import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";


export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Cache manifest
let _dsManifest: any = null;

async function getDSManifest() {
  if (_dsManifest) return _dsManifest;
  try {
    const p = path.join(process.cwd(), "download", "aura_library", "design-systems-manifest.json");
    const raw = await fs.readFile(p, "utf-8");
    _dsManifest = JSON.parse(raw);
  } catch {
    _dsManifest = { items: [] };
  }
  return _dsManifest;
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const sort = p.get("sort") || "popular";
  const q = p.get("q") || undefined;
  const page = Math.max(parseInt(p.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(p.get("limit") || "24", 10), 1), 100);

  try {
    const manifest = await getDSManifest();
    let items = manifest.items || [];

    if (q) {
      const ql = q.toLowerCase();
      items = items.filter((i: any) =>
        i.title.toLowerCase().includes(ql) || (i.desc || "").toLowerCase().includes(ql)
      );
    }

    switch (sort) {
      case "random":
        items = [...items].sort(() => Math.random() - 0.5);
        break;
      case "recent":
        items = [...items].sort((a: any, b: any) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case "az":
        items = [...items].sort((a: any, b: any) => a.title.localeCompare(b.title));
        break;
      default:
        items = [...items].sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return NextResponse.json({ items: paged, total, page, totalPages: Math.ceil(total / limit), limit });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
