import { promises as fs } from "fs";
import path from "path";

const LIBRARY_DIR = process.env.AURA_LIBRARY_DIR || path.join(process.cwd(), "download", "aura_library");
const MANIFEST_PATH = path.join(LIBRARY_DIR, "manifest.json");
const STATS_PATH = path.join(LIBRARY_DIR, "_meta", "stats.json");

export type ItemType = "component" | "template";

export interface ManifestItem {
  id: number;
  type: ItemType;
  slug: string;
  title: string;
  desc: string;
  tags: string[];
  image: string | null;
  views: number;
  forks: number;
  premium: boolean;
  featured: boolean;
  private: boolean;
  username: string | null;
  category: string | null;
  created_at: string | null;
  has_code: boolean;
  code_chars: number;
  file: string;
}

export interface Manifest {
  generated_at: string;
  total: number;
  components_count: number;
  templates_count: number;
  items: ManifestItem[];
}

export interface Stats {
  generated_at: string;
  total_items: number;
  components: number;
  templates: number;
  with_code: number;
  premium: number;
  featured: number;
  with_image: number;
  top_tags: [string, number][];
  total_code_chars: number;
}

export interface FullItem extends ManifestItem {
  code: string;
  long_description?: string | null;
  language?: string | null;
  share_source_code?: boolean | null;
  background?: string | null;
  credit_name?: string | null;
  credit_url?: string | null;
  updated_at?: string | null;
}

// === TTL cache (5 minutes) ===
// Replaces indefinite cache that could serve stale data in long-running servers.
let _manifestCache: Manifest | null = null;
let _manifestCacheTime = 0;
let _statsCache: Stats | null = null;
let _statsCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function getManifest(): Promise<Manifest> {
  const now = Date.now();
  if (_manifestCache && now - _manifestCacheTime < CACHE_TTL) {
    return _manifestCache;
  }
  const raw = await fs.readFile(MANIFEST_PATH, "utf-8");
  _manifestCache = JSON.parse(raw) as Manifest;
  _manifestCacheTime = now;
  return _manifestCache;
}

export async function getStats(): Promise<Stats> {
  const now = Date.now();
  if (_statsCache && now - _statsCacheTime < CACHE_TTL) {
    return _statsCache;
  }
  const raw = await fs.readFile(STATS_PATH, "utf-8");
  _statsCache = JSON.parse(raw) as Stats;
  _statsCacheTime = now;
  return _statsCache;
}

export async function getItem(
  type: ItemType,
  id: number,
): Promise<FullItem | null> {
  const subdir = type === "component" ? "components" : "templates";
  const dir = path.join(LIBRARY_DIR, subdir);
  const files = await fs.readdir(dir);
  const prefix = `${String(id).padStart(6, "0")}_`;
  const jsonFile = files.find((f) => f.startsWith(prefix) && f.endsWith(".json"));
  if (!jsonFile) return null;
  const fullPath = path.join(dir, jsonFile);
  const raw = await fs.readFile(fullPath, "utf-8");
  const data = JSON.parse(raw);
  return {
    ...(data as any),
    type,
    file: jsonFile.replace(/\.json$/, ""),
    desc: data.description || "",
    has_code: !!data.code,
    code_chars: (data.code || "").length,
  } as FullItem;
}

export async function getItemByFile(
  type: ItemType,
  file: string,
): Promise<FullItem | null> {
  const subdir = type === "component" ? "components" : "templates";
  const fullPath = path.join(LIBRARY_DIR, subdir, `${file}.json`);
  try {
    const raw = await fs.readFile(fullPath, "utf-8");
    const data = JSON.parse(raw);
    return {
      ...(data as any),
      type,
      file,
      desc: data.description || "",
      has_code: !!data.code,
      code_chars: (data.code || "").length,
    } as FullItem;
  } catch {
    return null;
  }
}

export async function getArtifact(
  type: ItemType,
  file: string,
  artifact: "design_md" | "recreation_prompt",
): Promise<string | null> {
  const subdir = type === "component" ? "components" : "templates";
  const ext = artifact === "design_md" ? "design.md" : "prompt.md";
  const fullPath = path.join(LIBRARY_DIR, subdir, `${file}.${ext}`);
  try {
    return await fs.readFile(fullPath, "utf-8");
  } catch {
    return null;
  }
}

export interface QueryParams {
  type?: ItemType | "all";
  sort?: "views" | "recent" | "forks" | "az";
  tag?: string;
  q?: string;
  premium?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface QueryResult {
  items: ManifestItem[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export async function queryItems(params: QueryParams): Promise<QueryResult> {
  const manifest = await getManifest();
  let items = manifest.items;

  if (params.type && params.type !== "all") {
    items = items.filter((i) => i.type === params.type);
  }

  if (params.tag) {
    const tagL = params.tag.toLowerCase();
    items = items.filter((i) =>
      i.tags.some((t) => t.toLowerCase() === tagL),
    );
  }

  if (params.q) {
    const q = params.q.toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.desc.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  if (params.premium) {
    items = items.filter((i) => i.premium);
  }

  if (params.featured) {
    items = items.filter((i) => i.featured);
  }

  const sort = params.sort || "views";
  switch (sort) {
    case "views":
      items = [...items].sort((a, b) => b.views - a.views);
      break;
    case "forks":
      items = [...items].sort((a, b) => b.forks - a.forks);
      break;
    case "recent":
      items = [...items].sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime(),
      );
      break;
    case "az":
      items = [...items].sort((a, b) => a.title.localeCompare(b.title));
      break;
  }

  const total = items.length;
  const limit = Math.min(Math.max(params.limit || 24, 1), 100);
  const page = Math.max(params.page || 1, 1);
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return { items: paged, total, page, totalPages, limit };
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const stats = await getStats();
  return stats.top_tags.map(([tag, count]) => ({ tag, count }));
}
