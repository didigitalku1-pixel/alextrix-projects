import { redirect, notFound } from "next/navigation";

const SUPA_URL = process.env.USER_SUPABASE_URL || "https://njgtmqwyabfknyktuwzc.supabase.co";
const SUPA_KEY = process.env.USER_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3RtcXd5YWJma255a3R1d3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDM3MDcsImV4cCI6MjA5ODY3OTcwN30.10WHq_NOsG0wLJfsgHNSp0j4CPCqqZ12_bY9Q1h5kOI";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * Legacy /detail/[type]/[id] route.
 * 301 permanent redirect to /<type>s/<slug> for SEO consolidation.
 *
 * Examples:
 *   /detail/template/11908  → /templates/auragen
 *   /detail/component/1417  → /components/CB0A1
 *   /detail/asset/42        → /assets/<slug>
 *   /detail/skill/abc-123   → /skills/<file>
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
      // Skills route expects the `file` field. Pass-through and let the SlugDetail
      // component resolve via skills-manifest.json.
      slug = decodedId;
      file = decodedId;
    } else {
      // Try by slug first
      let r = await fetch(
        `${SUPA_URL}/rest/v1/${table}?select=slug,id&slug=eq.${encodeURIComponent(decodedId)}&limit=1`,
        { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
      );
      let data = r.ok ? await r.json() : [];

      // If not found by slug, try by numeric ID
      if (!data || data.length === 0) {
        r = await fetch(
          `${SUPA_URL}/rest/v1/${table}?select=slug,id&id=eq.${encodeURIComponent(decodedId)}&limit=1`,
          { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
        );
        data = r.ok ? await r.json() : [];
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

  // Skills route expects `file` as the param (it does its own manifest lookup)
  const routeSegment = singular === "skill" ? (file || slug) : slug;
  const target = `/${singular === "template" ? "templates" : singular === "component" ? "components" : singular === "asset" ? "assets" : "skills"}/${routeSegment}`;

  // Next.js `redirect()` returns a 307 by default; pass `status: 301` for permanent SEO redirect.
  redirect(target);
}
