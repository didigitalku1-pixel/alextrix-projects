/**
 * Schema validation tests.
 *
 * These tests catch the exact bug we just fixed:
 *   "column components.username does not exist"
 *
 * The bug happened because the SELECT clause for `/api/item/[type]/[id]` reused
 * the same column list for templates and components, but components doesn't
 * have a `username` column.
 *
 * These tests query Supabase directly with each table's SELECT clause and
 * verify the query succeeds (200 OK). If a column doesn't exist, Supabase
 * returns 400 with code "42703" — we catch that here.
 */

import { describe, it, expect } from "vitest";

const SUPA_URL = "https://njgtmqwyabfknyktuwzc.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3RtcXd5YWJma255a3R1d3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDM3MDcsImV4cCI6MjA5ODY3OTcwN30.10WHq_NOsG0wLJfsgHNSp0j4CPCqqZ12_bY9Q1h5kOI";

// Mirror of SELECT_MAP in src/app/api/item/[type]/[id]/route.ts
const SELECT_MAP = {
  template: "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,username,created_at",
  component: "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,background,created_by,created_at",
  asset: "id,slug,title,description,keywords,image_1600w,image_800w,image_320w,views,media_type,resolution,colors,created_at",
  skill: "id,title,description,content,tags,views,forks,created_at",
};

// Table name per type
const TABLE_MAP = {
  template: "templates",
  component: "components",
  asset: "assets",
  skill: "skills",
};

async function testSelect(table: string, select: string): Promise<{ ok: boolean; status: number; body: any }> {
  const url = `${SUPA_URL}/rest/v1/${table}?select=${select}&limit=1`;
  const r = await fetch(url, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  const body = await r.json().catch(() => null);
  return { ok: r.ok, status: r.status, body };
}

describe("Schema validation — SELECT clauses match table columns", () => {
  // This is the test that would have caught the original bug
  for (const [type, select] of Object.entries(SELECT_MAP)) {
    const table = TABLE_MAP[type as keyof typeof TABLE_MAP];
    it(`SELECT clause for ${type} (table: ${table}) is valid`, async () => {
      const result = await testSelect(table, select);
      expect(result.ok, `Supabase rejected SELECT for ${table}: ${JSON.stringify(result.body)}`).toBe(true);
      expect(result.status, `Expected 200/206, got ${result.status}`).not.toBe(400);
      expect(result.body, `Response should not contain error code`).not.toHaveProperty("code", "42703");
    });

    it(`SELECT clause for ${type} does NOT reference non-existent columns`, async () => {
      const result = await testSelect(table, select);
      if (result.body?.message?.includes("does not exist")) {
        throw new Error(`Column reference invalid: ${result.body.message}`);
      }
    });
  }

  // Specific regression tests for the bug we just fixed
  it("components table does NOT have a 'username' column", async () => {
    const r = await testSelect("components", "username");
    expect(r.ok).toBe(false);
    expect(r.body?.code).toBe("42703");
    expect(r.body?.message).toContain("username");
  });

  it("templates table HAS 'username' column", async () => {
    const r = await testSelect("templates", "username");
    expect(r.ok).toBe(true);
  });

  it("components table HAS 'background' column", async () => {
    const r = await testSelect("components", "background");
    expect(r.ok).toBe(true);
  });

  it("components table HAS 'created_by' column", async () => {
    const r = await testSelect("components", "created_by");
    expect(r.ok).toBe(true);
  });

  it("assets table HAS 'keywords' column", async () => {
    const r = await testSelect("assets", "keywords");
    expect(r.ok).toBe(true);
  });

  it("assets table does NOT have 'username' column", async () => {
    const r = await testSelect("assets", "username");
    expect(r.ok).toBe(false);
    expect(r.body?.code).toBe("42703");
  });

  it("skills table HAS 'content' column", async () => {
    const r = await testSelect("skills", "content");
    expect(r.ok).toBe(true);
  });

  it("skills table does NOT have 'premium' column (regression: was in SELECT_MAP)", async () => {
    const r = await testSelect("skills", "premium");
    expect(r.ok).toBe(false);
    expect(r.body?.code).toBe("42703");
  });

  it("skills table does NOT have 'featured' column", async () => {
    const r = await testSelect("skills", "featured");
    expect(r.ok).toBe(false);
    expect(r.body?.code).toBe("42703");
  });

  it("skills table does NOT have 'slug' column (uses 'id' UUID instead)", async () => {
    const r = await testSelect("skills", "slug");
    expect(r.ok).toBe(false);
    expect(r.body?.code).toBe("42703");
  });
});

describe("Schema consistency — verify table column inventory", () => {
  it("templates has expected columns", async () => {
    const r = await fetch(`${SUPA_URL}/rest/v1/templates?select=id,slug,title,description,code,tags,image_url,views,forks,premium,featured,username,category,long_description,language,share_source_code,created_at,updated_at&limit=1`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    });
    expect(r.ok).toBe(true);
  });

  it("components has expected columns (incl. background, created_by, NO username)", async () => {
    const r = await fetch(`${SUPA_URL}/rest/v1/components?select=id,slug,title,description,code,tags,image_url,views,forks,premium,featured,background,created_by,created_at,updated_at&limit=1`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    });
    expect(r.ok, `components table column inventory changed — check schema`).toBe(true);
  });

  it("assets has expected columns (incl. keywords, image_*w, media_type, colors)", async () => {
    const r = await fetch(`${SUPA_URL}/rest/v1/assets?select=id,slug,title,description,keywords,resolution,colors,image_320w,image_800w,image_1600w,image_3840w,image_original,media_type,views,premium,featured,created_by,created_at,updated_at&limit=1`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    });
    expect(r.ok).toBe(true);
  });

  it("skills has expected columns (no premium/featured/slug/image_url)", async () => {
    const r = await fetch(`${SUPA_URL}/rest/v1/skills?select=id,title,description,content,tags,views,forks,created_at&limit=1`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    });
    expect(r.ok).toBe(true);
  });
});
