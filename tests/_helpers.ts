/**
 * Test helpers for Aura Library API tests.
 *
 * Tests default to local dev server (http://localhost:3000).
 * Set TEST_TARGET=https://your-staging.example.com to test staging.
 * Set TEST_TARGET=https://web-library-coral.vercel.app to test production.
 *
 * The Supabase anon keys are the public anon keys already committed to the repo
 * (read-only, RLS-protected). Tests only read public data — never write.
 */

const DEFAULT_LOCAL = "http://localhost:3000";
const PROD_URL = "https://web-library-coral.vercel.app";

// Default to local dev for safety — production testing requires explicit opt-in
export const BASE_URL = process.env.TEST_TARGET || DEFAULT_LOCAL;

// Same anon key as in src/lib/supabase.ts (public, read-only)
const SUPA_URL = "https://njgtmqwyabfknyktuwzc.supabase.co";
const SUPA_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3RtcXd5YWJma255a3R1d3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDM3MDcsImV4cCI6MjA5ODY3OTcwN30.10WHq_NOsG0wLJfsgHNSp0j4CPCqqZ12_bY9Q1h5kOI";

/** Fetch JSON helper with sensible timeout. */
export async function fetchJson<T = any>(
  url: string,
  opts: RequestInit = {},
): Promise<{ status: number; data: T | null; text: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    const text = await r.text();
    let data: T | null = null;
    try {
      data = JSON.parse(text) as T;
    } catch {
      // Not JSON — leave data as null
    }
    return { status: r.status, data, text };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Fetch a slug from Supabase directly (so tests can pick real slugs that exist in DB).
 * Falls back to fetching from /api/items if Supabase is unreachable.
 */
export async function fetchSlugsFromSupabase(
  table: "templates" | "components" | "assets",
  limit = 5,
): Promise<{ slug: string; id: number }[]> {
  try {
    const url = `${SUPA_URL}/rest/v1/${table}?select=slug,id&order=views.desc&limit=${limit}`;
    const r = await fetch(url, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`Supabase ${table} fetch failed: ${r.status}`);
    return await r.json();
  } catch {
    // Fallback: fetch from API
    const type =
      table === "templates" ? "template" : table === "components" ? "component" : "asset";
    const r = await fetch(`${BASE_URL}/api/items?type=${type}&limit=${limit}`);
    if (!r.ok) throw new Error(`API ${table} fetch failed: ${r.status}`);
    const d = await r.json();
    return (d.items || []).map((i: any) => ({
      slug: i.slug || String(i.id),
      id: i.id,
    }));
  }
}

/** Fetch skill files from skills-manifest (committed JSON). */
export async function fetchSkillFiles(
  limit = 3,
): Promise<{ file: string; slug: string }[]> {
  const r = await fetch(`${BASE_URL}/api/items?type=skill&limit=${limit}`);
  if (!r.ok) throw new Error(`Skill fetch failed: ${r.status}`);
  const d = await r.json();
  return (d.items || []).map((i: any) => ({ file: i.file, slug: i.slug }));
}

/**
 * Check if test target is reachable. Set globalThis.__OFFLINE__ = true if not.
 * Tests should call skipIfOffline() at start.
 */
export async function ensureOnline(): Promise<void> {
  try {
    const r = await fetch(BASE_URL, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok && r.status !== 405) {
      throw new Error(`status ${r.status}`);
    }
  } catch (e: any) {
    console.warn(
      `⚠️  Skipping tests — base URL ${BASE_URL} unreachable: ${e.message}`,
    );
    console.warn(
      `   Set TEST_TARGET=http://localhost:3000 to test against local dev.`,
    );
    (globalThis as any).__OFFLINE__ = true;
  }
}

/** Test helper: skip if offline. Returns true if tests should be skipped. */
export function skipIfOffline() {
  return (globalThis as any).__OFFLINE__ === true;
}
