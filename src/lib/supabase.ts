/**
 * Centralized Supabase configuration.
 *
 * SECURITY NOTES:
 * - All API routes MUST import from this file, never hardcode URLs/keys.
 * - Anon keys are public (RLS protects data), but should still be rotated
 *   via env vars to ease key rotation.
 * - Service-role keys MUST NEVER appear in app code. They are only for
 *   migration scripts run locally with env vars.
 *
 * DEFAULT: Uses Aura.build Supabase (https://hoirqrkdgbmvpwutwuwj.supabase.co)
 * because the user's project (njgtmqwyabfknyktuwzc) is currently paused
 * (INACTIVE status — org under service restrictions, requires paid plan).
 *
 * To switch back to user's project once reactivated, set env var:
 *   USER_SUPABASE_URL=https://njgtmqwyabfknyktuwzc.supabase.co
 *   USER_SUPABASE_ANON_KEY=<anon key from Supabase Dashboard>
 */

// === User's NEW Supabase project (kvkwiekfdlaeeabkwmhp) — primary source ===
// Data migrated from Aura.build: 21,560 templates, 2,829 components, 100 skills, 725 design_systems
export const USER_SUPA_URL =
  process.env.USER_SUPABASE_URL || "https://kvkwiekfdlaeeabkwmhp.supabase.co";
export const USER_SUPA_ANON_KEY =
  process.env.USER_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2a3dpZWtmZGxhZWVhYmt3bWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTkxMzEsImV4cCI6MjEwMDgzNTEzMX0.7w5-8HP3h_G5UUkwVY6Mi68dBLdNyDn9JLM3g_27X5I";

// === Aura.build Supabase (legacy fallback — read-only public) ===
export const AURA_SUPA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co";
export const AURA_SUPA_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c";

// === Default Supabase config used by app routes ===
// Default: User's new project. Set USE_AURA_FALLBACK=1 to use legacy Aura project.
const useUserSupabase = process.env.USE_AURA_FALLBACK !== "1";

export const SUPA_URL = useUserSupabase ? USER_SUPA_URL : AURA_SUPA_URL;
export const SUPA_ANON_KEY = useUserSupabase
  ? USER_SUPA_ANON_KEY
  : AURA_SUPA_ANON_KEY;

// === Table name mapping ===
// User Supabase uses plural table names (templates, components, assets, skills).
// Aura.build uses shared_code for templates, others plural.
export const IS_USER_SUPABASE = useUserSupabase;

export function getTable(type: string): string {
  if (IS_USER_SUPABASE) {
    const map: Record<string, string> = {
      template: "templates",
      component: "components",
      asset: "assets",
      skill: "skills",
      design_system: "design_systems",
    };
    return map[type] || type;
  }
  // Aura.build: templates live in shared_code table
  if (type === "template") return "shared_code";
  return type + "s";
}

// === Per-table SELECT clauses ===
// Aura.build schema is different from user's:
//   - shared_code has username (not created_by)
//   - components has created_by (not username)
//   - assets has keywords, image_1600w, image_800w, image_320w (not image_url)
//   - skills has no slug (UUID only), no premium/featured
export const SELECT_MAP: Record<string, string> = IS_USER_SUPABASE
  ? {
      // User Supabase schema
      template:
        "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,username,category,created_at,updated_at",
      component:
        "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,background,created_by,created_at,updated_at",
      asset:
        "id,slug,title,description,keywords,resolution,colors,image_1600w,image_800w,image_320w,views,media_type,premium,featured,created_by,created_at,updated_at",
      skill: "id,slug,title,description,content,tags,views,forks,created_at,updated_at",
      design_system: "*",
    }
  : {
      // Aura.build schema
      template:
        "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,username,created_at",
      component:
        "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,background,created_by,created_at",
      asset:
        "id,slug,title,description,keywords,resolution,colors,image_1600w,image_800w,image_320w,views,media_type,created_at",
      // Note: skills table requires auth on Aura.build — handled via skills-manifest.json
      skill: "id,title,description,content,tags,views,forks,created_at",
      design_system: "*",
    };

// === Image URL sanitizer ===
// Aura.build storage sometimes returns URLs with the "-all" subdomain suffix
// which 404s. Fix by stripping the suffix.
export function fixImageUrl(url: string | null): string | null {
  if (!url) return null;
  return url.replace(
    "hoirqrkdgbmvpwutwuwj-all.supabase.co",
    "hoirqrkdgbmvpwutwuwj.supabase.co",
  );
}

// === Allowed image hostnames (for /api/image SSRF protection) ===
// ONLY these hosts may be proxied via /api/image — blocks example.com, localhost, etc.
export const ALLOWED_IMAGE_HOSTS = new Set<string>([
  "kvkwiekfdlaeeabkwmhp.supabase.co", // User's NEW project (primary)
  "hoirqrkdgbmvpwutwuwj.supabase.co", // Aura.build (legacy, still hosts images)
  "njgtmqwyabfknyktuwzc.supabase.co", // User's old project (paused)
]);

// === Edge function URL (for DESIGN.md generation) ===
export const AURA_EDGE_URL = `${AURA_SUPA_URL}/functions/v1/generate-template-artifact`;
export const AURA_AUTH_URL = `${AURA_SUPA_URL}/auth/v1/token`;

// === Helper: fetch with timeout (prevents hanging on Supabase slow response) ===
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

// === Helper: validate that a Supabase response is OK; throw with context if not ===
export async function ensureOk(r: Response, context: string): Promise<void> {
  if (!r.ok) {
    let body = "";
    try {
      body = await r.text();
    } catch {
      // ignore
    }
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[Supabase] ${context}: ${r.status} ${r.statusText}`,
        body.slice(0, 200),
      );
    }
    throw new Error(`Upstream ${r.status} for ${context}`);
  }
}
