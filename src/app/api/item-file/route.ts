import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const type = p.get("type");
  const file = p.get("file");
  const artifact = p.get("artifact");
  if (!type || !file || !artifact) return NextResponse.json({ error: "Missing params" }, { status: 400 });
  const subdir = type === "component" ? "components" : type === "asset" ? "assets" : type === "skill" ? "skills" : "templates";
  try {
    if (artifact === "design_md" || artifact === "recreation_prompt") {
      const ext = artifact === "design_md" ? "design.md" : "prompt.md";
      const fp = path.join(process.cwd(), "download", "aura_library", subdir, `${file}.${ext}`);
      const content = await fs.readFile(fp, "utf-8");
      return new NextResponse(content, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    if (artifact === "code") {
      const fp = path.join(process.cwd(), "download", "aura_library", subdir, `${file}.html`);
      const content = await fs.readFile(fp, "utf-8");
      return new NextResponse(content, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    return NextResponse.json({ error: "Invalid artifact" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Not available", available: false }, { status: 404 });
  }
}
