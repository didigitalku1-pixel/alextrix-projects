/**
 * Unit tests for pure utility functions.
 *
 * These tests don't hit the network — they validate logic.
 */

import { describe, it, expect } from "vitest";

// Re-implement the same fixImage function used in API routes
function fixImage(url: string | null): string | null {
  if (!url) return null;
  return url.replace("hoirqrkdgbmvpwutwuwj-all.supabase.co", "hoirqrkdgbmvpwutwuwj.supabase.co");
}

// Re-implement the file-naming convention used in API routes
function makeFile(id: number, slug: string, type: string): string {
  const pad = type === "asset" ? 8 : 6;
  return `${String(id).padStart(pad, "0")}_${slug || id}`;
}

describe("fixImage — subdomain fix utility", () => {
  it("returns null for null input", () => {
    expect(fixImage(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(fixImage("")).toBeNull();
  });

  it("replaces -all subdomain with regular subdomain", () => {
    const input = "https://hoirqrkdgbmvpwutwuwj-all.supabase.co/storage/v1/object/public/preview-images/test.jpg";
    const out = fixImage(input);
    expect(out).toBe("https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/preview-images/test.jpg");
    expect(out).not.toContain("-all.supabase.co");
  });

  it("preserves URLs that already use the correct subdomain", () => {
    const input = "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/preview-images/test.jpg";
    expect(fixImage(input)).toBe(input);
  });

  it("preserves URLs that are not from supabase", () => {
    const input = "https://example.com/image.jpg";
    expect(fixImage(input)).toBe(input);
  });

  it("handles URLs with query strings", () => {
    const input = "https://hoirqrkdgbmvpwutwuwj-all.supabase.co/storage/v1/object/public/preview-images/test.png?t=1234567890";
    const out = fixImage(input);
    expect(out).toContain("?t=1234567890");
    expect(out).not.toContain("-all.supabase.co");
  });
});

describe("makeFile — file naming convention", () => {
  it("pads template ID to 6 digits", () => {
    expect(makeFile(73, "rkB4w3", "template")).toBe("000073_rkB4w3");
  });

  it("pads component ID to 6 digits", () => {
    expect(makeFile(1417, "CB0A1", "component")).toBe("001417_CB0A1");
  });

  it("pads asset ID to 8 digits", () => {
    expect(makeFile(42, "test-asset", "asset")).toBe("00000042_test-asset");
  });

  it("uses ID as fallback when slug is missing", () => {
    expect(makeFile(100, "", "template")).toBe("000100_100");
  });

  it("handles large IDs without overflow", () => {
    expect(makeFile(21450, "auragen", "template")).toBe("021450_auragen");
  });
});

describe("SELECT_MAP — column inventory per type", () => {
  // Mirror of SELECT_MAP from src/app/api/item/[type]/[id]/route.ts
  const SELECT_MAP: Record<string, { table: string; select: string; requiredColumns: string[]; forbiddenColumns: string[] }> = {
    template: {
      table: "templates",
      select: "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,username,created_at",
      requiredColumns: ["id", "slug", "title", "username", "created_at"],
      forbiddenColumns: ["background", "created_by", "keywords", "image_1600w"],
    },
    component: {
      table: "components",
      select: "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,background,created_by,created_at",
      requiredColumns: ["id", "slug", "title", "background", "created_by", "created_at"],
      forbiddenColumns: ["username", "category", "keywords", "image_1600w"],
    },
    asset: {
      table: "assets",
      select: "id,slug,title,description,keywords,image_1600w,image_800w,image_320w,views,media_type,resolution,colors,created_at",
      requiredColumns: ["id", "slug", "title", "keywords", "image_1600w", "media_type"],
      forbiddenColumns: ["username", "background", "code", "forks", "premium"],
    },
    skill: {
      table: "skills",
      select: "id,title,description,content,tags,views,forks,created_at",
      requiredColumns: ["id", "title", "content", "tags"],
      forbiddenColumns: ["slug", "username", "image_url", "background", "premium", "featured"],
    },
  };

  for (const [type, config] of Object.entries(SELECT_MAP)) {
    describe(`${type} SELECT clause`, () => {
      const selectCols = config.select.split(",");

      it("includes all required columns", () => {
        for (const col of config.requiredColumns) {
          expect(selectCols, `${type} SELECT missing column: ${col}`).toContain(col);
        }
      });

      it("does NOT include forbidden columns (would cause 400 from Supabase)", () => {
        for (const col of config.forbiddenColumns) {
          expect(selectCols, `${type} SELECT should not include ${col} (column doesn't exist in ${config.table})`).not.toContain(col);
        }
      });

      it("has no duplicate columns", () => {
        const unique = new Set(selectCols);
        expect(unique.size, `Duplicate columns in ${type} SELECT`).toBe(selectCols.length);
      });

      it("has no empty column entries", () => {
        for (const col of selectCols) {
          expect(col.trim().length, `Empty column in ${type} SELECT`).toBeGreaterThan(0);
        }
      });
    });
  }
});

describe("Skill manifest sanity checks", () => {
  it("skills-manifest.json structure is valid (when present)", async () => {
    // Read the committed manifest file directly
    try {
      const { promises: fs } = await import("fs");
      const path = await import("path");
      const manifestPath = path.join(process.cwd(), "download", "aura_library", "skills-manifest.json");
      const raw = await fs.readFile(manifestPath, "utf-8");
      const data = JSON.parse(raw);

      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.items.length).toBe(118);

      // Each skill should have required fields
      for (const skill of data.items) {
        expect(skill.id, `Skill missing id`).toBeDefined();
        expect(skill.title, `Skill ${skill.id} missing title`).toBeDefined();
        expect(skill.file, `Skill ${skill.id} missing file`).toBeDefined();
        expect(skill.content, `Skill ${skill.id} missing content`).toBeDefined();
      }

      // After our rebuild-skills-manifest.py fix, most skills should have tags
      const skillsWithTags = data.items.filter((s: any) => Array.isArray(s.tags) && s.tags.length > 0);
      expect(skillsWithTags.length, "Most skills should have tags extracted from frontmatter").toBeGreaterThan(100);
    } catch (e: any) {
      // If the file doesn't exist (CI without checkout), skip
      if (e.code === "ENOENT") return;
      throw e;
    }
  });
});

describe("Learn page manifest", () => {
  it("all learn page IDs are valid slugs", async () => {
    // Mirror of LEARN_PAGES
    const LEARN_PAGES = [
      "introduction",
      "tips-for-prompting",
      "how-to-prompt",
      "how-to-design",
      "seo-settings",
      "faq",
      "custom-domain",
      "video-tutorials",
      "documentation",
    ];

    // All slugs should be URL-safe (lowercase, hyphens, alphanumeric)
    for (const slug of LEARN_PAGES) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }

    // No duplicates
    const unique = new Set(LEARN_PAGES);
    expect(unique.size).toBe(LEARN_PAGES.length);
  });
});
