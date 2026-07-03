import { promises as fs } from "fs";
import path from "path";

const LIBRARY_DIR = path.join(process.cwd(), "download", "aura_library");
const MANIFEST_PATH_LITE = path.join(LIBRARY_DIR, "manifest-lite.json");
const MANIFEST_PATH = path.join(LIBRARY_DIR, "manifest.json");
const STATS_PATH = path.join(LIBRARY_DIR, "_meta", "stats.json");

export type ItemType = "template" | "component" | "asset" | "skill";

export interface ManifestItem {
  id: string | number;
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
  templates_count: number;
  components_count: number;
  assets_count: number;
  skills_count: number;
  items: ManifestItem[];
}

export interface Stats {
  total_items: number;
  templates: number;
  components: number;
  assets: number;
  skills: number;
  featured: number;
  premium: number;
  top_tags: [string, number][];
}

let _manifest: Manifest | null = null;
let _stats: Stats | null = null;

export async function getManifest(): Promise<Manifest> {
  if (_manifest) return _manifest;
  // Try lite manifest first (for Vercel deployment), then full
  for (const p of [MANIFEST_PATH_LITE, MANIFEST_PATH]) {
    try {
      const raw = await fs.readFile(p, "utf-8");
      _manifest = JSON.parse(raw);
      return _manifest;
    } catch {}
  }
  // Fallback: empty manifest
  _manifest = {
    generated_at: new Date().toISOString(),
    total: 0,
    templates_count: 0,
    components_count: 0,
    assets_count: 0,
    skills_count: 0,
    items: [],
  };
  return _manifest;
}

export async function getStats(): Promise<Stats> {
  if (_stats) return _stats;
  try {
    const raw = await fs.readFile(STATS_PATH, "utf-8");
    _stats = JSON.parse(raw);
  } catch {
    const m = await getManifest();
    _stats = {
      total_items: m.total,
      templates: m.templates_count,
      components: m.components_count,
      assets: m.assets_count,
      skills: m.skills_count,
      featured: 0,
      premium: 0,
      top_tags: [],
    };
  }
  return _stats;
}

export interface QueryParams {
  type?: string;
  sort?: string;
  tag?: string;
  q?: string;
  premium?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export async function queryItems(params: QueryParams) {
  const m = await getManifest();
  let items = m.items;

  if (params.type && params.type !== "all") {
    items = items.filter((i) => i.type === params.type);
  }
  if (params.tag) {
    items = items.filter((i) =>
      (i.tags || []).some((t) => t.toLowerCase() === params.tag!.toLowerCase()),
    );
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.desc || "").toLowerCase().includes(q) ||
        (i.tags || []).some((t) => t.toLowerCase().includes(q)),
    );
  }
  if (params.premium) items = items.filter((i) => i.premium);
  if (params.featured) items = items.filter((i) => i.featured);

  switch (params.sort) {
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
    default:
      items = [...items].sort((a, b) => b.views - a.views);
  }

  const total = items.length;
  const limit = Math.min(Math.max(params.limit || 24, 1), 100);
  const page = Math.max(params.page || 1, 1);
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return { items: paged, total, page, totalPages, limit };
}

export async function getItemFromManifest(type: string, id: string): Promise<ManifestItem | null> {
  const m = await getManifest();
  return m.items.find((i) => i.type === type && String(i.id) === String(id)) || null;
}

export async function getLearnPage(page: string): Promise<{ content: string; available: boolean }> {
  const idPath = path.join(LIBRARY_DIR, "learn", "id", `${page}.md`);
  const enPath = path.join(LIBRARY_DIR, "learn", "extracted", `${page}.md`);
  try {
    const raw = await fs.readFile(idPath, "utf-8");
    if (raw.length > 100) return { content: raw, available: true };
  } catch {}
  try {
    const raw = await fs.readFile(enPath, "utf-8");
    if (raw.length > 100)
      return {
        content: `> Catatan: Konten ini belum diterjemahkan ke Bahasa Indonesia.\n\n${raw}`,
        available: true,
      };
  } catch {}
  return { content: "Konten belum tersedia.", available: false };
}

export const LEARN_PAGES = [
  { id: "introduction", label: "Pengenalan" },
  { id: "tips-for-prompting", label: "Tips Prompting" },
  { id: "how-to-prompt", label: "Cara Prompt" },
  { id: "how-to-design", label: "Cara Edit" },
  { id: "seo-settings", label: "Pengaturan SEO" },
  { id: "faq", label: "FAQ" },
  { id: "custom-domain", label: "Domain Kustom" },
  { id: "video-tutorials", label: "Tutorial Video" },
  { id: "documentation", label: "Dokumentasi" },
];

export function esc(s: any): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escAttr(s: any): string {
  return esc(s);
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n || 0);
}
