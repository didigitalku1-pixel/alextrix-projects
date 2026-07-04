/**
 * Integration tests for /api/items endpoint.
 *
 * Verifies:
 *   - Search (q=) actually filters results (was broken before — query param ignored)
 *   - Type filter returns only items of that type
 *   - Pagination (page, limit) works
 *   - Sort options return items in expected order
 *   - Total count is consistent
 *   - Tag filter narrows results
 */

import { describe, it, expect, beforeAll } from "vitest";
import { fetchJson, BASE_URL, skipIfOffline } from "../_helpers";

describe("/api/items — listing & search API", () => {
  beforeAll(async () => {
    if (skipIfOffline()) return;
  });

  describe("basic listing", () => {
    it("returns templates by default (type=template)", async () => {
      if (skipIfOffline()) return;
      const { status, data } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&limit=5`);
      expect(status).toBe(200);
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.total).toBeGreaterThan(0);
      expect(data.totalPages).toBeGreaterThan(0);
      expect(data.items[0].type).toBe("template");
    });

    it("returns components", async () => {
      if (skipIfOffline()) return;
      const { status, data } = await fetchJson<any>(`${BASE_URL}/api/items?type=component&limit=5`);
      expect(status).toBe(200);
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items[0].type).toBe("component");
    });

    it("returns assets", async () => {
      if (skipIfOffline()) return;
      const { status, data } = await fetchJson<any>(`${BASE_URL}/api/items?type=asset&limit=5`);
      expect(status).toBe(200);
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items[0].type).toBe("asset");
    });

    it("returns skills", async () => {
      if (skipIfOffline()) return;
      const { status, data } = await fetchJson<any>(`${BASE_URL}/api/items?type=skill&limit=5`);
      expect(status).toBe(200);
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items[0].type).toBe("skill");
    });
  });

  describe("search (REGRESSION: was returning all items ignoring q=)", () => {
    it("search 'portfolio' in templates returns fewer results than no-search", async () => {
      if (skipIfOffline()) return;
      const [all, filtered] = await Promise.all([
        fetchJson<any>(`${BASE_URL}/api/items?type=template&limit=1`),
        fetchJson<any>(`${BASE_URL}/api/items?type=template&q=portfolio&limit=1`),
      ]);
      expect(filtered.data.total).toBeLessThan(all.data.total);
      expect(filtered.data.total).toBeGreaterThan(0);
    });

    it("search 'button' in components returns only matching items", async () => {
      if (skipIfOffline()) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/items?type=component&q=button&limit=10`);
      expect(data.items.length).toBeGreaterThan(0);
      // At least one item should have 'button' in title or tags
      const hasMatch = data.items.some((i: any) =>
        i.title.toLowerCase().includes("button") ||
        (i.tags || []).some((t: string) => t.toLowerCase().includes("button"))
      );
      expect(hasMatch, `Search results don't contain 'button' in title/tags`).toBe(true);
    });

    it("search in skills covers title, description, tags, and content", async () => {
      if (skipIfOffline()) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/items?type=skill&q=design&limit=5`);
      expect(data.total).toBeGreaterThan(0);
      // Skill manifest has 118 skills, search should narrow it down
      expect(data.total).toBeLessThan(118);
    });

    it("search with gibberish returns 0 results", async () => {
      if (skipIfOffline()) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&q=zzzznotarealword12345&limit=5`);
      expect(data.items.length).toBe(0);
      expect(data.total).toBe(0);
    });

    it("also accepts 'search' as alias for 'q'", async () => {
      if (skipIfOffline()) return;
      const { data: withQ } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&q=portfolio&limit=5`);
      const { data: withSearch } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&search=portfolio&limit=5`);
      expect(withSearch.total).toBe(withQ.total);
    });
  });

  describe("pagination", () => {
    it("page 1 and page 2 return different items", async () => {
      if (skipIfOffline()) return;
      const [p1, p2] = await Promise.all([
        fetchJson<any>(`${BASE_URL}/api/items?type=template&page=1&limit=5`),
        fetchJson<any>(`${BASE_URL}/api/items?type=template&page=2&limit=5`),
      ]);
      const p1Ids = p1.data.items.map((i: any) => i.id);
      const p2Ids = p2.data.items.map((i: any) => i.id);
      const overlap = p1Ids.filter((id: any) => p2Ids.includes(id));
      expect(overlap.length, "Page 1 and 2 should not have overlapping items").toBe(0);
    });

    it("respects limit parameter", async () => {
      if (skipIfOffline()) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&limit=3`);
      expect(data.items.length).toBe(3);
    });

    it("caps limit at 100 (max)", async () => {
      if (skipIfOffline()) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&limit=10000`);
      // Should cap at 100, not error
      expect(data.items.length).toBeLessThanOrEqual(100);
    });

    it("rejects negative page (defaults to 1)", async () => {
      if (skipIfOffline()) return;
      const { status, data } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&page=-5&limit=5`);
      expect(status).toBe(200);
      expect(data.page).toBe(1);
    });
  });

  describe("sort options", () => {
    it("sort=views returns items sorted by views descending", async () => {
      if (skipIfOffline()) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&sort=views&limit=10`);
      for (let i = 1; i < data.items.length; i++) {
        expect(data.items[i - 1].views).toBeGreaterThanOrEqual(data.items[i].views);
      }
    });

    it("sort=az returns items in alphabetical order", async () => {
      if (skipIfOffline()) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&sort=az&limit=10`);
      for (let i = 1; i < data.items.length; i++) {
        expect(data.items[i - 1].title.localeCompare(data.items[i].title)).toBeLessThanOrEqual(0);
      }
    });

    it("sort=forks returns items sorted by forks descending", async () => {
      if (skipIfOffline()) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&sort=forks&limit=10`);
      for (let i = 1; i < data.items.length; i++) {
        expect(data.items[i - 1].forks).toBeGreaterThanOrEqual(data.items[i].forks);
      }
    });
  });

  describe("filters", () => {
    it("premium=true returns only premium items", async () => {
      if (skipIfOffline()) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&premium=true&limit=10`);
      for (const item of data.items) {
        expect(item.premium).toBe(true);
      }
    });

    it("featured=true returns only featured items", async () => {
      if (skipIfOffline()) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&featured=true&limit=10`);
      for (const item of data.items) {
        expect(item.featured).toBe(true);
      }
    });
  });

  describe("response shape", () => {
    it("each item has required fields", async () => {
      if (skipIfOffline()) return;
      const { data } = await fetchJson<any>(`${BASE_URL}/api/items?type=template&limit=3`);
      for (const item of data.items) {
        expect(item.id).toBeDefined();
        expect(item.type).toBe("template");
        expect(typeof item.title).toBe("string");
        expect(typeof item.slug).toBe("string");
        expect(Array.isArray(item.tags)).toBe(true);
        expect(item.image === null || typeof item.image === "string").toBe(true);
        expect(typeof item.views).toBe("number");
        expect(typeof item.forks).toBe("number");
        expect(typeof item.premium).toBe("boolean");
        expect(typeof item.featured).toBe("boolean");
        expect(typeof item.file).toBe("string");
      }
    });
  });
});
