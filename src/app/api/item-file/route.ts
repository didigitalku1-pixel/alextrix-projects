import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SUPA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Cache for session JWT
let _sessionCache: any = null;
let _sessionTime = 0;

async function getSession() {
  const now = Date.now();
  if (_sessionCache && now - _sessionTime < 300000) return _sessionCache;

  // Try filesystem first (local Bun server)
  try {
    const sessionPath = path.join(process.cwd(), "download", "aura_library", "_meta", "session.json");
    const raw = await fs.readFile(sessionPath, "utf-8");
    _sessionCache = JSON.parse(raw);
    _sessionTime = now;
    return _sessionCache;
  } catch {
    // Filesystem not available (Vercel) - use env var
  }

  // Use env var (Vercel deployment)
  const refreshToken = process.env.AURA_REFRESH_TOKEN;
  if (!refreshToken) return null;

  // Refresh token to get access token
  const session = await refreshTokenInternal(refreshToken);
  if (session) {
    _sessionCache = session;
    _sessionTime = now;
  }
  return session;
}

async function refreshTokenInternal(refreshToken: string) {
  try {
    const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      user: { id: data.user?.id, email: data.user?.email },
    };
  } catch {
    return null;
  }
}

async function refreshToken(refreshToken: string) {
  try {
    const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    // Save refreshed session
    const sessionPath = path.join(process.cwd(), "download", "aura_library", "_meta", "session.json");
    const session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      user: { id: data.user?.id, email: data.user?.email },
    };
    await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));
    _sessionCache = session;
    _sessionTime = Date.now();
    return session;
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

  // Extract numeric ID from file (e.g., "000073_rkB4w3" → 73)
  const idMatch = file.match(/^0*(\d+)_/);
  const itemId = idMatch ? parseInt(idMatch[1], 10) : null;

  try {
    // === CODE artifact: fetch from Supabase ===
    if (artifact === "code") {
      const table = type === "component" ? "components" : "shared_code";
      const r = await fetch(
        `${SUPA_URL}/rest/v1/${table}?select=code&id=eq.${itemId}&limit=1`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
      );
      if (!r.ok) {
        return NextResponse.json({ error: "Failed to fetch", available: false }, { status: 502 });
      }
      const data = await r.json();
      if (!data || data.length === 0) {
        return NextResponse.json({ error: "Not found", available: false }, { status: 404 });
      }
      const code = data[0].code || "";
      return new NextResponse(code, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // === DESIGN.md / Copy Prompt: try filesystem first, then generate via Edge Function ===
    if (artifact === "design_md" || artifact === "recreation_prompt") {
      // 1. Try local filesystem (works on local Bun server)
      const subdir = type === "component" ? "components" : "templates";
      const ext = artifact === "design_md" ? "design.md" : "prompt.md";
      const filePath = path.join(process.cwd(), "download", "aura_library", subdir, `${file}.${ext}`);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        if (content && content.length > 10) {
          return new NextResponse(content, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
      } catch {
        // File doesn't exist, try Edge Function
      }

      // 2. Generate via Aura's Edge Function (works on Vercel too)
      const session = await getSession();
      if (!session || !session.access_token) {
        return NextResponse.json(
          { error: "Session not available for generation", available: false },
          { status: 404 }
        );
      }

      // Check token expiry
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now + 60) {
        // Token expired, try refresh
        if (session.refresh_token) {
          const refreshed = await refreshToken(session.refresh_token);
          if (!refreshed) {
            return NextResponse.json(
              { error: "Token expired, cannot refresh", available: false },
              { status: 401 }
            );
          }
        }
      }

      // Call Edge Function
      const sourceType = type === "component" ? "shared_code" : "shared_code";
      const r = await fetch(`${SUPA_URL}/functions/v1/generate-template-artifact`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${_sessionCache?.access_token || session.access_token}`,
          apikey: ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceType: sourceType,
          sourceId: itemId,
          artifact: artifact,
          forceRegenerate: false,
        }),
      });

      if (!r.ok) {
        const errText = await r.text();
        return NextResponse.json(
          { error: `Edge Function failed: ${r.status}`, detail: errText.substring(0, 200), available: false },
          { status: r.status }
        );
      }

      const result = await r.json();
      let content = "";
      if (artifact === "design_md") {
        content = result.designMarkdown || result.content || "";
      } else {
        content = result.recreationPrompt || result.content || "";
      }

      if (!content.trim()) {
        return NextResponse.json(
          { error: "Empty content from Edge Function", available: false },
          { status: 500 }
        );
      }

      // Try to save to filesystem for future use (won't work on Vercel but that's OK)
      try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
      } catch {
        // Ignore filesystem errors (Vercel read-only)
      }

      return new NextResponse(content, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // === Skill content ===
    if (artifact === "content" && type === "skill") {
      const skillId = file.split("_").pop() || file;
      const r = await fetch(
        `${SUPA_URL}/rest/v1/skills?select=content&id=eq.${encodeURIComponent(skillId)}&limit=1`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
      );
      if (!r.ok) {
        return NextResponse.json({ error: "Failed", available: false }, { status: 502 });
      }
      const data = await r.json();
      if (!data || data.length === 0) {
        return NextResponse.json({ error: "Not found", available: false }, { status: 404 });
      }
      return new NextResponse(data[0].content || "", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return NextResponse.json({ error: "Invalid artifact" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, available: false }, { status: 500 });
  }
}
