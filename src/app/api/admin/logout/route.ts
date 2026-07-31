import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/logout
 *
 * Clears the alextrix_admin cookie.
 * After this, the user must re-enter the admin token to access /admin/licenses again.
 */
export async function POST(_req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set("alextrix_admin", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // immediately expire
    path: "/",
  });
  return response;
}

export async function GET(_req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set("alextrix_admin", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
