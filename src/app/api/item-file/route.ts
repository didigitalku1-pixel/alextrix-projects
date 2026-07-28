import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  SUPA_URL,
  SUPA_ANON_KEY,
  getTable,
  fetchWithTimeout,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Read item code/content from local manifest files as fallback.
 * Manifest contains skill content but NOT template/component code.
 */
async function getContentFromManifest(
  type: string,
  file: string,
  artifact: string,
): Promise<string | null> {
  try {
    // Skills have content in skills-manifest.json
    if (type === "skill" && artifact === "content") {
      const skillsPath = path.join(
        process.cwd(),
        "download",
        "aura_library",
        "skills-manifest.json",
      );
      const raw = await fs.readFile(skillsPath, "utf-8");
      const manifest = JSON.parse(raw);
      const skill = manifest.items?.find(
        (i: any) => i.file === file || i.id === file,
      );
      return skill?.content || null;
    }

    // Templates and components: try reading from local file
    // (only available if scraped data exists in download/aura_library/)
    if (
      (type === "template" || type === "component") &&
      (artifact === "code" || artifact === "design_md" || artifact === "recreation_prompt")
    ) {
      const subdir = type === "component" ? "components" : "templates";

      if (artifact === "code") {
        const fullPath = path.join(
          process.cwd(),
          "download",
          "aura_library",
          subdir,
          `${file}.json`,
        );
        const raw = await fs.readFile(fullPath, "utf-8");
        const data = JSON.parse(raw);
        return data.code || null;
      } else if (artifact === "design_md") {
        const fullPath = path.join(
          process.cwd(),
          "download",
          "aura_library",
          subdir,
          `${file}.design.md`,
        );
        return await fs.readFile(fullPath, "utf-8");
      } else if (artifact === "recreation_prompt") {
        const fullPath = path.join(
          process.cwd(),
          "download",
          "aura_library",
          subdir,
          `${file}.prompt.md`,
        );
        return await fs.readFile(fullPath, "utf-8");
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const type = p.get("type");
  const file = p.get("file");
  const artifact = p.get("artifact");

  if (!type || !file || !artifact) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Validate type
  if (!["component", "template", "asset", "skill"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Validate artifact
  if (!["code", "design_md", "recreation_prompt", "content"].includes(artifact)) {
    return NextResponse.json({ error: "Invalid artifact" }, { status: 400 });
  }

  // Extract numeric ID from file (for templates/components/assets with format "000123_slug")
  // Skills use a different format "skill-name_uuid_prefix" and don't need numeric ID
  const idMatch = file.match(/^0*(\d+)_/);
  const itemId = idMatch ? parseInt(idMatch[1], 10) : null;

  // Validate file format based on type
  if (type !== "skill" && !itemId) {
    return NextResponse.json({ error: "Invalid file format" }, { status: 400 });
  }
  // For skill, file can be any non-empty string (UUID-based)
  if (type === "skill" && file.length > 200) {
    return NextResponse.json({ error: "File too long" }, { status: 400 });
  }

  try {
    // === CODE: fetch HTML from Supabase ===
    if (artifact === "code") {
      const table = getTable(type); // shared_code for templates in Aura, components for components
      let r: Response | null = null;
      try {
        r = await fetchWithTimeout(
          `${SUPA_URL}/rest/v1/${table}?select=code&id=eq.${itemId}&limit=1`,
          {
            headers: {
              apikey: SUPA_ANON_KEY,
              Authorization: `Bearer ${SUPA_ANON_KEY}`,
            },
          },
          10000,
        );
      } catch {
        // Network error — try manifest fallback
      }

      if (r && r.ok) {
        const data = await r.json();
        if (data && data.length > 0 && data[0].code) {
          return new NextResponse(data[0].code, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
      }

      // Fallback: try local manifest file
      const fallbackCode = await getContentFromManifest(type, file, artifact);
      if (fallbackCode) {
        return new NextResponse(fallbackCode, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      if (r && !r.ok && r.status !== 404) {
        return NextResponse.json(
          { error: "Failed", available: false },
          { status: 502 },
        );
      }
      return NextResponse.json(
        { error: "Not found", available: false },
        { status: 404 },
      );
    }

    // === DESIGN.md / Copy Prompt: try user's design_md table first ===
    if (artifact === "design_md" || artifact === "recreation_prompt") {
      let r: Response | null = null;
      try {
        r = await fetchWithTimeout(
          `${SUPA_URL}/rest/v1/design_md?select=content&template_id=eq.${itemId}&artifact_type=eq.${encodeURIComponent(artifact)}&limit=1`,
          {
            headers: {
              apikey: SUPA_ANON_KEY,
              Authorization: `Bearer ${SUPA_ANON_KEY}`,
            },
          },
          10000,
        );
      } catch {
        // Network error — try manifest fallback
      }

      if (r && r.ok) {
        const data = await r.json();
        if (
          data &&
          data.length > 0 &&
          data[0].content &&
          data[0].content.length > 50
        ) {
          return new NextResponse(data[0].content, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
      }

      // Fallback: try local file
      const fallbackContent = await getContentFromManifest(type, file, artifact);
      if (fallbackContent && fallbackContent.length > 50) {
        return new NextResponse(fallbackContent, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }

      // 3. Not in database — return 404 (client will show "not generated yet")
      return NextResponse.json(
        { error: "Artifact not generated yet", available: false },
        { status: 404 },
      );
    }

    // === Skill content: fetch from user's Supabase ===
    if (artifact === "content" && type === "skill") {
      // Look up full UUID from skills-manifest.json
      let fullSkillId = file;
      try {
        const skillsPath = path.join(
          process.cwd(),
          "download",
          "aura_library",
          "skills-manifest.json",
        );
        const raw = await fs.readFile(skillsPath, "utf-8");
        const skillsManifest = JSON.parse(raw);
        // EXACT match only (security: no fuzzy matching)
        const skill = skillsManifest.items?.find(
          (i: any) => i.file === file || i.id === file,
        );
        if (skill) {
          fullSkillId = skill.id;
          // Skills-manifest already contains content - return it directly!
          if (skill.content) {
            return new NextResponse(skill.content, {
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            });
          }
        }
      } catch {
        // ignore — fall through with original file value
      }

      let r: Response | null = null;
      try {
        r = await fetchWithTimeout(
          `${SUPA_URL}/rest/v1/skills?select=content&id=eq.${encodeURIComponent(fullSkillId)}&limit=1`,
          {
            headers: {
              apikey: SUPA_ANON_KEY,
              Authorization: `Bearer ${SUPA_ANON_KEY}`,
            },
          },
          10000,
        );
      } catch {
        // Network error — try manifest fallback
      }

      if (r && r.ok) {
        const data = await r.json();
        if (data && data.length > 0 && data[0].content) {
          return new NextResponse(data[0].content, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
      }

      // Fallback: try manifest (already attempted above, but double-check)
      const fallbackContent = await getContentFromManifest(type, file, artifact);
      if (fallbackContent) {
        return new NextResponse(fallbackContent, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }

      return NextResponse.json(
        { error: "Not found", available: false },
        { status: 404 },
      );
    }

    return NextResponse.json({ error: "Invalid artifact" }, { status: 400 });
  } catch (e: any) {
    console.error("[item-file API] Unhandled error:", e?.message);
    return NextResponse.json(
      { error: "Internal server error", available: false },
      { status: 500 },
    );
  }
}
