import { NextRequest, NextResponse } from "next/server";
import { isValidLicenseKeyFormat, createSignedCookie, COOKIE_NAME, COOKIE_MAX_AGE, generateDeviceId } from "@/lib/license";
import { activateDevice } from "@/lib/license-db";

export const dynamic = "force-dynamic";

/**
 * POST /api/activate
 * 
 * Body: { license_key: string, device_id?: string, device_name?: string }
 * 
 * Returns: { success: boolean, error?: string }
 * Sets: signed cookie on success
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const licenseKey = (body.license_key || "").trim().toUpperCase();
    let deviceId = body.device_id;
    const deviceName = body.device_name;
    
    // 1. Validate format
    if (!licenseKey || !isValidLicenseKeyFormat(licenseKey)) {
      return NextResponse.json(
        { success: false, error: "Format license key tidak valid. Contoh: ALX-XXXX-XXXX-XXXX-XXXX" },
        { status: 400 },
      );
    }
    
    // 2. Generate device ID if not provided
    if (!deviceId) {
      deviceId = generateDeviceId();
    }
    
    // 3. Get user agent + IP for logging
    const userAgent = req.headers.get("user-agent") || "";
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "";
    
    // 4. Activate device
    const result = await activateDevice(licenseKey, deviceId, deviceName, userAgent, ipAddress);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 403 },
      );
    }
    
    // 5. Create signed cookie (async — Web Crypto API)
    const cookieValue = await createSignedCookie(licenseKey, deviceId);
    
    // 6. Set cookie + return device_id for client to store
    const response = NextResponse.json({
      success: true,
      device_id: deviceId,
      license: {
        key: licenseKey,
        email: result.license?.email,
        max_devices: result.license?.max_devices,
        active_devices: result.license?.active_devices,
      },
    });
    
    response.cookies.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    
    return response;
  } catch (e) {
    console.error("Activation error:", e);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan. Coba lagi." },
      { status: 500 },
    );
  }
}
