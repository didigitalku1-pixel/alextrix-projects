import { NextRequest, NextResponse } from "next/server";
import { verifySignedCookie, COOKIE_NAME } from "@/lib/license";
import { deactivateDevice } from "@/lib/license-db";

export const dynamic = "force-dynamic";

/**
 * POST /api/deactivate
 * 
 * Body: { device_id?: string }
 * 
 * Deactivates the current device (or specified device) from the license.
 * Clears the signed cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    if (!cookie) {
      return NextResponse.json({ success: false, error: "Tidak ada sesi aktif" }, { status: 401 });
    }
    
    const decoded = verifySignedCookie(cookie);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid" }, { status: 401 });
    }
    
    const body = await req.json().catch(() => ({}));
    const deviceId = body.device_id || decoded.deviceId;
    
    const result = await deactivateDevice(decoded.licenseKey, deviceId);
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    
    // Clear cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete(COOKIE_NAME);
    
    return response;
  } catch (e) {
    console.error("Deactivation error:", e);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan" }, { status: 500 });
  }
}
