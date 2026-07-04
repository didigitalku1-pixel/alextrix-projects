import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/**
 * Generates a branded SVG thumbnail for items without images (skills, etc.).
 * Visually distinct: gradient background, skill icon, title initials, tag chips.
 *
 * Usage: /api/skill-thumb?title=UI+Design+System&tags=design,ui,css
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const title = (p.get("title") || "Skill").slice(0, 80);
  const tagsRaw = p.get("tags") || "";
  const tags = tagsRaw.split(",").map(t => t.trim()).filter(Boolean).slice(0, 4);

  // Derive initials from title
  const initials = title
    .split(/\s+/)
    .slice(0, 3)
    .map(w => w[0]?.toUpperCase() || "")
    .join("");

  // Stable gradient based on title hash
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 40) % 360;

  // Build tag chips SVG
  const tagChips = tags
    .map((tag, i) => {
      const x = 20 + i * 90;
      const label = tag.length > 12 ? tag.slice(0, 11) + "…" : tag;
      return `
        <g transform="translate(${x}, 180)">
          <rect width="${label.length * 7 + 20}" height="22" rx="11" fill="rgba(255,255,255,0.18)"/>
          <text x="${(label.length * 7 + 20) / 2}" y="15" text-anchor="middle"
                font-family="ui-sans-serif, system-ui, sans-serif" font-size="11"
                fill="rgba(255,255,255,0.95)" font-weight="500">${escapeXml(label)}</text>
        </g>`;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue1}, 65%, 45%)"/>
      <stop offset="100%" stop-color="hsl(${hue2}, 70%, 35%)"/>
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.08)"/>
    </pattern>
  </defs>
  <rect width="400" height="240" fill="url(#g)"/>
  <rect width="400" height="240" fill="url(#dots)"/>

  <!-- Skill icon (gear-like) -->
  <g transform="translate(20, 24)" opacity="0.85">
    <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
    <circle cx="20" cy="20" r="6" fill="rgba(255,255,255,0.85)"/>
    <g stroke="rgba(255,255,255,0.5)" stroke-width="1.5">
      <line x1="20" y1="2" x2="20" y2="8"/>
      <line x1="20" y1="32" x2="20" y2="38"/>
      <line x1="2" y1="20" x2="8" y2="20"/>
      <line x1="32" y1="20" x2="38" y2="20"/>
      <line x1="7" y1="7" x2="11" y2="11"/>
      <line x1="29" y1="29" x2="33" y2="33"/>
      <line x1="7" y1="33" x2="11" y2="29"/>
      <line x1="29" y1="11" x2="33" y2="7"/>
    </g>
  </g>

  <!-- "SKILL" badge -->
  <g transform="translate(70, 30)">
    <rect width="50" height="20" rx="4" fill="rgba(255,255,255,0.2)"/>
    <text x="25" y="14" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif"
          font-size="10" fill="white" font-weight="700" letter-spacing="0.1em">SKILL</text>
  </g>

  <!-- Initials block -->
  <text x="200" y="120" text-anchor="middle"
        font-family="ui-sans-serif, system-ui, sans-serif" font-size="56"
        fill="rgba(255,255,255,0.95)" font-weight="700" letter-spacing="-0.04em">${escapeXml(initials || "AI")}</text>

  <!-- Title -->
  <text x="200" y="160" text-anchor="middle"
        font-family="ui-sans-serif, system-ui, sans-serif" font-size="14"
        fill="rgba(255,255,255,0.85)" font-weight="500">${escapeXml(title.length > 50 ? title.slice(0, 48) + "…" : title)}</text>

  <!-- Tag chips -->
  ${tagChips}
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
