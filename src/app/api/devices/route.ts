import { NextRequest, NextResponse } from "next/server";
import { isValidLicenseKeyFormat } from "@/lib/license";
import { getLicenseByKey, getDevices } from "@/lib/license-db";

export const dynamic = "force-dynamic";

/**
 * POST /api/devices
 * 
 * Body: { license_key: string, device_id?: string }
 * 
 * Returns list of active devices for the license.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const licenseKey = (body.license_key || "").trim().toUpperCase();
    
    if (!licenseKey || !isValidLicenseKeyFormat(licenseKey)) {
      return NextResponse.json({ success: false, error: "License key tidak valid" }, { status: 400 });
    }
    
    const license = await getLicenseByKey(licenseKey);
    if (!license) {
      return NextResponse.json({ success: false, error: "License tidak ditemukan" }, { status: 404 });
    }
    
    if (license.status !== "active") {
      return NextResponse.json({ success: false, error: "License telah dicabut" }, { status: 403 });
    }
    
    const devices = await getDevices(licenseKey);
    
    return NextResponse.json({
      success: true,
      devices,
      max_devices: license.max_devices,
      active_devices: license.active_devices,
    });
  } catch (e) {
    console.error("Devices API error:", e);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan" }, { status: 500 });
  }
}
