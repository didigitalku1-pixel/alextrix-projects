import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login
 *
 * Body: { token: string }
 *
 * Verifies admin token against ADMIN_TOKEN env var.
 * If valid, sets HttpOnly cookie `alextrix_admin` (24h expiry).
 * Cookie is HttpOnly (XSS-safe), Secure, SameSite=Lax.
 *
 * This is the ONLY way to set the admin cookie.
 * Token is NEVER accepted via URL query param (?token=) for security.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const submittedToken = (body.token || "").trim();

    const expected = process.env.ADMIN_TOKEN;
    if (!expected) {
      return NextResponse.json(
        { success: false, error: "Admin panel not configured (ADMIN_TOKEN env var missing)" },
        { status: 503 },
      );
    }

    if (!submittedToken || submittedToken !== expected) {
      // Constant-time-ish delay to slow brute force (not real constant-time, but better than nothing)
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ success: false, error: "Token tidak valid" }, { status: 401 });
    }

    // Token is valid — set HttpOnly cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("alextrix_admin", submittedToken, {
      httpOnly: true,
      secure: true, // always Secure (Vercel is always HTTPS)
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
