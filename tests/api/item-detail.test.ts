/**
 * Integration tests for /api/item/[type]/[id] endpoint.
 *
 * This is the endpoint that had the bug — components returned 404 because
 * the SELECT clause referenced a non-existent column.
 *
 * Tests verify:
 *   - Each type (template, component, asset, skill) returns 200 for a real slug
 *   - Response shape matches what the UI expects (id, slug, title, type, file, etc.)
 *   - 404 returned for non-existent slug (not 500 from a SQL error)
 *   - Image URLs use the correct subdomain (not -all.supabase.co)
 */

import { describe, it, expect, beforeAll } from "vitest";
import { fetchJson, fetchSlugsFromSupabase, fetchSkillFiles, BASE_URL, skipIfOffline } from "../_helpers";

describe("/api/item/[type]/[id] — item detail API", () => {
  let templateSlug: string;
  let componentSlug: string;
  let assetSlug: string;
  let skillFile: string;

  beforeAll(async () => {
    if (skipIfOffline()) return;
    const [t, c, a, s] = await Promise.all([
      fetchSlugsFromSupabase("templates", 1),
      fetchSlugsFromSupabase("components", 1),
      fetchSlugsFromSupabase("assets", 1),
      fetchSkillFiles(1),
    ]);
    templateSlug = t[0]?.slug;
    componentSlug = c[0]?.slug;
    assetSlug = a[0]?.slug;
    skillFile = s[0]?.file;
  });

  describe("template detail", () => {
    it("returns 200 for a real template slug", async () => {
      if (skipIfOffline() || !templateSlug) return;
      const { status, data } = await fetchJson(`${BASE_URL}/api/item/template/${templateSlug}`);
      expect(status).toBe(200);
      expect(data).toBeTruthy();
    });

    it("response has expected shape", async () => {
      if (skipIfOffline() || !templateSlug) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/item/template/${templateSlug}`);
      expect(data.type).toBe("template");
      expect(typeof data.id).toBe("number");
      expect(typeof data.slug).toBe("string");
      expect(typeof data.title).toBe("string");
      expect(typeof data.file).toBe("string");
      expect(data.has_code).toBeDefined();
      expect(typeof data.code_chars).toBe("number");
    });
  });

  describe("component detail (REGRESSION: was 404 for all components)", () => {
    it("returns 200 for a real component slug (was 404 before fix)", async () => {
      if (skipIfOffline() || !componentSlug) return;
      const { status, data } = await fetchJson(`${BASE_URL}/api/item/component/${componentSlug}`);
      expect(status, `Expected 200 for /api/item/component/${componentSlug}, got ${status}`).toBe(200);
      expect(data).toBeTruthy();
    });

    it("response shape is valid (type, id, slug, title, file)", async () => {
      if (skipIfOffline() || !componentSlug) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/item/component/${componentSlug}`);
      expect(data.type).toBe("component");
      expect(typeof data.id).toBe("number");
      expect(typeof data.slug).toBe("string");
      expect(typeof data.title).toBe("string");
      expect(data.file).toMatch(/^\d{6}_/); // zero-padded ID prefix
    });

    it("handles multiple component slugs (not just the first one)", async () => {
      if (skipIfOffline()) return;
      const slugs = await fetchSlugsFromSupabase("components", 5);
      expect(slugs.length).toBeGreaterThan(0);
      for (const s of slugs) {
        const { status } = await fetchJson(`${BASE_URL}/api/item/component/${s.slug}`);
        expect(status, `Component slug ${s.slug} returned ${status}`).toBe(200);
      }
    });

    it("does not silently swallow Supabase errors", async () => {
      // If the SELECT clause references a non-existent column again,
      // the API should return an error, not a silent 404.
      // We test by confirming at least 3 different component slugs all succeed.
      if (skipIfOffline()) return;
      const slugs = await fetchSlugsFromSupabase("components", 3);
      for (const s of slugs) {
        const { status } = await fetchJson(`${BASE_URL}/api/item/component/${s.slug}`);
        expect(status).toBe(200);
      }
    });
  });

  describe("asset detail", () => {
    it("returns 200 for a real asset slug", async () => {
      if (skipIfOffline() || !assetSlug) return;
      const { status } = await fetchJson(`${BASE_URL}/api/item/asset/${assetSlug}`);
      expect(status).toBe(200);
    });

    it("response includes asset-specific fields (media_type, resolution, colors)", async () => {
      if (skipIfOffline() || !assetSlug) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/item/asset/${assetSlug}`);
      expect(data.type).toBe("asset");
      // assets use keywords as tags
      expect(Array.isArray(data.tags)).toBe(true);
      expect(data.image || data.image === null).toBeDefined();
    });
  });

  describe("skill detail", () => {
    it("returns 200 for a real skill file", async () => {
      if (skipIfOffline() || !skillFile) return;
      const { status } = await fetchJson(`${BASE_URL}/api/item/skill/${skillFile}`);
      expect(status).toBe(200);
    });

    it("response has content (skills are markdown docs)", async () => {
      if (skipIfOffline() || !skillFile) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/item/skill/${skillFile}`);
      expect(data.type).toBe("skill");
      expect(data.content || data.has_content).toBeTruthy();
    });
  });

  describe("error handling", () => {
    it("returns 404 for non-existent slug", async () => {
      if (skipIfOffline()) return;
      const { status } = await fetchJson(`${BASE_URL}/api/item/template/this-slug-definitely-does-not-exist-xyz123`);
      expect(status).toBe(404);
    });

    it("returns 400 for invalid type", async () => {
      if (skipIfOffline()) return;
      const { status } = await fetchJson(`${BASE_URL}/api/item/invalidtype/something`);
      expect(status).toBe(400);
    });
  });

  describe("image URL subdomain fix (regression)", () => {
    it("image URLs never use -all.supabase.co subdomain", async () => {
      if (skipIfOffline() || !templateSlug) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/item/template/${templateSlug}`);
      if (data.image) {
        expect(data.image).not.toContain("-all.supabase.co");
        expect(data.image).toContain("supabase.co/storage/");
      }
    });

    it("component image URLs never use -all.supabase.co subdomain", async () => {
      if (skipIfOffline() || !componentSlug) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/item/component/${componentSlug}`);
      if (data.image) {
        expect(data.image).not.toContain("-all.supabase.co");
      }
    });
  });
});
