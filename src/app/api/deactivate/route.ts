import { NextRequest, NextResponse } from "next/server";
import { verifySignedCookie, COOKIE_NAME, isValidLicenseKeyFormat } from "@/lib/license";
import { deactivateDevice, getLicenseByKey } from "@/lib/license-db";

export const dynamic = "force-dynamic";

/**
 * POST /api/deactivate
 *
 * Two modes:
 *
 * 1. Cookie-based (used from inside the app):
 *    Body: { device_id?: string }
 *    Requires valid alextrix_license cookie.
 *    Deactivates the device in the cookie (or the device_id in body if provided).
 *    Clears the cookie after deactivation.
 *
 * 2. License-key-based (used from /manage page when not logged in):
 *    Body: { license_key: string, device_id: string }
 *    No cookie required — caller must prove they own the license key.
 *    This is safe because the license key is the secret sent via email.
 *    Does NOT clear the cookie (caller doesn't have one).
 *
 * Mode is auto-detected: if `license_key` is in body, use mode 2.
 * Otherwise, fall back to mode 1 (cookie).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // === Mode 2: License-key-based (no cookie required) ===
    if (body.license_key && body.device_id) {
      const licenseKey = String(body.license_key).trim().toUpperCase();
      const deviceId = String(body.device_id);

      if (!isValidLicenseKeyFormat(licenseKey)) {
        return NextResponse.json({ success: false, error: "License key tidak valid" }, { status: 400 });
      }

      // Verify the license exists + is active
      const license = await getLicenseByKey(licenseKey);
      if (!license) {
        return NextResponse.json({ success: false, error: "License tidak ditemukan" }, { status: 404 });
      }
      if (license.status !== "active") {
        return NextResponse.json({ success: false, error: "License telah dicabut" }, { status: 403 });
      }

      const result = await deactivateDevice(licenseKey, deviceId);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    // === Mode 1: Cookie-based (fallback) ===
    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    if (!cookie) {
      return NextResponse.json({ success: false, error: "Tidak ada sesi aktif. Masukkan license key di body." }, { status: 401 });
    }

    const decoded = await verifySignedCookie(cookie);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid" }, { status: 401 });
    }

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
