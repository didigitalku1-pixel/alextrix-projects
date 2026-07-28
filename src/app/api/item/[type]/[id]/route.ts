import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  SUPA_URL,
  SUPA_ANON_KEY,
  SELECT_MAP,
  getTable,
  fixImageUrl,
  fetchWithTimeout,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Lookup item in manifest-lite.json as fallback when Supabase is unreachable.
 * Manifest contains all items with basic metadata (no code/content).
 */
async function getItemFromManifest(type: string, id: string): Promise<any | null> {
  try {
    if (type === "skill") {
      const skillsPath = path.join(
        process.cwd(),
        "download",
        "aura_library",
        "skills-manifest.json",
      );
      const raw = await fs.readFile(skillsPath, "utf-8");
      const manifest = JSON.parse(raw);
      // EXACT match only
      return (
        manifest.items?.find(
          (i: any) =>
            i.file === id || i.id === id || i.slug === id,
        ) || null
      );
    }

    // For template/component/asset: use manifest-lite.json
    const manifestPath = path.join(
      process.cwd(),
      "download",
      "aura_library",
      "manifest-lite.json",
    );
    const raw = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    // Filter by type and id
    const items = (manifest.items || []).filter((i: any) => {
      if (i.type !== type) return false;
      // Match by id (numeric or string)
      return String(i.id) === String(id) || i.slug === id || i.file === id;
    });

    return items.length > 0 ? items[0] : null;
  } catch {
    return null;
  }
}

/**
 * GET /api/item/[type]/[id]
 *
 * Lookup strategy:
 *  1. For skills, read from skills-manifest.json (in-repo file)
 *  2. For other types, query Supabase:
 *     a. First by slug (if id is a non-numeric string)
 *     b. Then by id (if numeric)
 *  3. Fallback: lookup in manifest-lite.json
 *
 * SECURITY: We do NOT use fuzzy matching like `includes(id)` because it
 * can return the wrong item. Exact match only.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await params;
  const decodedId = decodeURIComponent(id);

  if (!decodedId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    // For skills: ALWAYS use skills-manifest.json first
    if (type === "skill") {
      try {
        const skillsPath = path.join(
          process.cwd(),
          "download",
          "aura_library",
          "skills-manifest.json",
        );
        const raw = await fs.readFile(skillsPath, "utf-8");
        const skillsManifest = JSON.parse(raw);
        const skill = skillsManifest.items?.find(
          (i: any) =>
            i.file === decodedId ||
            i.id === decodedId ||
            i.slug === decodedId,
        );
        if (skill) return NextResponse.json(skill);
      } catch (e) {
        console.error("[item API] skills manifest read error:", e);
      }
    }

    // Validate type and get table name (Aura: shared_code for templates; User: plural)
    const validTypes = ["template", "component", "asset", "skill"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    const table = getTable(type);

    const select = SELECT_MAP[type];
    if (!select) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Determine lookup strategy: by slug (string) or by id (numeric)
    const isNumericId = /^\d+$/.test(decodedId);
    const lookupField = isNumericId ? "id" : "slug";

    let data: any[] = [];
    let supabaseOk = true;

    try {
      const r = await fetchWithTimeout(
        `${SUPA_URL}/rest/v1/${table}?select=${select}&${lookupField}=eq.${encodeURIComponent(decodedId)}&limit=1`,
        {
          headers: {
            apikey: SUPA_ANON_KEY,
            Authorization: `Bearer ${SUPA_ANON_KEY}`,
          },
        },
        8000,
      );

      if (r.ok) {
        data = await r.json();
      } else if (r.status !== 404) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            `[item API] Supabase ${r.status} for ${type}/${decodedId} (${lookupField})`,
          );
        }
      }
    } catch {
      // Network error / timeout — fall back to manifest
      supabaseOk = false;
    }

    // If primary lookup failed, try alternate lookup
    if ((!data || data.length === 0) && supabaseOk) {
      const altField = isNumericId ? "slug" : "id";
      try {
        const r = await fetchWithTimeout(
          `${SUPA_URL}/rest/v1/${table}?select=${select}&${altField}=eq.${encodeURIComponent(decodedId)}&limit=1`,
          {
            headers: {
              apikey: SUPA_ANON_KEY,
              Authorization: `Bearer ${SUPA_ANON_KEY}`,
            },
          },
          8000,
        );
        if (r.ok) {
          data = await r.json();
        }
      } catch {
        // ignore — fall through to manifest fallback
      }
    }

    // If still no data, fallback to manifest
    if (!data || data.length === 0) {
      const manifestItem = await getItemFromManifest(type, decodedId);
      if (manifestItem) {
        return NextResponse.json({
          ...manifestItem,
          type,
          // Ensure required fields are present
          desc: manifestItem.desc || manifestItem.description || "",
          tags: Array.isArray(manifestItem.tags)
            ? manifestItem.tags
            : Array.isArray(manifestItem.keywords)
              ? manifestItem.keywords
              : [],
          image: fixImageUrl(manifestItem.image),
          has_code: !!manifestItem.code_chars && manifestItem.code_chars > 0,
          code_chars: manifestItem.code_chars || 0,
          file:
            manifestItem.file ||
            `${String(manifestItem.id).padStart(type === "asset" ? 8 : 6, "0")}_${manifestItem.slug || manifestItem.id}`,
        });
      }
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const raw = data[0];
    const item: any = {
      id: raw.id,
      type,
      slug: raw.slug || null,
      title: raw.title || "Untitled",
      desc: raw.description || "",
      tags: Array.isArray(raw.tags) ? raw.tags : Array.isArray(raw.keywords) ? raw.keywords : [],
      image: fixImageUrl(
        raw.image_url || raw.image_1600w || raw.image_800w || raw.image_320w || null,
      ),
      views: raw.views || 0,
      forks: raw.forks || 0,
      premium: raw.premium || false,
      featured: raw.featured || false,
      private: raw.private || false,
      username: raw.username || raw.created_by || null,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      has_code: !!raw.code,
      code_chars: (raw.code || "").length,
      file: `${String(raw.id).padStart(type === "asset" ? 8 : 6, "0")}_${raw.slug || raw.id}`,
    };

    if (type === "skill") {
      item.content = raw.content || "";
      item.has_content = !!raw.content;
      item.content_chars = (raw.content || "").length;
    }

    return NextResponse.json(item);
  } catch (e: any) {
    console.error("[item API] Unhandled error:", e?.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
