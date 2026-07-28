import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "download", "aura_library");
    const progressPath = path.join(dir, "_meta", "artifact_progress.json");
    const logPath = path.join(dir, "_meta", "artifact_generator.log");

    let progress: any = null;
    try {
      const raw = await fs.readFile(progressPath, "utf-8");
      progress = JSON.parse(raw);
    } catch {
      // File doesn't exist — that's OK
    }

    let log = "";
    try {
      const raw = await fs.readFile(logPath, "utf-8");
      log = raw
        .split("\n")
        .filter((l) => l.trim())
        .slice(-30)
        .join("\n");
    } catch {
      // No log file
    }

    return NextResponse.json({
      progress,
      log: log ? log.split("\n") : [],
    });
  } catch (e: any) {
    console.error("[progress API] Error:", e?.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
