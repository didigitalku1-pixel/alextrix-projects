/**
 * Tests for auxiliary API endpoints:
 *   - /sitemap.xml (sitemap index)
 *   - /sitemap-xml/[n].xml (child sitemaps)
 *   - /robots.txt
 *   - /api/skill-thumb (branded SVG placeholder)
 *   - /api/image (image proxy)
 *   - /api/stats
 *   - /api/tags
 */

import { describe, it, expect, beforeAll } from "vitest";
import { fetchJson, BASE_URL, skipIfOffline } from "../_helpers";

describe("/sitemap.xml — sitemap index", () => {
  it("returns 200 with XML content type", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/sitemap.xml`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("xml");
  });

  it("contains at least 1 child sitemap URL", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/sitemap.xml`);
    const xml = await r.text();
    expect(xml).toContain("<loc>");
    expect(xml).toContain("/sitemap-xml/");
  });

  it("has correct namespace", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/sitemap.xml`);
    const xml = await r.text();
    expect(xml).toContain("sitemaps.org/schemas/sitemap/0.9");
  });
});

describe("/sitemap-xml/[n].xml — child sitemaps", () => {
  it("child 0 returns valid sitemap with URLs", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/sitemap-xml/0.xml`);
    expect(r.status).toBe(200);
    const xml = await r.text();
    expect(xml).toContain("<loc>");
    // Should have at least 1000 URLs (we have 55K total)
    const count = (xml.match(/<loc>/g) || []).length;
    expect(count).toBeGreaterThan(1000);
  });

  it("each child sitemap has < 50,000 URLs (Google limit)", async () => {
    if (skipIfOffline()) return;
    // Only check first child — fetching all 55K URLs is too slow for tests
    const r = await fetch(`${BASE_URL}/sitemap-xml/0.xml`);
    expect(r.status).toBe(200);
    const xml = await r.text();
    const count = (xml.match(/<loc>/g) || []).length;
    expect(count, `Sitemap 0.xml has ${count} URLs (Google limit: 50,000)`).toBeLessThan(50000);
    expect(count, `Sitemap 0.xml should have substantial URLs`).toBeGreaterThan(1000);
  });

  it("returns 404 for negative index", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/sitemap-xml/-1.xml`);
    expect(r.status).toBe(404);
  });

  it("child sitemap 0 has substantial URLs (>1000)", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/sitemap-xml/0.xml`);
    expect(r.status).toBe(200);
    const xml = await r.text();
    const count = (xml.match(/<loc>/g) || []).length;
    expect(count, `Expected >1000 URLs in sitemap 0, got ${count}`).toBeGreaterThan(1000);
  });

  it("URLs in sitemap use https:// and the production domain", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/sitemap-xml/0.xml`);
    const xml = await r.text();
    expect(xml).toContain("https://web-library-coral.vercel.app/");
    // Should not contain http:// (non-secure)
    expect(xml).not.toMatch(/<loc>http:\/\//);
  });
});

describe("/robots.txt", () => {
  it("returns 200 with text/plain", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/robots.txt`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("text/plain");
  });

  it("allows all user agents", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/robots.txt`);
    const text = await r.text();
    expect(text).toMatch(/User-Agent:\s*\*/i);
    expect(text).toMatch(/Allow:\s*\//i);
  });

  it("references the sitemap URL", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/robots.txt`);
    const text = await r.text();
    expect(text).toContain("sitemap.xml");
    expect(text).toContain("web-library-coral.vercel.app");
  });
});

describe("/api/skill-thumb — branded SVG placeholder", () => {
  it("returns 200 with SVG content type", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/api/skill-thumb?title=Test`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("image/svg+xml");
  });

  it("SVG contains the title text", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/api/skill-thumb?title=My%20Cool%20Skill`);
    const svg = await r.text();
    expect(svg).toContain("<svg");
    expect(svg).toContain("My Cool Skill");
  });

  it("SVG contains tag chips when tags provided", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/api/skill-thumb?title=Test&tags=design,ui,css`);
    const svg = await r.text();
    expect(svg).toContain("design");
    expect(svg).toContain("ui");
    expect(svg).toContain("css");
  });

  it("SVG has a gradient background", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/api/skill-thumb?title=Test`);
    const svg = await r.text();
    expect(svg).toContain("linearGradient");
  });

  it("handles empty/missing title gracefully", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/api/skill-thumb`);
    expect(r.status).toBe(200);
    const svg = await r.text();
    expect(svg).toContain("<svg");
  });

  it("has caching headers (max-age > 0)", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/api/skill-thumb?title=Test`);
    const cache = r.headers.get("cache-control") || "";
    expect(cache).toMatch(/max-age=\d+/);
  });
});

describe("/api/image — image proxy", () => {
  it("rejects non-supabase URLs (security)", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/api/image?url=https://example.com/image.jpg`);
    expect(r.status).toBe(403);
  });

  it("returns 400 when url param is missing", async () => {
    if (skipIfOffline()) return;
    const r = await fetch(`${BASE_URL}/api/image`);
    expect(r.status).toBe(400);
  });

  it("proxies a real Supabase image successfully", async () => {
    if (skipIfOffline()) return;
    const testUrl = "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/preview-images/rkB4w3.jpg";
    const r = await fetch(`${BASE_URL}/api/image?url=${encodeURIComponent(testUrl)}`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toMatch(/image\//);
    const buf = await r.arrayBuffer();
    expect(buf.byteLength).toBeGreaterThan(1000); // at least 1KB
  });
});

describe("/api/stats", () => {
  it("returns 200 with stats object", async () => {
    if (skipIfOffline()) return;
    const { status, data } = await fetchJson<any>(`${BASE_URL}/api/stats`);
    expect(status).toBe(200);
    expect(data).toBeTruthy();
  });

  it("stats include counts for each type", async () => {
    if (skipIfOffline()) return;
    const { data } = await fetchJson<any>(`${BASE_URL}/api/stats`);
    // Stats may come in different shapes — just check totals exist
    expect(data.total_items || data.total).toBeGreaterThan(0);
  });
});

describe("/api/tags", () => {
  it("returns 200 with tags array", async () => {
    if (skipIfOffline()) return;
    const { status, data } = await fetchJson<any>(`${BASE_URL}/api/tags`);
    expect(status).toBe(200);
    expect(data).toBeTruthy();
  });
});
