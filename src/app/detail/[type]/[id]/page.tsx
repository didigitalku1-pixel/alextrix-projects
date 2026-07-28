import { permanentRedirect, notFound } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import { SUPA_URL, SUPA_ANON_KEY, fetchWithTimeout } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * Look up slug/id in manifest file (fallback when Supabase is unreachable).
 */
async function lookupInManifest(
  table: string,
  type: string,
  id: string,
): Promise<{ slug: string | null; id: string | number } | null> {
  try {
    // Skills
    if (type === "skill") {
      const skillsPath = path.join(
        process.cwd(),
        "download",
        "aura_library",
        "skills-manifest.json",
      );
      const raw = await fs.readFile(skillsPath, "utf-8");
      const manifest = JSON.parse(raw);
      const item = manifest.items?.find(
        (i: any) => i.file === id || i.id === id || i.slug === id,
      );
      if (item) {
        return { slug: item.file || item.slug || String(item.id), id: item.id };
      }
      return null;
    }

    // Other types - use manifest-lite.json
    const manifestPath = path.join(
      process.cwd(),
      "download",
      "aura_library",
      "manifest-lite.json",
    );
    const raw = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);
    const item = (manifest.items || []).find(
      (i: any) =>
        i.type === type &&
        (String(i.id) === String(id) || i.slug === id || i.file === id),
    );
    if (item) {
      return { slug: item.slug || String(item.id), id: item.id };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Legacy /detail/[type]/[id] route.
 * 301 PERMANENT redirect to /<type>s/<slug> for SEO consolidation.
 */
export default async function DetailRedirectPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const decodedId = decodeURIComponent(id);

  // Normalize type → singular form used in API
  const singular = type.replace(/s$/, "");
  const table =
    singular === "template" ? "templates" :
    singular === "component" ? "components" :
    singular === "asset" ? "assets" :
    singular === "skill" ? "skills" : null;

  if (!table) {
    notFound();
  }

  let slug: string | null = null;
  let file: string | null = null;

  try {
    if (singular === "skill") {
      // Skills route expects the `file` field.
      slug = decodedId;
      file = decodedId;
    } else {
      const isNumericId = /^\d+$/.test(decodedId);
      const lookupField = isNumericId ? "id" : "slug";

      let data: any[] = [];
      let supabaseOk = true;

      try {
        const r = await fetchWithTimeout(
          `${SUPA_URL}/rest/v1/${table}?select=slug,id&${lookupField}=eq.${encodeURIComponent(decodedId)}&limit=1`,
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
        // Network error — try manifest fallback
        supabaseOk = false;
      }

      // Fallback: try alternate lookup field
      if ((!data || data.length === 0) && supabaseOk) {
        const altField = isNumericId ? "slug" : "id";
        try {
          const r = await fetchWithTimeout(
            `${SUPA_URL}/rest/v1/${table}?select=slug,id&${altField}=eq.${encodeURIComponent(decodedId)}&limit=1`,
            {
              headers: {
                apikey: SUPA_ANON_KEY,
                Authorization: `Bearer ${SUPA_ANON_KEY}`,
              },
            },
            8000,
          );
          if (r.ok) data = await r.json();
        } catch {
          // ignore
        }
      }

      // Manifest fallback
      if (!data || data.length === 0) {
        const manifestItem = await lookupInManifest(table, singular, decodedId);
        if (manifestItem) {
          data = [manifestItem];
        }
      }

      if (data && data.length > 0) {
        const item = data[0];
        slug = item.slug || String(item.id);
        file = `${String(item.id).padStart(singular === "asset" ? 8 : 6, "0")}_${item.slug || item.id}`;
      }
    }
  } catch {
    // Fall through to 404
  }

  if (!slug) {
    notFound();
  }

  // Skills route expects `file` as param (it does its own manifest lookup)
  const routeSegment = singular === "skill" ? file || slug : slug;
  const target = `/${singular === "template" ? "templates" : singular === "component" ? "components" : singular === "asset" ? "assets" : "skills"}/${routeSegment}`;

  // PERMANENT redirect (301) for SEO consolidation
  // Next.js 16: use permanentRedirect() for 301, redirect() defaults to 307
  permanentRedirect(target);
}
